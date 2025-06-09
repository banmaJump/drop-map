from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from services.directions_api import get_best_and_cheapest_routes
from services.route_cache import get_from_cache, save_to_cache

router = APIRouter()

class RouteRequest(BaseModel):
    origin: str
    destination: str
    waypoints: List[str] = []
    departureTime: Optional[str] = Field(None, alias="departure_time")
    stayTimes: Optional[List[int]] = Field(None, alias="stay_times")

    class Config:
        allow_population_by_field_name = True

@router.post('/search_route')
async def search_route(data: RouteRequest):
    origin = data.origin
    destination = data.destination
    waypoints = data.waypoints
    departure_time = data.departureTime
    stay_times = data.stayTimes

    print("フロントから受信したリクエスト:", data)

    if not origin or not destination:
        raise HTTPException(status_code=400, detail="origin and destination are required")

    if stay_times is not None:
        if not waypoints:
            raise HTTPException(status_code=400, detail="stay_times provided but waypoints is empty")
        if len(stay_times) != len(waypoints):
            raise HTTPException(
                status_code=400,
                detail=f"stay_times and waypoints count mismatch: {len(stay_times)} vs {len(waypoints)}"
            )

    try:
        cached = get_from_cache(origin, destination, waypoints)
        if cached:
            # 確認済み。問題なく動くのでコメントアウトした。
            # print("キャッシュヒット時のレスポンス:", cached)
            return cached

        result = get_best_and_cheapest_routes(
            origin,
            destination,
            waypoints,
            departure_time=departure_time,
            stay_times=stay_times or []
        )

        # 確認済み。問題なく動くのでコメントアウトした。
        # print("Page2/フロントへ返すデータ:", result) 

        # キャッシュ保存時にorigin, destinationもマージ
        cache_data = {
            "origin": origin,
            "destination": destination,
            **result  # optimal, cheapestを展開
        }

        save_to_cache(origin, destination, waypoints, cache_data)

        return cache_data

    except Exception as e:
        print("送or受でサーバーエラー:", e)
        raise HTTPException(status_code=500, detail=str(e))
