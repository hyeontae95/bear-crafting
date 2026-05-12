import { ref, watch } from 'vue'
import { loadList, saveList } from '../utils/storage.js'
import { MasterDatabase } from '../data/MasterDatabase.js'
import { useSettings } from './useSettings.js'

const STORAGE_KEY = 'craft_queue'

const queue = ref(loadList(STORAGE_KEY, []))

watch(queue, (val) => saveList(STORAGE_KEY, val), { deep: true })

// ════════════════════════════════════════
// 설정 기반 기본 chance 자동 계산
// ════════════════════════════════════════
function buildDefaultChances(entry) {
  const { getProbabilityByDbKey } = useSettings()
  const savedProb = getProbabilityByDbKey(entry.tier)
  if (!savedProb) return {}

  const item = MasterDatabase[entry.job]?.[entry.tier]?.find(
    i => i.itemName === entry.itemName
  )
  if (!item) return {}

  const result = {}

  // Tier4: 장인/평범
  if (item.artisanSuccessQuantity !== undefined) {
    result.artisan = savedProb.artisanSuccess ?? 0
    result.normal_fail = savedProb.normalSuccess ?? 0
    return result
  }

  // 일반
  if (item.criticalSuccessQuantity > 0) {
    result.critical = entry.job === 'crafter'
      ? (savedProb.inspired ?? 0)
      : (savedProb.criticalSuccess ?? 0)
  }
  if (item.additionalSuccessQuantity > 0) {
    result.additional = savedProb.additional ?? 0
  }
  if (item.normalSuccessQuantity > 0) {
    result.normal = savedProb.normalSuccess ?? 0
  }

  return result
}

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
        chances: buildDefaultChances(entry),  // ← 설정에서 자동 채움
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