import { ref, watch } from 'vue'
import { loadList, saveList } from '../utils/storage.js'

const STORAGE_KEY = 'craft_queue'

const queue = ref(loadList(STORAGE_KEY, []))

watch(queue, (val) => saveList(STORAGE_KEY, val), { deep: true })

export function useQueue() {
  const isInQueue = (itemName) =>
    queue.value.some(q => q.itemName === itemName)

  const add = (entry, quantity = 1) => {
    const idx = queue.value.findIndex(q => q.itemName === entry.itemName)
    if (idx >= 0) {
      queue.value[idx].quantity += quantity
    } else {
      queue.value.push({
        itemName: entry.itemName,
        job: entry.job,
        tier: entry.tier,
        quantity,
        chances: {},     // { critical: 7.59, additional: 54.85, normal: 37.56 } 또는 { artisan, normal_fail }
        addedAt: Date.now(),
      })
    }
  }

  const setQuantity = (itemName, quantity) => {
    const item = queue.value.find(q => q.itemName === itemName)
    if (item) {
      if (quantity <= 0) remove(itemName)
      else item.quantity = quantity
    }
  }

  const setChances = (itemName, chances) => {
    const item = queue.value.find(q => q.itemName === itemName)
    if (item) item.chances = { ...chances }
  }

  const remove = (itemName) => {
    const idx = queue.value.findIndex(q => q.itemName === itemName)
    if (idx >= 0) queue.value.splice(idx, 1)
  }

  const clear = () => { queue.value = [] }

  return { queue, isInQueue, add, setQuantity, setChances, remove, clear }
}