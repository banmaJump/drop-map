# services/route_cache.py
from collections import OrderedDict
from datetime import datetime

_route_cache = {}

MAX_CACHE_SIZE = 50
_route_cache = OrderedDict()

def generate_key(origin: str, destination: str, waypoints: list[str]) -> str:
    """出発地・目的地・経由地だけでキャッシュキーを生成"""
    waypoints_str = '->'.join(waypoints)
    key = f"{origin}::{destination}::{waypoints_str}"
    return key
    
def get_from_cache(origin: str, destination: str, waypoints: list):
    key = generate_key(origin, destination, waypoints)
    data = _route_cache.get(key)
    if data:
        _route_cache.move_to_end(key)
    return data

def save_to_cache(origin, destination, waypoints, data):
    key = generate_key(origin, destination, waypoints)
    if key in _route_cache:
        _route_cache.move_to_end(key)
    _route_cache[key] = data
    if len(_route_cache) > MAX_CACHE_SIZE:
        _route_cache.popitem(last=False)  # 最も古いエントリを削除

#開発用。消してもいい。
def clear_cache():
    _route_cache.clear()

def get_cache_keys():
    return list(_route_cache.keys())
