// src/composables/usePokedex.js

import { ref, computed } from 'vue'
import {
  DIFFICULTY_LEVELS,
  getMasteryMultiplier,
  getCurrentStage,
  MATERIAL_POKEDEX,
  CRAFT_POKEDEX,
} from '../data/PokedexDatabase.js'

const STORAGE_KEY_MATERIAL = 'pokedex_material'
const STORAGE_KEY_CRAFT = 'pokedex_craft'
const STORAGE_KEY_MASTERY = 'pokedex_mastery'

// ════════════════════════════════════════
// 저장/불러오기
// ════════════════════════════════════════
function loadStorage(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultVal
  } catch {
    return defaultVal
  }
}

function saveStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

// ════════════════════════════════════════
// 상태 (싱글톤)
// ════════════════════════════════════════
const masteryLevel = ref(loadStorage(STORAGE_KEY_MASTERY, 0))

// { itemName: { current: 0, target: 0, price: 0 } }
const materialData = ref(loadStorage(
  STORAGE_KEY_MATERIAL,
  Object.fromEntries(MATERIAL_POKEDEX.map(i => [i.name, { current: 0, target: 0, price: 0 }]))
))

const craftData = ref(loadStorage(
  STORAGE_KEY_CRAFT,
  Object.fromEntries(CRAFT_POKEDEX.map((i, idx) => [`${i.name}_${idx}`, { current: 0, target: 0, price: 0 }]))
))

// ════════════════════════════════════════
// 저장 트리거
// ════════════════════════════════════════
function saveMastery() {
  saveStorage(STORAGE_KEY_MASTERY, masteryLevel.value)
}

function saveMaterialData() {
  saveStorage(STORAGE_KEY_MATERIAL, materialData.value)
}

function saveCraftData() {
  saveStorage(STORAGE_KEY_CRAFT, craftData.value)
}

// ════════════════════════════════════════
// 계산 함수
// ════════════════════════════════════════

// 실제 등록 개수 = 납품개수 × 마스터리 배율
function getRegisteredCount(itemName, difficulty, rawCount, masteryLv) {
  const multiplier = getMasteryMultiplier(difficulty, masteryLv)
  return rawCount * multiplier
}

// 현재 단계
function getStage(difficulty, registeredCount) {
  return getCurrentStage(difficulty, registeredCount)
}

// 목표 단계까지 필요한 실제 납품 개수
function getNeededCount(difficulty, currentRegistered, targetStage, masteryLv) {
  const levels = DIFFICULTY_LEVELS[difficulty]
  const targetRegistered = levels[targetStage] || 0
  const remaining = Math.max(0, targetRegistered - currentRegistered)
  const multiplier = getMasteryMultiplier(difficulty, masteryLv)
  if (multiplier <= 0) return remaining
  return Math.ceil(remaining / multiplier)
}

// ════════════════════════════════════════
// 도감 레벨 계산
// 총 숙련도(각 아이템 달성단계 합) / 도감 내 아이템 수
// ════════════════════════════════════════
function calcPokedexLevel(items, dataMap, masteryLv, isIndexed = false) {
  let totalStage = 0
  items.forEach((item, idx) => {
    const key = isIndexed ? `${item.name}_${idx}` : item.name
    const entry = dataMap[key]
    if (!entry) return
    const multiplier = getMasteryMultiplier(item.difficulty, masteryLv)
    const registered = entry.current * multiplier
    const stage = getCurrentStage(item.difficulty, registered)
    totalStage += stage
  })
  return items.length > 0 ? totalStage / items.length : 0
}

// ════════════════════════════════════════
// composable export
// ════════════════════════════════════════
export function usePokedex() {
  // 재료 도감 아이템별 계산 결과
  const materialItems = computed(() =>
    MATERIAL_POKEDEX.map((item) => {
      const entry = materialData.value[item.name] || { current: 0, target: 0, price: 0 }
      const multiplier = getMasteryMultiplier(item.difficulty, masteryLevel.value)
      const registered = entry.current * multiplier
      const stage = getCurrentStage(item.difficulty, registered)
      const targetStage = entry.target || 0
      const needed = getNeededCount(item.difficulty, registered, targetStage, masteryLevel.value)
      const totalCost = needed * (entry.price || 0)

      return {
        ...item,
        entry,
        multiplier,
        registered,
        stage,
        targetStage,
        needed,
        totalCost,
      }
    })
  )

  // 공예품 도감 아이템별 계산 결과
  const craftItems = computed(() =>
    CRAFT_POKEDEX.map((item, idx) => {
      const key = `${item.name}_${idx}`
      const entry = craftData.value[key] || { current: 0, target: 0, price: 0 }
      const multiplier = getMasteryMultiplier(item.difficulty, masteryLevel.value)
      const registered = entry.current * multiplier
      const stage = getCurrentStage(item.difficulty, registered)
      const targetStage = entry.target || 0
      const needed = getNeededCount(item.difficulty, registered, targetStage, masteryLevel.value)
      const totalCost = needed * (entry.price || 0)

      return {
        ...item,
        key,
        entry,
        multiplier,
        registered,
        stage,
        targetStage,
        needed,
        totalCost,
      }
    })
  )

  // 도감 레벨
  const materialPokedexLevel = computed(() =>
    calcPokedexLevel(MATERIAL_POKEDEX, materialData.value, masteryLevel.value, false)
  )

  const craftPokedexLevel = computed(() =>
    calcPokedexLevel(CRAFT_POKEDEX, craftData.value, masteryLevel.value, true)
  )

  // 업데이트 함수
  function updateMaterial(itemName, field, value) {
    if (!materialData.value[itemName]) {
      materialData.value[itemName] = { current: 0, target: 0, price: 0 }
    }
    materialData.value[itemName][field] = Number(value)
    saveMaterialData()
  }

  function updateCraft(key, field, value) {
    if (!craftData.value[key]) {
      craftData.value[key] = { current: 0, target: 0, price: 0 }
    }
    craftData.value[key][field] = Number(value)
    saveCraftData()
  }

  function updateMastery(val) {
    masteryLevel.value = Number(val)
    saveMastery()
  }

  return {
    masteryLevel,
    materialItems,
    craftItems,
    materialPokedexLevel,
    craftPokedexLevel,
    updateMaterial,
    updateCraft,
    updateMastery,
  }
}