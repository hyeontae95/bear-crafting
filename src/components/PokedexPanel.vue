<script setup>
import { computed, ref } from 'vue'
import { usePokedex } from '../composables/usePokedex.js'
import { POKEDEX_REWARDS, DIFFICULTY_LEVELS, getMasteryMultiplier } from '../data/PokedexDatabase.js'
import { getItemImage } from '../data/imageMap.js'
import { MasterDatabase } from '../data/MasterDatabase.js'
import SimulationModal from './SimulationModal.vue'

const props = defineProps({
    type: { type: String, required: true }
})

const {
    masteryLevel, materialItems, craftItems,
    materialPokedexLevel, craftPokedexLevel,
    updateMaterial, updateCraft, updateMastery,
} = usePokedex()

const isMaterial = computed(() => props.type === 'material')
const items = computed(() => isMaterial.value ? materialItems.value : craftItems.value)
const pokedexLevel = computed(() => isMaterial.value ? materialPokedexLevel.value : craftPokedexLevel.value)
const rewards = computed(() => isMaterial.value ? POKEDEX_REWARDS.고급재료도감 : POKEDEX_REWARDS.공예품도감)
const title = computed(() => isMaterial.value ? '📦 고급 재료 도감' : '🪡 공예품 도감')

// ════════════════════════════════════════
// 효율 계산 모달
// ════════════════════════════════════════
const targetLevel = ref(1)
const strategy = ref('cheap')
const efficiencyResult = ref(null)
const showEffModal = ref(false)

function calcEfficiency() {
    const targetLv = Math.ceil(Number(targetLevel.value))
    const mastery = masteryLevel.value
    const totalItems = items.value.length
    const currentTotalStage = items.value.reduce((s, i) => s + i.stage, 0)
    const targetTotalStage = targetLv * totalItems
    const stageNeeded = Math.max(0, targetTotalStage - currentTotalStage)

    const meta = items.value.map(item => {
        const mult = getMasteryMultiplier(item.difficulty, mastery)
        const price = item.entry.price || 0
        const stageCosts = []
        let cumNeeded = 0
        for (let s = item.stage; s < 11; s++) {
            const curReg = item.registered + cumNeeded * mult
            const nextReg = DIFFICULTY_LEVELS[item.difficulty]?.[s + 1] || 0
            const regNeeded = Math.max(0, nextReg - curReg)
            const submitNeeded = mult > 0 ? Math.ceil(regNeeded / mult) : regNeeded
            const cost = submitNeeded * price
            cumNeeded += submitNeeded
            stageCosts.push({ fromStage: s, toStage: s + 1, submitNeeded, cost })
        }
        return { ...item, mult, price, stageCosts, hasPrice: price > 0 }
    })

    function buildPlan(strat) {
        const assigned = meta.map(m => ({
            ...m, targetStage: m.stage, extraStage: 0,
            totalNeeded: 0, totalCost: 0, _stageIdx: 0
        }))
        let remaining = stageNeeded

        while (remaining > 0) {
            let best = null
            let bestScore = Infinity
            for (const a of assigned) {
                if (a.targetStage >= 11) continue
                const idx = a._stageIdx
                if (idx >= a.stageCosts.length) continue
                const stepCost = a.hasPrice ? a.stageCosts[idx].cost : Infinity
                let score
                if (strat === 'cheap') {
                    score = stepCost
                } else if (strat === 'balanced') {
                    score = a.targetStage * 100000 + (stepCost === Infinity ? 999999999 : stepCost)
                } else {
                    score = a.targetStage * 1000
                }
                if (score < bestScore) { bestScore = score; best = a }
            }
            if (!best) break
            const idx = best._stageIdx
            best.totalNeeded += best.stageCosts[idx].submitNeeded
            best.totalCost += best.stageCosts[idx].cost
            best.targetStage += 1
            best.extraStage += 1
            best._stageIdx += 1
            remaining--
        }

        return {
            assigned,
            totalCost: assigned.reduce((s, a) => s + a.totalCost, 0),
            totalNeeded: assigned.reduce((s, a) => s + a.totalNeeded, 0),
        }
    }

    efficiencyResult.value = {
        plans: {
            cheap: buildPlan('cheap'),
            balanced: buildPlan('balanced'),
            fast: buildPlan('fast'),
        },
        currentTotalStage,
        targetTotalStage,
        stageNeeded,
    }
    showEffModal.value = true
}

function adjustPlanTarget(itemKey, newTarget) {
    if (!efficiencyResult.value) return
    const plan = efficiencyResult.value.plans[strategy.value]
    if (!plan) return

    const target = plan.assigned.find(a => (a.key || a.name) === itemKey)
    if (!target) return

    const oldTarget = target.targetStage
    const diff = Number(newTarget) - oldTarget

    // 올린 경우 → 가장 비효율 아이템 1단계 낮추기
    if (diff > 0) {
        const candidates = plan.assigned.filter(a =>
            (a.key || a.name) !== itemKey &&
            a.targetStage > a.stage
        )
        if (candidates.length > 0) {
            candidates.sort((a, b) => {
                const aEff = a.totalCost / Math.max(a.extraStage, 1)
                const bEff = b.totalCost / Math.max(b.extraStage, 1)
                return bEff - aEff
            })
            const worst = candidates[0]
            worst.targetStage -= 1
            worst.extraStage = Math.max(0, worst.extraStage - 1)
        }
    }

    // 내린 경우 → 가장 효율 좋은 아이템 1단계 올리기
    if (diff < 0) {
        const candidates = plan.assigned.filter(a =>
            (a.key || a.name) !== itemKey &&
            a.targetStage < 11
        )
        if (candidates.length > 0) {
            candidates.sort((a, b) => {
                const aEff = a.totalCost / Math.max(a.extraStage, 1)
                const bEff = b.totalCost / Math.max(b.extraStage, 1)
                return aEff - bEff
            })
            candidates[0].targetStage += 1
            candidates[0].extraStage += 1
        }
    }

    target.targetStage = Number(newTarget)
    target.extraStage = target.targetStage - target.stage
}

// 적용 시 목표 단계 일괄 변경
function applyPlan() {
    if (!efficiencyResult.value) return
    const plan = efficiencyResult.value.plans[strategy.value]
    if (!plan) return
    plan.assigned.forEach(a => {
        updateItem(a, 'target', a.targetStage)
    })
    showEffModal.value = false
}

// ════════════════════════════════════════
// 수동 조정 자동화
// 유저가 특정 아이템 목표단계를 올리면
// 현재 플랜에서 효율 가장 낮은 아이템을 1단계 낮춤
// ════════════════════════════════════════
function handleTargetChange(item, newTarget) {
    const oldTarget = item.entry.target
    const diff = Number(newTarget) - Number(oldTarget)

    // 단계를 올린 경우에만 자동 조정
    if (diff > 0 && efficiencyResult.value) {
        const plan = efficiencyResult.value.plans[strategy.value]
        if (plan) {
            // 효율 가장 낮은 아이템 찾기 (비용 높고 단계 올린 아이템 제외)
            const candidates = plan.assigned.filter(a =>
                (a.key || a.name) !== (item.key || item.name) &&
                a.targetStage > a.stage  // 목표단계가 현재단계보다 높은 것만
            )
            if (candidates.length > 0) {
                // 효율 점수: 비용/단계 기준 가장 비효율적인 것
                candidates.sort((a, b) => {
                    const aEff = a.totalCost / Math.max(a.extraStage, 1)
                    const bEff = b.totalCost / Math.max(b.extraStage, 1)
                    return bEff - aEff  // 비효율 내림차순
                })
                const worst = candidates[0]
                // worst 아이템 목표 1단계 낮추기
                const newWorstTarget = worst.targetStage - 1
                updateItem(worst, 'target', newWorstTarget)
                // 플랜도 업데이트
                worst.targetStage = newWorstTarget
                worst.extraStage = Math.max(0, worst.extraStage - 1)
            }
        }
    }

    updateItem(item, 'target', newTarget)
}

// ════════════════════════════════════════
// 시뮬 모달
// ════════════════════════════════════════
const simItem = ref(null)

function canSim(name) {
    return Object.values(MasterDatabase.blacksmith).flat().some(i => i.itemName === name) ||
        Object.values(MasterDatabase.crafter).flat().some(i => i.itemName === name)
}

function openSim(name) {
    // 해당 아이템의 필요납품 개수 찾기
    const targetItem = items.value.find(i => i.name === name)
    const initialTarget = targetItem?.needed > 0 ? targetItem.needed : 0

    const bsEntry = Object.entries(MasterDatabase.blacksmith).find(([, arr]) => arr.some(i => i.itemName === name))
    const crEntry = Object.entries(MasterDatabase.crafter).find(([, arr]) => arr.some(i => i.itemName === name))
    if (bsEntry) {
        simItem.value = { item: bsEntry[1].find(i => i.itemName === name), job: 'blacksmith', tier: bsEntry[0], initialTarget }
    } else if (crEntry) {
        simItem.value = { item: crEntry[1].find(i => i.itemName === name), job: 'crafter', tier: crEntry[0], initialTarget }
    }
}

function updateItem(item, field, value) {
    if (isMaterial.value) {
        updateMaterial(item.name, field, value)
    } else {
        updateCraft(item.key, field, value)
    }
}

const diffColor = {
    '매우쉬움': '#10b981', '쉬움': '#34d399', '약간쉬움': '#6ee7b7',
    '보통': '#60a5fa', '약간어려움': '#a78bfa', '어려움': '#f59e0b',
    '매우어려움': '#fb923c', '극히어려움': '#ef4444',
    '약간악랄함': '#dc2626', '악랄함': '#991b1b',
    '매우악랄함': '#7f1d1d', '극악': '#6b0000', '지옥': '#450a0a', '시그니션': '#6b7280',
}

function handleCommaInput(e) {
    const raw = e.target.value.replace(/,/g, '')
    if (raw === '' || isNaN(raw)) return
    e.target.value = Number(raw).toLocaleString()
}

function parseComma(val) {
    return Number(String(val).replace(/,/g, '')) || 0
}

const fmt = (n) => Math.round(n).toLocaleString()

function formatNeeded(count) {
    if (count === 0) return null
    const shulker = Math.floor(count / 1728)
    const r1 = count % 1728
    const stack = Math.floor(r1 / 64)
    const r2 = r1 % 64
    const parts = []
    if (shulker > 0) parts.push(`${shulker}셜커`)
    if (stack > 0) parts.push(`${stack}세트`)
    if (r2 > 0) parts.push(`${r2}개`)
    return parts.join(' ')
}
</script>

<template>
    <main class="pokedex-panel">

        <!-- 헤더 -->
        <header class="panel-header">
            <h1 class="panel-title">{{ title }}</h1>
            <div class="mastery-wrap">
                <label>도감 마스터리</label>
                <input type="text" inputmode="numeric" :value="masteryLevel > 0 ? masteryLevel.toLocaleString() : ''"
                    class="mastery-input" placeholder="0" @input="handleCommaInput($event)"
                    @change="updateMastery(parseComma($event.target.value))" />
                <span class="unit">단계</span>
            </div>
        </header>

        <!-- 효율 계산 바 -->
        <div class="efficiency-bar">
            <div class="eff-left">
                <span class="eff-label">목표 도감 레벨</span>
                <input type="text" inputmode="numeric" :value="targetLevel > 0 ? targetLevel.toLocaleString() : ''"
                    class="target-input" placeholder="1" @input="handleCommaInput($event)"
                    @change="targetLevel = parseComma($event.target.value)" />
                <span class="unit">레벨</span>
                <button class="eff-btn" @click="calcEfficiency">⚡ 효율 계산</button>
            </div>
            <div class="cur-level">현재 <strong>{{ pokedexLevel.toFixed(2) }}</strong> 레벨</div>
        </div>

        <!-- 메인 테이블 -->
        <div class="table-wrap">
            <table class="pokedex-table">
                <colgroup>
                    <col style="width:150px">
                    <col style="width:80px">
                    <col style="width:70px">
                    <col style="width:120px">
                    <col style="width:90px">
                    <col style="width:110px">
                    <col style="width:110px">
                    <col style="width:130px">
                    <col style="width:44px">
                </colgroup>
                <thead>
                    <tr>
                        <th style="text-align:left">아이템</th>
                        <th style="text-align:left">난이도</th>
                        <th style="text-align:center">현재 단계</th>
                        <th style="text-align:right">현재 등록</th>
                        <th style="text-align:center">목표 단계</th>
                        <th style="text-align:right">필요 납품</th>
                        <th style="text-align:right">시세 (개당)</th>
                        <th style="text-align:right">예상 비용</th>
                        <th style="text-align:center">시뮬</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in items" :key="item.key || item.name" class="item-row">
                        <td style="text-align:left">
                            <div class="item-name-wrap">
                                <img v-if="getItemImage(item.name)" :src="getItemImage(item.name)" :alt="item.name"
                                    class="item-img" @error="$event.target.style.display = 'none'" />
                                <span class="item-name">{{ item.name }}</span>
                            </div>
                        </td>
                        <td style="text-align:left">
                            <span class="diff-tag"
                                :style="{ background: (diffColor[item.difficulty] || '#6b7280') + '22', color: diffColor[item.difficulty] || '#6b7280' }">
                                {{ item.difficulty }}
                            </span>
                        </td>
                        <td style="text-align:center">
                            <span class="stage-val">{{ item.stage }}단계</span>
                        </td>
                        <td style="text-align:right">
                            <input type="text" inputmode="numeric"
                                :value="item.entry.current > 0 ? item.entry.current.toLocaleString() : ''"
                                class="num-input" placeholder="0" @input="handleCommaInput($event)"
                                @change="updateItem(item, 'current', parseComma($event.target.value))" />
                            <div class="sub-hint">≈ {{ fmt(item.registered) }}개 등록</div>
                        </td>
                        <td style="text-align:center">
                            <select class="stage-select" :value="item.entry.target"
                                @change="updateItem(item, 'target', $event.target.value)">
                                <option v-for="n in 12" :key="n - 1" :value="n - 1">{{ n - 1 }}단계</option>
                            </select>
                        </td>
                        <td style="text-align:right">
                            <span v-if="item.needed === 0" class="done-badge">✓ 달성</span>
                            <template v-else>
                                <div class="needed-val">{{ fmt(item.needed) }}개</div>
                                <div class="sub-hint">{{ formatNeeded(item.needed) }}</div>
                            </template>
                        </td>
                        <td style="text-align:right">
                            <input type="text" inputmode="numeric"
                                :value="item.entry.price > 0 ? item.entry.price.toLocaleString() : ''" class="num-input"
                                placeholder="0" @input="handleCommaInput($event)"
                                @change="updateItem(item, 'price', parseComma($event.target.value))" />
                        </td>
                        <td style="text-align:right">
                            <span v-if="item.totalCost > 0" class="cost-val">{{ fmt(item.totalCost) }}</span>
                            <span v-else class="no-val">-</span>
                        </td>
                        <td style="text-align:center">
                            <button v-if="canSim(item.name)" class="sim-btn" @click="openSim(item.name)">🎲</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 푸터 -->
        <footer class="pokedex-footer">
            <div class="footer-top">
                <div class="level-card">
                    <div class="lc-label">현재 도감 레벨</div>
                    <div class="lc-value">{{ pokedexLevel.toFixed(2) }}<span class="lc-unit"> 레벨</span></div>
                    <div class="lc-sub">숙련도 {{items.reduce((s, i) => s + i.stage, 0)}} / {{ items.length }}개 아이템</div>
                </div>
                <div class="total-cost-card">
                    <div class="lc-label">목표 단계 달성 시</div>
                    <div class="lc-value" style="color:#38bdf8">
                        {{ (items.reduce((s, i) => s + Number(i.entry.target), 0) / items.length).toFixed(2) }}
                        <span class="lc-unit"> 레벨</span>
                    </div>
                    <div class="lc-sub">목표 숙련도 {{ items.reduce((s, i) => s + Number(i.entry.target), 0) }}</div>
                </div>
                <div class="total-cost-card" v-if="items.some(i => i.totalCost > 0)">
                    <div class="lc-label">목표까지 총 예상 비용</div>
                    <div class="lc-value coin">{{ fmt(items.reduce((s, i) => s + i.totalCost, 0)) }}<span class="lc-unit"> 코인</span></div>
                </div>
            </div>
            <div class="rewards-wrap">
                <div class="rewards-title">📋 레벨별 보상</div>
                <div class="rewards-grid">
                    <div v-for="reward in rewards" :key="reward.level" class="reward-chip"
                        :class="{ achieved: Math.floor(pokedexLevel) >= reward.level }">
                        <span class="rc-level">{{ reward.level }}레벨</span>
                        <span class="rc-desc">{{ reward.reward }}</span>
                        <span v-if="Math.floor(pokedexLevel) >= reward.level" class="rc-check">✓</span>
                    </div>
                </div>
            </div>
        </footer>

        <!-- ════ 효율 계산 모달 ════ -->
        <div v-if="showEffModal" class="eff-modal-overlay" @click.self="showEffModal = false">
            <div class="eff-modal">
                <div class="eff-modal-header">
                    <h2>⚡ 효율 계산</h2>
                    <button class="eff-modal-close" @click="showEffModal = false">✕</button>
                </div>

                <div class="eff-modal-body" v-if="efficiencyResult">
                    <!-- 요약 -->
                    <div class="eff-info-row">
                        <div class="eff-info-item">
                            <div class="eff-info-label">현재 숙련도</div>
                            <div class="eff-info-value">{{ efficiencyResult.currentTotalStage }}</div>
                        </div>
                        <div class="eff-info-sep">→</div>
                        <div class="eff-info-item">
                            <div class="eff-info-label">목표 숙련도</div>
                            <div class="eff-info-value accent">{{ efficiencyResult.targetTotalStage }}</div>
                        </div>
                        <div class="eff-info-item">
                            <div class="eff-info-label">부족</div>
                            <div class="eff-info-value warn">{{ efficiencyResult.stageNeeded }}단계</div>
                        </div>
                    </div>

                    <!-- 전략 선택 -->
                    <div class="strategy-row">
                        <button class="strat-btn" :class="{ active: strategy === 'cheap' }" @click="strategy = 'cheap'">
                            💰 최저 비용
                            <span class="strat-sub">가장 싸지만 귀찮을 수 있음</span>
                        </button>
                        <button class="strat-btn" :class="{ active: strategy === 'balanced' }"
                            @click="strategy = 'balanced'">
                            ⚖️ 균형
                            <span class="strat-sub">비용 + 편의성 균형</span>
                        </button>
                        <button class="strat-btn" :class="{ active: strategy === 'fast' }" @click="strategy = 'fast'">
                            ⚡ 균등 분배
                            <span class="strat-sub">아이템 고르게 올리기</span>
                        </button>
                    </div>

                    <!-- 선택 플랜 요약 -->
                    <div class="plan-summary-row" v-if="efficiencyResult.plans[strategy]">
                        <div class="plan-info">
                            <span class="plan-info-label">총 납품</span>
                            <span class="plan-info-value">{{ fmt(efficiencyResult.plans[strategy].totalNeeded)
                                }}개</span>
                        </div>
                        <div class="plan-info">
                            <span class="plan-info-label">총 비용</span>
                            <span class="plan-info-value accent">{{ fmt(efficiencyResult.plans[strategy].totalCost) }}
                                코인</span>
                        </div>
                    </div>

                    <!-- 변경 목록 -->
                    <div class="eff-list-wrap" v-if="efficiencyResult.plans[strategy]">
                        <table class="eff-table">
                            <thead>
                                <tr>
                                    <th>아이템</th>
                                    <th style="text-align:center; width:70px">현재</th>
                                    <th style="text-align:center; width:80px">목표 단계</th>
                                    <th style="text-align:right; width:90px">필요 납품</th>
                                    <th style="text-align:right; width:110px">예상 비용</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="a in efficiencyResult.plans[strategy].assigned" :key="a.key || a.name"
                                    :class="{ 'row-unchanged': a.extraStage === 0 }">
                                    <td>
                                        <div class="item-name-wrap">
                                            <img v-if="getItemImage(a.name)" :src="getItemImage(a.name)" :alt="a.name"
                                                class="item-img" @error="$event.target.style.display = 'none'" />
                                            <span class="item-name">{{ a.name }}</span>
                                        </div>
                                    </td>
                                    <td style="text-align:center; color:var(--text-tertiary); font-size:12px">{{ a.stage
                                    }}단계
                                    </td>
                                    <td style="text-align:center">
                                        <select class="modal-stage-select" :value="a.targetStage"
                                            @change="adjustPlanTarget(a.key || a.name, $event.target.value)">
                                            <option v-for="n in 12" :key="n - 1" :value="n - 1">{{ n - 1 }}단계</option>
                                        </select>
                                    </td>
                                    <td style="text-align:right; font-size:12px">{{ fmt(a.totalNeeded) }}개</td>
                                    <td style="text-align:right">
                                        <span v-if="a.totalCost > 0" class="cost-val">{{ fmt(a.totalCost) }}</span>
                                        <span v-else class="no-val">-</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="eff-modal-footer">
                    <div class="total-cost-row" v-if="efficiencyResult?.plans[strategy]">
                        목표 레벨 {{ targetLevel }} 달성까지 총
                        <strong class="total-cost-val">{{ fmt(efficiencyResult.plans[strategy].totalCost) }} 코인</strong>
                    </div>
                    <button class="apply-btn" @click="applyPlan">✅ 목표 단계 적용</button>
                </div>
            </div>
        </div>

        <SimulationModal v-if="simItem" :item="simItem.item" :job="simItem.job" :tier="simItem.tier"
            :initial-target="simItem.initialTarget" @close="simItem = null" />
    </main>
</template>

<style scoped>
.pokedex-panel {
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

.mastery-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
}

.mastery-input {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 14px;
    font-weight: 700;
    width: 70px;
    text-align: center;
}

.mastery-input:focus {
    border-color: var(--accent);
    outline: none;
}

.unit {
    font-size: 12px;
    color: var(--text-tertiary);
}

/* ── 효율 계산 바 ── */
.efficiency-bar {
    padding: 12px 28px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
}

.eff-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
}

.eff-label {
    font-size: 13px;
    color: var(--text-secondary);
}

.target-input {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 14px;
    font-weight: 700;
    width: 60px;
    text-align: center;
}

.target-input:focus {
    border-color: var(--accent);
    outline: none;
}

.eff-btn {
    background: var(--accent);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
}

.eff-btn:hover {
    background: var(--accent-hover);
}

.cur-level {
    font-size: 13px;
    color: var(--text-secondary);
}

.cur-level strong {
    color: var(--accent);
    font-size: 16px;
}

/* ── 메인 테이블 ── */
.table-wrap {
    flex: 1;
    overflow: auto;
    min-height: 0;
}

.pokedex-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    table-layout: fixed;
}

.pokedex-table thead {
    position: sticky;
    top: 0;
    background: var(--bg-secondary);
    z-index: 10;
}

.pokedex-table th {
    padding: 10px 12px;
    font-size: 11px;
    color: var(--text-tertiary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
    overflow: hidden;
}

.item-row {
    border-bottom: 1px solid var(--border);
    transition: background 0.1s;
}

.item-row:hover {
    background: var(--bg-tertiary);
}

.pokedex-table td {
    padding: 8px 12px;
    height: 56px;
    vertical-align: middle;
    overflow: hidden;
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

.diff-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 4px;
    white-space: nowrap;
}

.stage-val {
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
}

.num-input {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 12px;
    font-weight: 600;
    width: 90px;
    text-align: right;
}

.num-input:focus {
    border-color: var(--accent);
    outline: none;
}

.sub-hint {
    font-size: 10px;
    color: var(--text-tertiary);
    margin-top: 2px;
    white-space: nowrap;
    text-align: right;
}

.stage-select {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 5px 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    width: 72px;
}

.stage-select:focus {
    border-color: var(--accent);
    outline: none;
}

.needed-val {
    font-weight: 700;
    color: var(--text-primary);
}

.done-badge {
    color: #34d399;
    font-weight: 700;
    font-size: 12px;
}

.cost-val {
    font-weight: 600;
    color: #f59e0b;
}

.no-val {
    color: var(--text-tertiary);
}

.sim-btn {
    background: var(--accent-soft);
    border: none;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 14px;
    cursor: pointer;
}

.sim-btn:hover {
    background: var(--accent);
}

/* ── 푸터 ── */
.pokedex-footer {
    border-top: 1px solid var(--border);
    padding: 16px 28px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 260px;
    overflow-y: auto;
}

.footer-top {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.level-card,
.total-cost-card {
    background: var(--bg-tertiary);
    border-radius: 12px;
    padding: 14px 18px;
    min-width: 180px;
}

.lc-label {
    font-size: 11px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 4px;
}

.lc-value {
    font-size: 26px;
    font-weight: 800;
    color: var(--accent);
}

.lc-value.coin {
    color: #f59e0b;
}

.lc-unit {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
}

.lc-sub {
    font-size: 11px;
    color: var(--text-tertiary);
    margin-top: 3px;
}

.rewards-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
}

.rewards-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.reward-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 5px 10px;
    font-size: 12px;
    opacity: 0.45;
    transition: opacity 0.15s;
}

.reward-chip.achieved {
    opacity: 1;
    border-color: var(--accent-soft);
    background: rgba(139, 92, 246, 0.08);
}

.rc-level {
    font-weight: 700;
    color: var(--accent);
    white-space: nowrap;
}

.rc-desc {
    color: var(--text-primary);
}

.rc-check {
    color: #34d399;
    font-weight: 700;
}

/* ════ 효율 계산 모달 ════ */
.eff-modal-overlay {
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

.eff-modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 16px;
    width: 100%;
    max-width: 680px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.eff-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}

.eff-modal-header h2 {
    font-size: 18px;
    font-weight: 700;
}

.eff-modal-close {
    background: transparent;
    border: none;
    color: var(--text-tertiary);
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
}

.eff-modal-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.eff-modal-body {
    flex: 1;
    overflow-y: auto;
}

/* 요약 */
.eff-info-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 24px;
    background: rgba(139, 92, 246, 0.06);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
}

.eff-info-label {
    font-size: 11px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.eff-info-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
    margin-top: 2px;
}

.eff-info-value.accent {
    color: var(--accent);
}

.eff-info-value.warn {
    color: #f59e0b;
}

.eff-info-sep {
    font-size: 20px;
    color: var(--text-tertiary);
}

/* 전략 */
.strategy-row {
    display: flex;
    gap: 8px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
}

.strat-btn {
    flex: 1;
    min-width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.strat-btn:hover {
    border-color: var(--accent);
    color: var(--text-primary);
}

.strat-btn.active {
    border-color: var(--accent);
    background: var(--accent-soft);
    color: var(--accent);
}

.strat-sub {
    font-size: 10px;
    font-weight: 400;
    color: var(--text-tertiary);
    text-align: center;
}

.strat-btn.active .strat-sub {
    color: var(--accent);
    opacity: 0.7;
}

/* 플랜 요약 */
.plan-summary-row {
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 12px 24px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
}

.plan-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.plan-info-label {
    font-size: 12px;
    color: var(--text-tertiary);
}

.plan-info-value {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
}

.plan-info-value.accent {
    color: var(--accent);
}

/* 변경 목록 */
.eff-list-wrap {
    overflow-x: auto;
}

.eff-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.eff-table th {
    padding: 8px 12px;
    font-size: 11px;
    color: var(--text-tertiary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
}

.eff-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
}

.eff-table tr:last-child td {
    border-bottom: none;
}

.eff-table tr:hover td {
    background: var(--bg-tertiary);
}

/* 모달 푸터 */
.eff-modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    gap: 12px;
    flex-wrap: wrap;
}

.total-cost-row {
    font-size: 13px;
    color: var(--text-secondary);
}

.total-cost-val {
    color: #f59e0b;
    font-size: 16px;
    margin-left: 6px;
}

.apply-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
}

.apply-btn:hover {
    background: #059669;
}

/* ── 모바일 ── */
@media (max-width: 767px) {

    .panel-header,
    .efficiency-bar,
    .pokedex-footer {
        padding: 12px 16px;
    }

    .panel-title {
        font-size: 16px;
    }

    .eff-modal-overlay {
        padding: 0;
        align-items: flex-end;
    }

    .eff-modal {
        border-radius: 20px 20px 0 0;
        max-height: 92vh;
        max-width: 100%;
    }

    .eff-modal-header,
    .eff-modal-footer {
        padding: 16px;
    }

    .strategy-row,
    .eff-info-row,
    .plan-summary-row {
        padding: 12px 16px;
    }

    .strat-btn {
        min-width: 90px;
        font-size: 12px;
        padding: 8px;
    }

    .apply-btn {
        width: 100%;
    }
}

.modal-stage-select {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    border-radius: 6px;
    padding: 4px 4px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    width: 68px;
}

.modal-stage-select:focus {
    border-color: var(--accent);
    outline: none;
}

.row-unchanged td {
    opacity: 0.4;
}
</style>