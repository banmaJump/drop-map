// 交通手段モード（日本語）
export type TransportMode = 'walk' | 'transit';

export interface StepInfo {
  departureTime: string; // 再計算された時刻
  arrivalTime: string;
  // 必要に応じて（instruction, line, stop など）
}

// 区間情報（最小単位）
export interface RouteSegment {
  id: number;
  mode: TransportMode;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  moveDuration?: number;
  stayDuration?: number;
  stayTime?: number; 
  step_info?: StepInfo;
  instruction?: string;
  totalPrice?: number;
}

// 最適 / 最安ルート構造
export type RouteDataWithTime = {
  id?: number;
  mode: TransportMode;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  routeName?: string;
  stayTime?: number;
  segments: RouteSegment[];
  totalTime: number;
  totalPrice?: number;
  price?: number;
  totalDuration?: number;
};

// 検索結果全体（最安・最適を両方含む）
export type RouteResult = {
  from: string;
  to: string;
  routeName: string;
  cheapest: RouteDataWithTime;
  optimal: RouteDataWithTime;
};

// 詳細表示用
export type RouteDataForDetail = {
  routeName: string;
  totalTime: string;
  totalPrice: string;
  segments: RouteSegment[];
};

// 保存用（localStorage）
export type SavedRoute = {
  id: string;
  routeName: string;
  time: number;
  price: number;
  details: RouteSegment[];
  timestamp: number;
};

// API用リクエスト
export interface RouteRequest {
  from: string;
  to: string;
  waypoints?: string[];
  departureTime: string;
  stayTimes?: number[];
}

// 追加: ルート入力画面用の型
export interface RouteData {
  name: string;
  points: string[];
  departureTime: string;
  stayTimes?: number[];
}
