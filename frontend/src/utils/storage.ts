export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full or unavailable (private browsing) - fail silently,
    // the app still works in-memory for the current session.
  }
}

export const STORAGE_KEYS = {
  prompts: 'apl:prompts',
  theme: 'apl:theme',
} as const;
