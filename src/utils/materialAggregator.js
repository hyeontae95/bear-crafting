/**
 * 큐의 모든 아이템 → 평균 시도 횟수 추정 → 재료 합산
 */

import { simulateAttempts } from './simulator.js'
import { MasterDatabase } from '../data/MasterDatabase.js'

/**
 * 한 아이템의 평균 시도횟수 계산 (빠른 추정)
 * 큐 합산은 평균값으로 충분 — 정확한 분포는 개별 시뮬에서
 */
function estimateAttempts(item, chances, targetQuantity) {
  // chances 가 비어있으면 계산 불가
  if (!chances || Object.keys(chances).length === 0) return null

  const total = Object.values(chances).reduce((s, v) => s + Number(v || 0), 0)
  if (Math.abs(total - 100) > 0.5) return null

  // 시뮬용 outcomes 만들기
  const outcomes = []

  if (item.artisanSuccessQuantity !== undefined) {
    outcomes.push({ chance: Number(chances.artisan || 0), quantity: item.artisanSuccessQuantity })
    outcomes.push({ chance: Number(chances.normal_fail || 0), quantity: 0 })
  } else {
    if (item.criticalSuccessQuantity > 0) {
      outcomes.push({ chance: Number(chances.critical || 0), quantity: item.criticalSuccessQuantity })
    }
    if (item.additionalSuccessQuantity > 0) {
      outcomes.push({ chance: Number(chances.additional || 0), quantity: item.additionalSuccessQuantity })
    }
    if (item.normalSuccessQuantity > 0) {
      outcomes.push({ chance: Number(chances.normal || 0), quantity: item.normalSuccessQuantity })
    }
  }

  // 1000번만 (큐는 빠르게)
  const result = simulateAttempts(targetQuantity, outcomes, 1000)
  return result.mean
}

/**
 * 큐 → 재료 합산
 * @returns { aggregated: [{ materialName, totalRequired, sourceCategory }], hasIncomplete: bool }
 */
export function aggregateMaterials(queueItems) {
  const map = {}  // { materialName: { totalRequired, sourceCategory } }
  let hasIncomplete = false

  for (const queueItem of queueItems) {
    // 마스터 DB에서 아이템 데이터 찾기
    const itemData = MasterDatabase[queueItem.job]?.[queueItem.tier]?.find(
      i => i.itemName === queueItem.itemName
    )
    if (!itemData) continue

    // 도구류는 100% 성공이라 시도 = 목표 / 성공량
    let attempts
    if (itemData.criticalSuccessQuantity === 0 && itemData.additionalSuccessQuantity === 0) {
      attempts = Math.ceil(queueItem.quantity / itemData.normalSuccessQuantity)
    } else {
      // 확률 기반 시뮬레이션
      attempts = estimateAttempts(itemData, queueItem.chances, queueItem.quantity)
      if (attempts === null) {
        hasIncomplete = true
        continue
      }
      attempts = Math.ceil(attempts)
    }

    // 재료 합산
    for (const m of itemData.requiredMaterials) {
      const need = m.requiredQuantity * attempts
      if (!map[m.materialName]) {
        map[m.materialName] = {
          materialName: m.materialName,
          totalRequired: 0,
          sourceCategory: m.sourceCategory,
        }
      }
      map[m.materialName].totalRequired += need
    }
  }

  // 카테고리별 정렬: 직업 묶음으로
  const aggregated = Object.values(map).sort((a, b) => {
    if (a.sourceCategory !== b.sourceCategory) {
      return a.sourceCategory.localeCompare(b.sourceCategory)
    }
    return b.totalRequired - a.totalRequired
  })

  return { aggregated, hasIncomplete }
}