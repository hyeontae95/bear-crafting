<script setup>
import { computed, ref } from 'vue'
import { useQueue } from '../composables/useQueue.js'
import { aggregateMaterials } from '../utils/materialAggregator.js'
import { MasterDatabase } from '../data/MasterDatabase.js'

const { queue, setQuantity, setChances, remove, clear } = useQueue()

// ════════════════════════════════════════
// 펼친 카드 추적
// ════════════════════════════════════════
const expandedItem = ref(null)
const toggleExpand = (itemName) => {
  expandedItem.value = expandedItem.value === itemName ? null : itemName
}

// ════════════════════════════════════════
// 아이템 데이터 + 확률 입력 칸 자동 생성
// ════════════════════════════════════════
const getItemData = (q) =>
  MasterDatabase[q.job]?.[q.tier]?.find(i => i.itemName === q.itemName)

const buildOutcomeKeys = (q) => {
  const item = getItemData(q)
  if (!item) return []

  if (item.artisanSuccessQuantity !== undefined) {
    return [
      { key: 'artisan', label: '장인', qty: item.artisanSuccessQuantity, color: '#f59e0b' },
      { key: 'normal_fail', label: '평범', qty: 0, color: '#71717a' },
    ]
  }

  const list = []
  if (item.criticalSuccessQuantity > 0) {
    list.push({
      key: 'critical',
      label: q.job === 'crafter' ? '영감' : '대성공',
      qty: item.criticalSuccessQuantity,
      color: q.job === 'crafter' ? '#a855f7' : '#fbbf24',
    })
  }
  if (item.additionalSuccessQuantity > 0) {
    list.push({ key: 'additional', label: '추가', qty: item.additionalSuccessQuantity, color: '#34d399' })
  }
  if (item.normalSuccessQuantity > 0) {
    list.push({ key: 'normal', label: '성공', qty: item.normalSuccessQuantity, color: '#60a5fa' })
  }
  return list
}

const isToolType = (q) => {
  const item = getItemData(q)
  return item && item.criticalSuccessQuantity === 0 && item.additionalSuccessQuantity === 0
}

// 자동 채워진 키 추적: { itemName: autoFilledKey }
const autoFilledKeys = ref({})

const updateChance = (q, key, value) => {
  const item = getItemData(q)
  if (!item) return

  const outcomeKeys = buildOutcomeKeys(q)
  let newChances = { ...q.chances, [key]: Number(value) }

  // 자동 채워진 키가 있으면 → 0으로 리셋 (수동값 변경된 거)
  const autoKey = autoFilledKeys.value[q.itemName]
  if (autoKey && autoKey !== key) {
    newChances[autoKey] = 0
    autoFilledKeys.value[q.itemName] = null
  }

  // 한 칸 비어있고 나머지 합 < 100 이면 자동 채움
  const filled = outcomeKeys.filter(o => Number(newChances[o.key] || 0) > 0)
  const empty = outcomeKeys.filter(o => Number(newChances[o.key] || 0) === 0)

  if (empty.length === 1 && filled.length === outcomeKeys.length - 1) {
    const sum = filled.reduce((s, o) => s + Number(newChances[o.key] || 0), 0)
    if (sum > 0 && sum < 100) {
      newChances[empty[0].key] = Number((100 - sum).toFixed(2))
      autoFilledKeys.value[q.itemName] = empty[0].key
    }
  }

  setChances(q.itemName, newChances)
}

const totalChance = (q) =>
  Object.values(q.chances || {}).reduce((s, v) => s + Number(v || 0), 0)

const isChancesValid = (q) => {
  if (isToolType(q)) return true
  return Math.abs(totalChance(q) - 100) < 0.5
}

// ════════════════════════════════════════
// 재료 합산
// ════════════════════════════════════════
const materialResult = computed(() => aggregateMaterials(queue.value))

const groupedMaterials = computed(() => {
  const groups = {}
  for (const m of materialResult.value.aggregated) {
    if (!groups[m.sourceCategory]) groups[m.sourceCategory] = []
    groups[m.sourceCategory].push(m)
  }
  return groups
})

// ════════════════════════════════════════
// 라벨/색상 헬퍼
// ════════════════════════════════════════
const categoryMap = {
  vanilla: '바닐라', farmer: '농부', lumberjack: '나무꾼',
  fisher: '어부', miner: '광부', hunter: '사냥꾼', blacksmith: '대장장이',
}
const sourceCategoryLabel = (cat) => categoryMap[cat] || cat
const sourceCategoryColor = (cat) => `var(--job-${cat})`
</script>

<template>
  <aside class="queue-panel">
    <header class="panel-header">
      <h2>📦 제작 큐</h2>
      <button v-if="queue.length > 0" class="clear-btn" @click="clear" title="전체 비우기">
        비우기
      </button>
    </header>

    <!-- 빈 상태 -->
    <div v-if="queue.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <p>큐에 아이템이 없습니다</p>
      <small>아이템 카드에서 ➕ 클릭</small>
    </div>

    <!-- 큐 리스트 -->
    <template v-else>
      <div class="queue-list">
        <div
          v-for="q in queue"
          :key="q.itemName"
          class="queue-item"
          :class="{ expanded: expandedItem === q.itemName, invalid: !isChancesValid(q) }"
        >
          <!-- 헤더 -->
          <div class="queue-header" @click="toggleExpand(q.itemName)">
            <div class="expand-arrow">{{ expandedItem === q.itemName ? '▼' : '▶' }}</div>
            <div class="item-name">{{ q.itemName }}</div>
            <div class="qty-control" @click.stop>
              <button class="qty-btn" @click="setQuantity(q.itemName, q.quantity - 1)">−</button>
              <input
                type="number"
                :value="q.quantity"
                min="1"
                class="qty-input"
                @change="setQuantity(q.itemName, Number($event.target.value))"
              />
              <button class="qty-btn" @click="setQuantity(q.itemName, q.quantity + 1)">+</button>
            </div>
            <button class="remove-btn" @click.stop="remove(q.itemName)">✕</button>
          </div>

          <!-- 펼친 상태: 확률 입력 -->
          <div v-if="expandedItem === q.itemName" class="queue-detail">
            <div v-if="isToolType(q)" class="tool-note">
              ℹ️ 도구류 (성공 100%)
            </div>
            <template v-else>
              <div
                v-for="outcome in buildOutcomeKeys(q)"
                :key="outcome.key"
                class="chance-row"
              >
                <span class="chance-label" :style="{ color: outcome.color }">
                  {{ outcome.label }}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  :value="q.chances[outcome.key] || ''"
                  class="chance-input"
                  placeholder="0"
                  @input="updateChance(q, outcome.key, $event.target.value)"
                />
                <span class="chance-suffix">% → {{ outcome.qty }}개</span>
              </div>
              <div class="chance-total" :class="{ invalid: !isChancesValid(q) }">
                합계: {{ totalChance(q).toFixed(2) }}%
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 재료 합산 -->
      <div class="materials-block">
        <div class="materials-header">
          📦 총 필요 재료
          <span v-if="materialResult.hasIncomplete" class="incomplete-warn">
            (확률 입력 필요)
          </span>
        </div>

        <div v-if="Object.keys(groupedMaterials).length === 0" class="no-materials">
          확률을 입력하면 재료가 계산됩니다
        </div>

        <div v-for="(mats, cat) in groupedMaterials" :key="cat" class="material-group">
          <div class="group-header" :style="{ color: sourceCategoryColor(cat) }">
            {{ sourceCategoryLabel(cat) }}
          </div>
          <div
            v-for="m in mats"
            :key="m.materialName"
            class="material-row"
          >
            <span class="material-name">{{ m.materialName }}</span>
            <span class="material-qty">{{ m.totalRequired.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<style scoped>
.queue-panel {
  width: 320px;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}
.panel-header h2 {
  font-size: 15px;
  font-weight: 700;
}
.clear-btn {
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
}
.clear-btn:hover {
  color: var(--job-hunter);
  border-color: var(--job-hunter);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  gap: 8px;
}
.empty-icon { font-size: 36px; opacity: 0.3; }
.empty-state small { font-size: 11px; opacity: 0.7; }

.queue-list {
  padding: 12px;
  overflow-y: auto;
  border-bottom: 1px solid var(--border);
  max-height: 50vh;
}

.queue-item {
  background: var(--bg-tertiary);
  border-radius: 10px;
  margin-bottom: 6px;
  border: 1px solid transparent;
  transition: border-color 0.15s;
}
.queue-item.invalid {
  border-color: rgba(239, 68, 68, 0.3);
}

.queue-header {
  display: grid;
  grid-template-columns: 16px 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}
.queue-header:hover {
  background: var(--bg-hover);
  border-radius: 10px;
}
.expand-arrow {
  font-size: 8px;
  color: var(--text-tertiary);
}
.item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 2px;
}
.qty-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
  width: 22px;
  height: 22px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}
.qty-btn:hover { background: var(--accent); color: white; }
.qty-input {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  width: 38px;
  height: 22px;
  text-align: center;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.remove-btn {
  background: transparent;
  color: var(--text-tertiary);
  width: 24px;
  height: 22px;
  border-radius: 4px;
  font-size: 12px;
}
.remove-btn:hover { background: rgba(239, 68, 68, 0.15); color: var(--job-hunter); }

/* 펼친 영역 */
.queue-detail {
  padding: 4px 12px 12px;
  border-top: 1px solid var(--border);
}
.tool-note {
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 8px;
  text-align: center;
}
.chance-row {
  display: grid;
  grid-template-columns: 50px 1fr auto;
  gap: 6px;
  align-items: center;
  margin-top: 6px;
}
.chance-label {
  font-size: 11px;
  font-weight: 700;
}
.chance-input {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  width: 100%;
}
.chance-input:focus { border-color: var(--accent); }
.chance-suffix {
  font-size: 10px;
  color: var(--text-tertiary);
  white-space: nowrap;
}
.chance-total {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-secondary);
  text-align: right;
}
.chance-total.invalid { color: var(--job-hunter); }

/* 재료 합산 */
.materials-block {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.materials-header {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}
.incomplete-warn {
  font-size: 10px;
  color: var(--job-hunter);
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
}
.no-materials {
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: center;
  padding: 20px;
}
.material-group {
  margin-bottom: 12px;
}
.group-header {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--border);
}
.material-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 3px 4px;
}
.material-name { color: var(--text-primary); }
.material-qty { color: var(--text-secondary); font-weight: 600; }
</style>