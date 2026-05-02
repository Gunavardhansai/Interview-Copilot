// src/lib/rateLimit.ts

type Entry = {
  count: number;
  lastReset: number;
};

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000
): boolean {
  const now = Date.now();

  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, lastReset: now });
    return true;
  }

  // reset window
  if (now - entry.lastReset > windowMs) {
    store.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}