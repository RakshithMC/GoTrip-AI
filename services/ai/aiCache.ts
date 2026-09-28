interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class AICache {
  private static cache = new Map<string, CacheEntry<any>>();
  private static DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour TTL for static/public AI responses

  public static get<T>(key: string, ttlMs: number = AICache.DEFAULT_TTL_MS): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public static set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  public static clear(): void {
    this.cache.clear();
  }
}
