//frontend/src/utils/storage.ts
import type {
  SavedRoute,
  RouteDataForDetail,
  TransportMode,
} from '../types/route';

const STORAGE_KEY = 'saved_routes';

// ルートをIDで削除（成功時 true を返す）
export const deleteSavedRoute = (id: string): boolean => {
  const routes = getSavedRoutes();
  const updated = routes.filter((route) => route.id !== id);
  if (routes.length === updated.length) {
    return false; // 削除対象なし
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return true;
};

// 保存済みルートを取得
export const getSavedRoutes = (): SavedRoute[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

// SavedRoute → 表示用に変換
export const convertToDisplayData = (saved: SavedRoute): RouteDataForDetail => {
  return {
    routeName: saved.routeName,
    totalTime: `${saved.time}分`,
    totalPrice: `¥${saved.price}`,
    segments: saved.details.map((segment, index) => ({
      id: index + 1,
      mode: segment.mode as TransportMode,
      from: segment.from,
      to: segment.to,
      departureTime: segment.departureTime,
      arrivalTime: segment.arrivalTime,
      stayTime: segment.stayTime,
    })),
  };
};

// 新しいルートを保存（重複回避・成功時 true を返す）
export const saveRoute = (route: Omit<SavedRoute, 'timestamp'>): boolean => {
  const routes = getSavedRoutes();

  const isDuplicate = routes.some(r => r.routeName === route.routeName);
  if (isDuplicate) {
    return false; // 重複なら保存しない
  }

  routes.push({ ...route, timestamp: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  return true;
};

// 1時間前のキャッシュを削除
export const clearOldCache = () => {
  const routes = getSavedRoutes();
  const now = Date.now();
  const filtered = routes.filter(r => r.timestamp && now - r.timestamp < 3600000);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
