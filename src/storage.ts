const KEY = 'fundstueck:favorites'
let memory = new Set<string>()

export function loadFavorites() {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return new Set(memory)
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set(memory)
    memory = new Set(parsed.filter((item): item is string => typeof item === 'string'))
  } catch {
    // Strict privacy settings can block localStorage. Memory fallback keeps the UI usable.
  }
  return new Set(memory)
}

export function saveFavorites(favorites: Set<string>) {
  memory = new Set(favorites)
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...favorites]))
  } catch {
    // Keep the in-memory fallback for this session.
  }
}
