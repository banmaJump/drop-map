#backend/services/directions_api.py
import requests
import os
from typing import List, Dict, Any, Optional
from services.route_cache import get_from_cache, save_to_cache
from datetime import datetime, timedelta
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
DIRECTIONS_API_URL = "https://maps.googleapis.com/maps/api/directions/json"

def call_directions_api(
    origin: str,
    destination: str,
    waypoints: List[str],
    mode: str,
    departure_time: Optional[str],
    language: str,
) -> Optional[dict]:
    cached = get_from_cache(origin, destination, waypoints)
    if cached:
        return cached

    if departure_time:
        try:
            # Zを+00:00に変換してISOフォーマットパース
            dt_str = departure_time.replace("Z", "+00:00")
            dt = datetime.fromisoformat(dt_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
        except Exception:
            dt = datetime.now(timezone.utc)

        now = datetime.now(timezone.utc)

        if dt < now:
            dt = now

        departure_timestamp = int(dt.timestamp())
    else:
        departure_timestamp = int(datetime.now(timezone.utc).timestamp())


    params = {
        "origin": origin,
        "destination": destination,
        "key": GOOGLE_MAPS_API_KEY,
        "mode": mode,
        "departure_time": departure_timestamp,
        "language": language,
    }
    if waypoints:
        params["waypoints"] = "|".join(waypoints)

    response = requests.get(DIRECTIONS_API_URL, params=params)
    print("Request URL:", response.url)
    if response.status_code != 200:
        print(f"DirectionAPIへの送信エラー: {response.status_code}")
        return None

    data = response.json()
    if data.get("status") != "OK":
        print("DirectionAPIへの受信エラー:", data)
        return None

    save_to_cache(origin, destination, waypoints, data)
    return data

def extract_step_info(steps: List[dict]) -> List[dict]:
    step_info = []
    for step in steps:
        travel_mode = step.get("travel_mode", "")
        duration = step.get("duration", {}).get("value", 0)
        instruction = step.get("html_instructions", "")

        transit = step.get("transit_details")
        if transit:
            line = transit.get("line", {})
            transit_mode = line.get("vehicle", {}).get("type", "").upper() if line.get("vehicle") else travel_mode.upper()
            step_info.append({
                "type": "transit",
                "transit_mode": transit_mode,
                "line_name": line.get("name", ""),
                "start_station": transit.get("departure_stop", {}).get("name", ""),
                "end_station": transit.get("arrival_stop", {}).get("name", ""),
                "departure_time": "",
                "arrival_time": "",
                "num_stops": transit.get("num_stops", 0),
                "duration": duration,
                "price": transit.get("fare", {}).get("value", 0)
            })
        else:
            step_info.append({
                "type": "walk",
                "instruction": instruction,
                "duration": duration,
                "departure_time": "",
                "arrival_time": "",
            })
    return step_info

def get_segments(
    route_data: dict,
    stay_times: Optional[List[int]] = None,
    initial_departure_time: Optional[str] = None
) -> List[dict]:
    segments = []
    legs = route_data.get("routes", [])[0].get("legs", [])
    stay_times = stay_times or []

    current_time = None
    if initial_departure_time:
        try:
            current_time = datetime.fromisoformat(initial_departure_time)
        except Exception:
            current_time = None

    for i, leg in enumerate(legs):
        move_duration = leg["duration"]["value"]
        stay_duration = stay_times[i] * 60 if i < len(stay_times) else 0
        total_duration = move_duration + stay_duration

        steps = leg.get("steps", [])
        step_info = extract_step_info(steps)

        departure_time_str = ""
        arrival_time_str = ""

        if current_time:
            departure_time_str = current_time.strftime("%H:%M")
            arrival_time = current_time + timedelta(seconds=move_duration)
            arrival_time_str = arrival_time.strftime("%H:%M")
            current_time = arrival_time + timedelta(seconds=stay_duration)

            step_start_time = datetime.strptime(departure_time_str, "%H:%M")
            for step in step_info:
                step_duration = step.get("duration", 0)
                step_end_time = step_start_time + timedelta(seconds=step_duration)
                step["departure_time"] = step_start_time.strftime("%H:%M")
                step["arrival_time"] = step_end_time.strftime("%H:%M")
                step_start_time = step_end_time

        total_price = sum(
            step.get("price", 0)
            for step in step_info
            if step["type"] == "transit"
        )

        segments.append({
            "start_address": leg.get("start_address", ""),
            "end_address": leg.get("end_address", ""),
            "from": extract_last_place_name(leg.get("start_address", "")),
            "to": extract_last_place_name(leg.get("end_address", "")),
            "mode": steps[0].get("travel_mode", "").lower() if steps else "unknown",
            "move_duration": move_duration,
            "stay_duration": stay_duration,
            "duration": total_duration,
            "departure_time": departure_time_str,
            "arrival_time": arrival_time_str,
            "total_price": total_price,
            "step_info": step_info
        })
    print(f"[DEBUG] stay_times: {stay_times}, index: {i}")

    return segments

def generate_route_name(origin: str, waypoints: List[str], destination: str) -> str:
    return " → ".join([origin] + waypoints + [destination])

import re

def contains_japanese(text: str) -> bool:
    # 漢字、ひらがな、カタカナのUnicode範囲で判定
    return bool(re.search(r'[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', text))

def extract_last_place_name(address: str) -> str:
    if not address:
        return "そんな場所知らん。"
    
    parts = address.strip().split()

    if contains_japanese(address):
        # 日本語住所 → 最後の単語を返す
        return parts[-1]
    else:
        # 日本語以外 → 最初の2単語を返す（単語が1つならそれだけ）
        return " ".join(parts[:3]) if len(parts) >= 2 else parts[0]


def build_combined_route(
    origin: str,
    destination: str,
    transit_segments: List[dict],
    walking_segments: List[dict]
) -> Dict[str, Any]:
    combined_legs = []
    for t_seg, w_seg in zip(transit_segments, walking_segments):
        if w_seg["move_duration"] < t_seg["move_duration"] or (w_seg["move_duration"] - t_seg["move_duration"]) <= 900:
            combined_legs.append(w_seg)
        else:
            combined_legs.append(t_seg)

    total_duration = sum(seg["duration"] for seg in combined_legs)
    total_price = sum(seg.get("total_price", 0) for seg in combined_legs)

    return {
        "from": origin,
        "to": destination,
        "segments": combined_legs,
        "total_time": total_duration,
        "total_price": total_price,
    }

def get_best_and_cheapest_routes(
    origin: str,
    destination: str,
    waypoints: List[str],
    departure_time: Optional[str],
    stay_times: Optional[List[int]] = None,
    language: str = "ja",
) -> Dict[str, Any]:
    stay_times = stay_times or []

    # transitモードはwaypointsがちょうど2つのときだけ利用（API仕様に合わせる）
    if len(waypoints) == 2:
        transit_data = call_directions_api(origin, destination, waypoints, "transit", departure_time, language)
    else:
        transit_data = None

    walking_data = call_directions_api(origin, destination, waypoints, "walking", departure_time, language)

    # transitデータがなければwalkingデータで代替
    if not transit_data:
        if walking_data:
            transit_data = walking_data
        else:
            raise Exception("公共交通機関ルートも徒歩ルートも取得できませんでした")

    if not walking_data:
        walking_data = transit_data

    transit_segments = get_segments(transit_data, stay_times, departure_time)
    walking_segments = get_segments(walking_data, stay_times, departure_time)

    if len(transit_segments) != len(walking_segments):
        walking_segments = transit_segments

    cheapest_route = build_combined_route(origin, destination, transit_segments, walking_segments)
    route_name = generate_route_name(origin, waypoints, destination)

    return {
        "route_name": route_name,
        "optimal": {
            "segments": transit_segments,
            "total_time": sum(seg["duration"] for seg in transit_segments),
            "total_cost": sum(seg.get("total_price", 0) for seg in transit_segments),
        },
        "cheapest": cheapest_route,
    }
