// Schmale, fehlertolerante localStorage-Helfer (Client-only).

export function lsGet<T>(key: string, fallback: T): T {
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function lsSet(key: string, value: unknown): void {
  if (!import.meta.client) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Speicher voll oder gesperrt – still ignorieren */
  }
}
