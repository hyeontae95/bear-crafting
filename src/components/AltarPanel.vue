<!-- src/components/AltarPanel.vue -->
<script setup>
import { ref, computed } from 'vue'
import { MasterDatabase } from '../data/MasterDatabase.js'
import { getItemImage } from '../data/imageMap.js'
import SimulationModal from './SimulationModal.vue'
import SimulationInline from './SimulationInline.vue'

// ════════════════════════════════════════
// 등급 정의
// ════════════════════════════════════════
const GRADE_SCORE = { uncommon: 100, rare: 300, epic: 750, legendary: 2000 }
const GRADE_LABEL = { uncommon: 'UNCOMMON', rare: 'RARE', epic: 'EPIC', legendary: 'LEGENDARY' }
const GRADE_COLOR = {
    uncommon: '#9ca3af',
    rare: '#60a5fa',
    epic: '#a78bfa',
    legendary: '#f59e0b',
}

// ════════════════════════════════════════
// 공예품 목록 (등급 포함)
// ════════════════════════════════════════
const allItems = Object.entries(MasterDatabase.crafter).flatMap(([grade, items]) =>
    items.map(item => ({ ...item, grade }))
)

// ════════════════════════════════════════
// 상태
// ════════════════════════════════════════
const prestige = ref('none') // none / bronze / silver / gold / lapis
const weeklyList = ref([]) // { item, grade, count }
const simItem = ref(null)

const PRESTIGE_OPTIONS = [
    { value: 'none', label: '없음', mult: 1.0 },
    { value: 'bronze', label: '브론즈', mult: 1.0 },
    { value: 'silver', label: '실버', mult: 1.0 },
    { value: 'gold', label: '골드', mult: 1.0 },
    { value: 'lapis', label: '라피즈', mult: 1.1 },
]

const currentMult = computed(() =>
    PRESTIGE_OPTIONS.find(p => p.value === prestige.value)?.mult || 1.0
)

// 총 개수
const totalCount = computed(() => weeklyList.value.reduce((s, e) => s + e.count, 0))

// ════════════════════════════════════════
// 제단 점수 계산
// ════════════════════════════════════════
const altarScore = computed(() => {
    const mult = currentMult.value
    // 아이템별 등장 횟수 추적 (감소율 계산용)
    const itemCountMap = {}
    let total = 0

    // weeklyList 순서대로 처리
    for (const entry of weeklyList.value) {
        const key = entry.item.itemName
        const baseScore = GRADE_SCORE[entry.grade] || 0

        for (let i = 0; i < entry.count; i++) {
            const n = itemCountMap[key] || 0
            // 10%씩 감소, 최저 50%
            const decay = Math.max(0.5, 1.0 - n * 0.1)
            total += baseScore * decay * mult
            itemCountMap[key] = n + 1
        }
    }

    return Math.round(total)
})

// 항목별 점수 미리보기
const entryScores = computed(() => {
    const mult = currentMult.value
    const itemCountMap = {}
    return weeklyList.value.map(entry => {
        const key = entry.item.itemName
        const baseScore = GRADE_SCORE[entry.grade] || 0
        let entryTotal = 0
        for (let i = 0; i < entry.count; i++) {
            const n = itemCountMap[key] || 0
            const decay = Math.max(0.5, 1.0 - n * 0.1)
            entryTotal += baseScore * decay * mult
            itemCountMap[key] = n + 1
        }
        return Math.round(entryTotal)
    })
})

// ════════════════════════════════════════
// 아이템 추가 모달
// ════════════════════════════════════════
const showAddModal = ref(false)
const searchQuery = ref('')
const selectedGradeFilter = ref('all')

const filteredItems = computed(() => {
    return allItems.filter(item => {
        const matchGrade = selectedGradeFilter.value === 'all' || item.grade === selectedGradeFilter.value
        const matchSearch = item.itemName.includes(searchQuery.value)
        return matchGrade && matchSearch
    })
})

function addItem(item) {
    const existing = weeklyList.value.find(e => e.item.itemName === item.itemName)
    if (existing) {
        if (totalCount.value < 64) existing.count++
    } else {
        if (totalCount.value < 64) {
            weeklyList.value.push({ item, grade: item.grade, count: 1 })
        }
    }
}

function removeItem(idx) {
    weeklyList.value.splice(idx, 1)
}

function changeCount(idx, delta) {
    const entry = weeklyList.value[idx]
    const newCount = entry.count + delta
    if (newCount <= 0) {
        weeklyList.value.splice(idx, 1)
        return
    }
    if (delta > 0 && totalCount.value >= 64) return
    entry.count = newCount
}

function setCount(idx, val) {
    const num = Math.max(1, Math.min(64, Number(val) || 1))
    const diff = num - weeklyList.value[idx].count
    if (diff > 0 && totalCount.value + diff > 64) return
    weeklyList.value[idx].count = num
}

// ════════════════════════════════════════
// 시뮬
// ════════════════════════════════════════
function openSim(item) {
    const grade = item.grade
    const entry = weeklyList.value.find(e => e.item.itemName === item.itemName)
    const needed = entry ? entry.count : 1

    const bsEntry = Object.entries(MasterDatabase.blacksmith).find(([, arr]) => arr.some(i => i.itemName === item.itemName))
    const crEntry = Object.entries(MasterDatabase.crafter).find(([, arr]) => arr.some(i => i.itemName === item.itemName))

    if (bsEntry) {
        simItem.value = { item: bsEntry[1].find(i => i.itemName === item.itemName), job: 'blacksmith', tier: bsEntry[0], initialTarget: needed }
    } else if (crEntry) {
        simItem.value = { item: crEntry[1].find(i => i.itemName === item.itemName), job: 'crafter', tier: crEntry[0], initialTarget: needed }
    }
}

const fmt = (n) => Math.round(n).toLocaleString()

// 전체 필요 재료 합산
const totalMaterials = computed(() => {
    const map = {}
    for (const entry of weeklyList.value) {
        const item = entry.item
        const count = entry.count
        for (const mat of item.requiredMaterials || []) {
            const key = mat.materialName
            if (!map[key]) {
                map[key] = { materialName: mat.materialName, sourceCategory: mat.sourceCategory, total: 0 }
            }
            map[key].total += mat.requiredQuantity * count
        }
    }
    // 카테고리 순서 정의
    const ORDER = ['blacksmith', 'crafter', 'farmer', 'fisher', 'lumberjack', 'miner', 'hunter', 'vanilla']
    return Object.values(map).sort((a, b) => {
        const ai = ORDER.indexOf(a.sourceCategory)
        const bi = ORDER.indexOf(b.sourceCategory)
        if (ai !== bi) return ai - bi
        return a.materialName.localeCompare(b.materialName)
    })
})

const SOURCE_LABEL = {
    vanilla: '바닐라', farmer: '농부', fisher: '어부',
    lumberjack: '나무꾼', miner: '광부', hunter: '사냥꾼',
    blacksmith: '대장장이', crafter: '공예가',
}
const SOURCE_COLOR = {
    vanilla: '#9ca3af', farmer: '#34d399', fisher: '#60a5fa',
    lumberjack: '#86efac', miner: '#fbbf24', hunter: '#f87171',
    blacksmith: '#fb923c', crafter: '#c084fc',
}

const activeSimItem = ref(null) // 현재 인라인 시뮬 대상

function selectRow(entry) {
    if (activeSimItem.value?.item.itemName === entry.item.itemName) {
        activeSimItem.value = null
        return
    }
    const bsEntry = Object.entries(MasterDatabase.blacksmith)
        .find(([, arr]) => arr.some(i => i.itemName === entry.item.itemName))
    const crEntry = Object.entries(MasterDatabase.crafter)
        .find(([, arr]) => arr.some(i => i.itemName === entry.item.itemName))
    if (bsEntry) {
        activeSimItem.value = { item: bsEntry[1].find(i => i.itemName === entry.item.itemName), job: 'blacksmith', tier: bsEntry[0], count: entry.count }
    } else if (crEntry) {
        activeSimItem.value = { item: crEntry[1].find(i => i.itemName === entry.item.itemName), job: 'crafter', tier: crEntry[0], count: entry.count }
    }
}

function applySimCount(count) {
    if (!activeSimItem.value) return
    const entry = weeklyList.value.find(e => e.item.itemName === activeSimItem.value.item.itemName)
    if (!entry) return
    const diff = count - entry.count
    if (totalCount.value + diff > 64) return
    entry.count = count
    activeSimItem.value.count = count
}
</script>

<template>
    <main class="altar-panel">

        <!-- 헤더 -->
        <header class="panel-header">
            <h1 class="panel-title">🏛️ 제단 점수 계산기</h1>
            <div class="prestige-wrap">
                <label>프레스티지</label>
                <div class="prestige-btns">
                    <button v-for="p in PRESTIGE_OPTIONS" :key="p.value" class="prestige-btn"
                        :class="{ active: prestige === p.value, [p.value]: true }" @click="prestige = p.value">
                        {{ p.label }}
                    </button>
                </div>
            </div>
        </header>

        <!-- 요약 바 -->
        <div class="summary-bar">
            <div class="summary-stat">
                <div class="summary-label">총 공양 개수</div>
                <div class="summary-value" :class="{ warn: totalCount >= 64 }">
                    {{ totalCount }} / 64
                </div>
            </div>
            <div class="summary-stat">
                <div class="summary-label">예상 제단 점수</div>
                <div class="summary-value accent">{{ fmt(altarScore) }} xp</div>
            </div>
            <div class="summary-stat" v-if="prestige === 'lapis'">
                <div class="summary-label">라피즈 보너스</div>
                <div class="summary-value" style="color:#f59e0b">×1.1 적용중</div>
            </div>
            <button class="add-btn" @click="showAddModal = true" :disabled="totalCount >= 64">
                + 아이템 추가
            </button>
        </div>

        <!-- 공양 목록 -->
        <div class="list-wrap">
            <div v-if="weeklyList.length === 0" class="empty-state">
                <div class="empty-icon">🏛️</div>
                <div class="empty-text">아이템을 추가해서 제단 점수를 계산해보세요</div>
                <button class="add-btn-lg" @click="showAddModal = true">+ 아이템 추가</button>
            </div>

            <table v-else class="altar-table">
                <colgroup>
                    <col style="width:180px">
                    <col style="width:90px">
                    <col style="width:120px">
                    <col style="width:80px">
                    <col style="width:120px">
                    <col style="width:44px">
                </colgroup>
                <thead>
                    <tr>
                        <th style="text-align:left">아이템</th>
                        <th style="text-align:center">등급</th>
                        <th style="text-align:center">개수</th>
                        <th style="text-align:right">기본 점수</th>
                        <th style="text-align:right">예상 점수</th>
                        <th style="text-align:center">시뮬</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(entry, idx) in weeklyList" :key="entry.item.itemName" class="altar-row"
                        :class="{ 'row-active': activeSimItem?.item.itemName === entry.item.itemName }"
                        @click="selectRow(entry)">
                        <td style="text-align:left">
                            <div class="item-name-wrap">
                                <img v-if="getItemImage(entry.item.itemName)" :src="getItemImage(entry.item.itemName)"
                                    :alt="entry.item.itemName" class="item-img"
                                    @error="$event.target.style.display = 'none'" />
                                <span class="item-name">{{ entry.item.itemName }}</span>
                            </div>
                        </td>
                        <td style="text-align:center">
                            <span class="grade-badge"
                                :style="{ color: GRADE_COLOR[entry.grade], borderColor: GRADE_COLOR[entry.grade] + '44', background: GRADE_COLOR[entry.grade] + '18' }">
                                {{ GRADE_LABEL[entry.grade] }}
                            </span>
                        </td>
                        <td style="text-align:center">
                            <div class="count-ctrl">
                                <button class="cnt-btn" @click="changeCount(idx, -1)">−</button>
                                <input type="number" class="cnt-input" :value="entry.count"
                                    @change="setCount(idx, $event.target.value)" min="1" max="64" />
                                <button class="cnt-btn" @click="changeCount(idx, 1)"
                                    :disabled="totalCount >= 64">+</button>
                            </div>
                        </td>
                        <td style="text-align:right; color:var(--text-secondary); font-size:12px">
                            {{ fmt(GRADE_SCORE[entry.grade]) }} xp
                        </td>
                        <td style="text-align:right">
                            <span class="score-val">{{ fmt(entryScores[idx]) }} xp</span>
                        </td>
                        <td style="text-align:center">
                            <div class="row-actions">
                                <button class="sim-btn" @click="openSim(entry.item)" title="시뮬레이션">🎲</button>
                                <button class="del-btn" @click="removeItem(idx)" title="삭제">✕</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3"
                            style="text-align:right; padding-right:16px; color:var(--text-secondary); font-size:13px">
                            총 {{ totalCount }}개 공양
                        </td>
                        <td style="text-align:right; color:var(--text-secondary); font-size:12px">
                            기본 합계
                        </td>
                        <td style="text-align:right">
                            <span class="total-score">{{ fmt(altarScore) }} xp</span>
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <!-- 인라인 시뮬 -->
            <div v-if="activeSimItem" class="inline-sim-wrap">
                <SimulationInline :item="activeSimItem.item" :job="activeSimItem.job" :tier="activeSimItem.tier"
                    :initial-target="activeSimItem.count" @apply-count="applySimCount" />
            </div>
            <!-- 필요 재료 합산 -->
            <div v-if="weeklyList.length > 0 && totalMaterials.length > 0" class="materials-section">
                <div class="materials-title">📦 전체 필요 재료</div>
                <div class="materials-by-category">
                    <template v-for="cat in ['blacksmith', 'crafter', 'farmer', 'fisher', 'lumberjack', 'miner', 'hunter', 'vanilla']" :key="cat">
                        <div v-if="totalMaterials.some(m => m.sourceCategory === cat)" class="mat-category-group">
                            <div class="mat-category-label"
                                :style="{ background: SOURCE_COLOR[cat] + '22', color: SOURCE_COLOR[cat] }">
                                {{ SOURCE_LABEL[cat] || cat }}
                            </div>
                            <div class="mat-chips">
                                <div v-for="mat in totalMaterials.filter(m => m.sourceCategory === cat)"
                                    :key="mat.materialName"
                                    class="mat-chip" :class="{ 'mat-clickable': canSimMat(mat) }"
                                    @click="canSimMat(mat) ? openMatSim(mat) : null">
                                    <span class="mat-name">{{ mat.materialName }}</span>
                                    <span class="mat-count">{{ fmt(mat.total) }}개</span>
                                    <span v-if="canSimMat(mat)" class="mat-sim-icon">🎲</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- 아이템 추가 모달 -->
        <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
            <div class="add-modal">
                <div class="add-modal-header">
                    <h2>공예품 선택</h2>
                    <button class="modal-close" @click="showAddModal = false">✕</button>
                </div>
                <div class="add-modal-search">
                    <input type="text" v-model="searchQuery" placeholder="아이템 검색..." class="search-input" />
                    <div class="grade-filter-btns">
                        <button v-for="g in ['all', 'uncommon', 'rare', 'epic', 'legendary']" :key="g"
                            class="grade-filter-btn" :class="{ active: selectedGradeFilter === g }"
                            :style="g !== 'all' ? { borderColor: GRADE_COLOR[g] + '88', color: selectedGradeFilter === g ? 'white' : GRADE_COLOR[g], background: selectedGradeFilter === g ? GRADE_COLOR[g] : 'transparent' } : {}"
                            @click="selectedGradeFilter = g">
                            {{ g === 'all' ? '전체' : GRADE_LABEL[g] }}
                        </button>
                    </div>
                </div>
                <div class="add-modal-body">
                    <div v-for="item in filteredItems" :key="item.itemName" class="add-item-row"
                        :class="{ 'already-added': weeklyList.some(e => e.item.itemName === item.itemName) }"
                        @click="addItem(item)">
                        <div class="item-name-wrap">
                            <img v-if="getItemImage(item.itemName)" :src="getItemImage(item.itemName)"
                                :alt="item.itemName" class="item-img" @error="$event.target.style.display = 'none'" />
                            <span class="item-name">{{ item.itemName }}</span>
                        </div>
                        <span class="grade-badge sm"
                            :style="{ color: GRADE_COLOR[item.grade], borderColor: GRADE_COLOR[item.grade] + '44', background: GRADE_COLOR[item.grade] + '18' }">
                            {{ GRADE_LABEL[item.grade] }}
                        </span>
                        <span class="add-score">+{{ fmt(GRADE_SCORE[item.grade]) }} xp</span>
                        <template v-if="weeklyList.some(e => e.item.itemName === item.itemName)">
                            <span class="add-count">
                                {{weeklyList.find(e => e.item.itemName === item.itemName)?.count}}개
                            </span>
                            <button class="add-minus"
                                @click.stop="changeCount(weeklyList.findIndex(e => e.item.itemName === item.itemName), -1)">−</button>
                            <button class="add-plus-btn" @click.stop="addItem(item)">+</button>
                        </template>
                        <span class="add-plus" v-else>+</span>
                    </div>
                </div>
                <div class="add-modal-footer">
                    남은 공양 가능: <strong>{{ 64 - totalCount }}개</strong>
                    <button class="modal-done-btn" @click="showAddModal = false">완료</button>
                </div>
            </div>
        </div>

        <SimulationModal v-if="simItem" :item="simItem.item" :job="simItem.job" :tier="simItem.tier"
            :initial-target="simItem.initialTarget" @close="simItem = null" />
    </main>
</template>

<style scoped>
.altar-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
}

/* ── 헤더 ── */
.panel-header {
    min-height: var(--header-height);
    padding: 0 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    gap: 16px;
    flex-wrap: wrap;
}

.panel-title {
    font-size: 20px;
    font-weight: 700;
}

.prestige-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text-secondary);
}

.prestige-btns {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.prestige-btn {
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.prestige-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
}

.prestige-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

.prestige-btn.lapis.active {
    background: #f59e0b;
    border-color: #f59e0b;
}

/* ── 요약 바 ── */
.summary-bar {
    padding: 12px 28px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 24px;
    flex-shrink: 0;
    flex-wrap: wrap;
}

.summary-label {
    font-size: 11px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.summary-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-top: 2px;
}

.summary-value.accent {
    color: var(--accent);
}

.summary-value.warn {
    color: #ef4444;
}

.add-btn {
    margin-left: auto;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
}

.add-btn:hover {
    background: var(--accent-hover);
}

.add-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* ── 목록 ── */
.list-wrap {
    flex: 1;
    overflow: auto;
    min-height: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    padding: 60px 0;
    color: var(--text-tertiary);
}

.empty-icon {
    font-size: 48px;
}

.empty-text {
    font-size: 14px;
}

.add-btn-lg {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
}

.altar-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    table-layout: fixed;
}

.altar-table thead {
    position: sticky;
    top: 0;
    background: var(--bg-secondary);
    z-index: 10;
}

.altar-table th {
    padding: 10px 12px;
    font-size: 11px;
    color: var(--text-tertiary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
}

.altar-row {
    border-bottom: 1px solid var(--border);
    transition: background 0.1s;
}

.altar-row:hover {
    background: var(--bg-tertiary);
}

.altar-table td {
    padding: 10px 12px;
    vertical-align: middle;
    height: 52px;
}

.item-name-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
}

.item-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
    image-rendering: pixelated;
    flex-shrink: 0;
}

.item-name {
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.grade-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    border: 1px solid;
    white-space: nowrap;
}

.grade-badge.sm {
    font-size: 10px;
    padding: 2px 6px;
}

.count-ctrl {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.cnt-btn {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.cnt-btn:hover {
    border-color: var(--accent);
}

.cnt-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.cnt-input {
    width: 40px;
    text-align: center;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 3px 4px;
    font-size: 12px;
    font-weight: 700;
}

.cnt-input:focus {
    border-color: var(--accent);
    outline: none;
}

.score-val {
    font-weight: 600;
    color: var(--accent);
}

.row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
}

.sim-btn {
    background: var(--accent-soft);
    border: none;
    border-radius: 6px;
    padding: 3px 6px;
    font-size: 13px;
    cursor: pointer;
}

.sim-btn:hover {
    background: var(--accent);
}

.del-btn {
    background: transparent;
    border: none;
    border-radius: 6px;
    padding: 3px 6px;
    font-size: 12px;
    color: var(--text-tertiary);
    cursor: pointer;
}

.del-btn:hover {
    background: #ef444422;
    color: #ef4444;
}

.total-row td {
    padding: 12px 12px;
    border-top: 2px solid var(--border);
}

.total-score {
    font-size: 18px;
    font-weight: 800;
    color: var(--accent);
}

/* ── 추가 모달 ── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 24px;
}

.add-modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.add-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}

.add-modal-header h2 {
    font-size: 18px;
    font-weight: 700;
}

.modal-close {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
}

.modal-close:hover {
    color: var(--text-primary);
}

.add-modal-search {
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.search-input {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    width: 100%;
}

.search-input:focus {
    border-color: var(--accent);
    outline: none;
}

.grade-filter-btns {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.grade-filter-btn {
    padding: 4px 10px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
}

.grade-filter-btn.active:not([style]) {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
}

.add-modal-body {
    flex: 1;
    overflow-y: auto;
}

.add-item-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    cursor: pointer;
    transition: background 0.1s;
    border-bottom: 1px solid var(--border);
}

.add-item-row:hover {
    background: var(--bg-tertiary);
}

.add-item-row.already-added {
    background: rgba(139, 92, 246, 0.05);
}

.add-score {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-tertiary);
}

.add-check {
    color: #34d399;
    font-weight: 700;
    font-size: 14px;
}

.add-plus {
    color: var(--accent);
    font-weight: 700;
    font-size: 18px;
}

.add-modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-secondary);
    flex-shrink: 0;
}

.modal-done-btn {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
}

/* ── 모바일 ── */
@media (max-width: 767px) {

    .panel-header,
    .summary-bar {
        padding: 12px 16px;
    }

    .panel-title {
        font-size: 16px;
    }

    .modal-overlay {
        padding: 0;
        align-items: flex-end;
    }

    .add-modal {
        border-radius: 20px 20px 0 0;
        max-height: 92vh;
        max-width: 100%;
    }

    .prestige-btns {
        gap: 4px;
    }

    .prestige-btn {
        padding: 4px 8px;
        font-size: 11px;
    }
}

.add-count {
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
    min-width: 28px;
    text-align: center;
}

.add-minus {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--bg-tertiary);
    color: var(--text-primary);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-minus:hover {
    border-color: #ef4444;
    color: #ef4444;
}

.add-plus-btn {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.add-plus-btn:hover {
    background: var(--accent);
    color: white;
}

.materials-section {
    border-top: 1px solid var(--border);
    padding: 20px 28px;
    flex-shrink: 0;
    background: var(--bg-tertiary);
}

.materials-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.materials-by-category { display: flex; flex-direction: column; gap: 12px; }

.mat-category-group { display: flex; align-items: flex-start; gap: 10px; }

.mat-category-label {
    font-size: 11px; font-weight: 700;
    padding: 4px 10px; border-radius: 6px;
    white-space: nowrap; flex-shrink: 0;
    align-self: flex-start; margin-top: 2px;
}

.mat-chips { display: flex; flex-wrap: wrap; gap: 6px; }

.mat-chip {
    display: flex; align-items: center; gap: 6px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px; padding: 5px 10px;
    font-size: 12px;
}
.mat-source {
    font-size: 10px; font-weight: 700;
    padding: 2px 6px; border-radius: 4px;
    white-space: nowrap;
}

.mat-name {
    color: var(--text-primary);
    font-weight: 600;
    white-space: nowrap;
}

.mat-count {
    color: var(--text-tertiary);
    white-space: nowrap;
}

@media (max-width: 767px) {
    .materials-section {
        padding: 16px;
    }
}

.row-active {
    background: rgba(139, 92, 246, 0.08) !important;
}

.row-active td:first-child {
    border-left: 2px solid var(--accent);
}

.inline-sim-wrap {
    padding: 16px 28px;
    border-top: 1px solid var(--border);
}

@media (max-width: 767px) {
    .inline-sim-wrap {
        padding: 12px 16px;
    }
}
</style>