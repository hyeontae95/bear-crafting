/**
 * localStorage 안전 래퍼
 */

const PREFIX = 'mc_craft_'

export function loadList(key, fallback = []) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function saveList(key, list) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(list))
  } catch (e) {
    console.error('localStorage 저장 실패:', e)
  }
}

export function clearAll() {
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(PREFIX)) localStorage.removeItem(k)
  }
}