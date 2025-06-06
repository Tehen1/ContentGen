import functools
import json
import os
import time
from typing import Any, Callable, Dict, Optional, Tuple, Union
from threading import Lock

# Simple in-memory cache
_cache = {}
_cache_lock = Lock()

# Environment variables
CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'True').lower() == 'true'
DEFAULT_TTL = int(os.getenv('CACHE_DEFAULT_TTL', 300))  # 5 minutes default


def cached(ttl: int = None, key_prefix: str = "") -> Callable:
    """
    Decorator for caching function results
    
    Args:
        ttl: Time to live in seconds. If None, use DEFAULT_TTL
        key_prefix: Prefix for cache key
        
    Returns:
        Decorated function
    """
    if ttl is None:
        ttl = DEFAULT_TTL
        
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # Skip caching if disabled
            if not CACHE_ENABLED:
                return func(*args, **kwargs)
                
            # Generate cache key
            cache_key = _generate_cache_key(func, key_prefix, args, kwargs)
            
            # Try to get from cache
            cached_value = get_cache(cache_key)
            if cached_value is not None:
                return cached_value
                
            # Call function
            result = func(*args, **kwargs)
            
            # Store in cache
            set_cache(cache_key, result, ttl)
            
            return result
            
        return wrapper
        
    return decorator


def _generate_cache_key(func: Callable, key_prefix: str, args: Tuple, kwargs: Dict) -> str:
    """
    Generate cache key from function name, arguments, and prefix
    
    Args:
        func: Function being cached
        key_prefix: Prefix for cache key
        args: Positional arguments
        kwargs: Keyword arguments
        
    Returns:
        Cache key string
    """
    # Start with prefix and function name
    key_parts = [key_prefix, func.__module__, func.__name__]
    
    # Add args
    for arg in args:
        key_parts.append(str(arg))
        
    # Add kwargs, sorted by key
    for key in sorted(kwargs.keys()):
        key_parts.append(f"{key}:{kwargs[key]}")
        
    # Join parts and hash
    key = ":".join(key_parts)
    
    # We don't need cryptographic security, just a reasonably unique string
    return f"cache:{hash(key)}"


def get_cache(key: str) -> Optional[Any]:
    """
    Get value from cache
    
    Args:
        key: Cache key
        
    Returns:
        Cached value or None if not found or expired
    """
    with _cache_lock:
        cache_item = _cache.get(key)
        
        if cache_item is None:
            return None
            
        value, expires_at = cache_item
        
        # Check if expired
        if expires_at < time.time():
            del _cache[key]
            return None
            
        return value


def set_cache(key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
    """
    Set value in cache
    
    Args:
        key: Cache key
        value: Value to cache
        ttl: Time to live in seconds
    """
    with _cache_lock:
        expires_at = time.time() + ttl
        _cache[key] = (value, expires_at)


def invalidate_cache(key: str) -> bool:
    """
    Invalidate a specific cache entry
    
    Args:
        key: Cache key
        
    Returns:
        True if entry was found and removed, False otherwise
    """
    with _cache_lock:
        if key in _cache:
            del _cache[key]
            return True
            
        return False


def invalidate_by_prefix(prefix: str) -> int:
    """
    Invalidate all cache entries with a given prefix
    
    Args:
        prefix: Prefix to match
        
    Returns:
        Number of entries invalidated
    """
    count = 0
    with _cache_lock:
        keys_to_delete = [k for k in _cache.keys() if k.startswith(prefix)]
        for key in keys_to_delete:
            del _cache[key]
            count += 1
            
    return count


def clear_cache() -> int:
    """
    Clear all cache entries
    
    Returns:
        Number of entries cleared
    """
    with _cache_lock:
        count = len(_cache)
        _cache.clear()
        return count


def get_cache_stats() -> Dict[str, int]:
    """
    Get cache statistics
    
    Returns:
        Dictionary with cache statistics
    """
    with _cache_lock:
        total = len(_cache)
        
        # Count expired entries
        now = time.time()
        expired = sum(1 for _, expires_at in _cache.values() if expires_at < now)
        
        return {
            'total': total,
            'valid': total - expired,
            'expired': expired
        }