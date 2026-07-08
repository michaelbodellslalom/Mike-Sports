type JsonRequestOptions<T> = {
  timeoutMs?: number;
  retries?: number;
  cacheKey?: string;
  ttlMs?: number;
  fallbackData?: T;
  headers?: Record<string, string>;
};

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

const memoryCache = new Map<string, CacheEntry>();

function getFreshCache<T>(cacheKey: string): T | null {
  const found = memoryCache.get(cacheKey);
  if (!found) {
    return null;
  }
  if (Date.now() > found.expiresAt) {
    memoryCache.delete(cacheKey);
    return null;
  }
  return found.value as T;
}

function getStaleCache<T>(cacheKey: string): T | null {
  const found = memoryCache.get(cacheKey);
  return found ? (found.value as T) : null;
}

function setCache<T>(cacheKey: string, value: T, ttlMs: number): void {
  memoryCache.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearHttpCache(): void {
  memoryCache.clear();
}

export async function getJson<T>(url: string, opts?: JsonRequestOptions<T>): Promise<T> {
  const timeoutMs = opts?.timeoutMs ?? 9000;
  const retries = opts?.retries ?? 2;
  const ttlMs = opts?.ttlMs ?? 60_000;
  const cacheKey = opts?.cacheKey;

  if (cacheKey) {
    const cached = getFreshCache<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: "no-store",
        headers: opts?.headers,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}`);
      }
      const data = (await response.json()) as T;
      if (cacheKey) {
        setCache(cacheKey, data, ttlMs);
      }
      return data;
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > retries) {
        break;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  if (cacheKey) {
    const stale = getStaleCache<T>(cacheKey);
    if (stale) {
      return stale;
    }
  }

  if (opts?.fallbackData !== undefined) {
    return opts.fallbackData;
  }

  throw lastError instanceof Error ? lastError : new Error("Unknown fetch error");
}
