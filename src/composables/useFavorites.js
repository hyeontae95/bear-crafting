import { ref, watch } from 'vue'
import { loadList, saveList } from '../utils/storage.js'

const STORAGE_KEY = 'favorites'

const favorites = ref(loadList(STORAGE_KEY, []))

watch(favorites, (val) => saveList(STORAGE_KEY, val), { deep: true })

export function useFavorites() {
  const isFavorite = (itemName) =>
    favorites.value.some(f => f.itemName === itemName)

  const toggle = (entry) => {
    const idx = favorites.value.findIndex(f => f.itemName === entry.itemName)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push({
        itemName: entry.itemName,
        job: entry.job,
        tier: entry.tier,
        addedAt: Date.now(),
      })
    }
  }

  const remove = (itemName) => {
    const idx = favorites.value.findIndex(f => f.itemName === itemName)
    if (idx >= 0) favorites.value.splice(idx, 1)
  }

  return { favorites, isFavorite, toggle, remove }
}