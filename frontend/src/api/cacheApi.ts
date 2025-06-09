// api/cacheApi.ts
const STORAGE_KEY = 'saved_routes';

export function getSavedRoutes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export async function clearCache() {
    const res = await fetch('/api/clear_cache', { method: 'POST' });
    return res.json();
  }  