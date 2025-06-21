// frontend/src/api/routeApi.ts
import axios from 'axios';
import type { RouteRequest, RouteResult, RouteDataWithTime, RouteSegment, TransportMode } from '../types/route';
const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || '';
import i18n from '../i18n';

// バックエンドAPIレスポンスの型定義
interface ApiSegment {
  id: number;
  mode: string;
  from: string;
  to: string;
  departure_time: string;  // ISO8601タイムゾーン付き文字列想定
  arrival_time: string;
  move_duration?: number;
  stay_duration?: number;
  stay_time?: number;
}

interface ApiRoute {
  id: number;
  mode: string;
  from: string;
  to: string;
  departure_time: string;
  arrival_time: string;
  route_name?: string;
  stay_time?: number;
  segments: ApiSegment[];
  total_time: number;
  total_cost?: number;
  total_price?: number;
}

interface ApiResponse {
  origin: string;
  destination: string;
  route_name: string;
  cheapest: ApiRoute;
  optimal: ApiRoute;
}

// APIのルート情報をRouteDataWithTime型に変換する関数
function convertApiRoute(apiRoute: ApiRoute, routeName: string): RouteDataWithTime {
  const segments: RouteSegment[] = apiRoute.segments.map((seg) => ({
    id: seg.id,
    mode: seg.mode as TransportMode,
    from: seg.from,
    to: seg.to,
    departureTime: seg.departure_time,
    arrivalTime: seg.arrival_time,
    moveDuration: seg.move_duration,
    stayDuration: seg.stay_duration,
    stayTime: seg.stay_time,
  }));

  // ルート全体の出発時刻・到着時刻を補完（segmentsの先頭・末尾から取得）
  const departureTime = apiRoute.departure_time ?? (segments.length > 0 ? segments[0].departureTime : undefined);
  const arrivalTime = apiRoute.arrival_time ?? (segments.length > 0 ? segments[segments.length - 1].arrivalTime : undefined);

  return {
    id: apiRoute.id,
    mode: apiRoute.mode as TransportMode,
    from: apiRoute.from,
    to: apiRoute.to,
    departureTime,
    arrivalTime,
    routeName,
    stayTime: apiRoute.stay_time ?? 0,
    segments,
    totalTime: apiRoute.total_time,
    totalPrice: apiRoute.total_cost ?? apiRoute.total_price ?? 0,
    price: apiRoute.total_cost ?? apiRoute.total_price ?? 0,
    totalDuration: apiRoute.total_time,
  };
}

// APIレスポンス全体をRouteResult型に変換
function convertApiRouteToRouteResult(apiData: ApiResponse): RouteResult {
  return {
    from: apiData.origin,
    to: apiData.destination,
    routeName: apiData.route_name,
    cheapest: convertApiRoute(apiData.cheapest, apiData.route_name),
    optimal: convertApiRoute(apiData.optimal, apiData.route_name),
  };
}

// ルート検索APIを呼び出し、RouteResultを返す関数
export async function searchRoute(routeRequest: RouteRequest): Promise<RouteResult> {
  const {
    from: origin,
    to: destination,
    waypoints = [],
    departureTime,
    stayTimes = [],
  } = routeRequest;

  // 空の経由地は除外し、滞在時間も対応づける
  const filteredWaypoints: string[] = [];
  const filteredStayTimes: number[] = [];
  waypoints.forEach((point, idx) => {
    if (point?.trim()) {
      filteredWaypoints.push(point.trim());
      filteredStayTimes.push(stayTimes[idx] ?? 0);
    }
  });

  // API送信用ペイロード生成
  const payload: any = {
    origin,
    destination,
    waypoints: filteredWaypoints,
    language: i18n.language || 'ja',
  };

  // 出発時刻がある場合はISO8601形式で送る想定（タイムゾーン付きが望ましい）
  if (departureTime && departureTime.trim() !== '') {
    payload.departure_time = departureTime;  // 例: '2025-06-07T22:00:00+09:00' など
  }

  // 滞在時間がある場合は追加
  if (filteredStayTimes.length > 0) {
    payload.stay_times = filteredStayTimes;
  }
  
  try {
    const response = await axios.post<ApiResponse>(`${BACKEND_BASE_URL}/search_route`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    // 受け取ったAPIレスポンスをRouteResult型に変換して返す
    // console.log('API response data:', response.data);
    return convertApiRouteToRouteResult(response.data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      console.error('送or受でフロントエラー:', error.response.data.detail);
    }
    throw new Error(error.response?.data?.detail || 'API request failed');
  }
}
