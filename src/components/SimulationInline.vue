<script setup>
import { ref, computed, watch } from 'vue'
import { simulateAttempts, getCompletionProbability } from '../utils/simulator.js'
import OutcomeChart from './OutcomeChart.vue'
import { getItemImage } from '../data/imageMap.js'
import { useSettings } from '../composables/useSettings.js'

const props = defineProps({
    item: { type: Object, required: true },
    job: { type: String, required: true },
    tier: { type: String, required: true },
    initialTarget: { type: Number, default: 1 },
})

const emit = defineEmits(['apply-count'])

const { getProbabilityByDbKey } = useSettings()

function buildInitialOutcomes() {
    const item = props.item
    const list = []
    const savedProb = getProbabilityByDbKey(props.tier)

    if (item.artisanSuccessQuantity !== undefined) {
        list.push({ key: 'artisan', label: '장인', chance: savedProb?.artisanSuccess ?? 0, quantity: item.artisanSuccessQuantity, readonly: false, color: '#f59e0b' })
        list.push({ key: 'normal_fail', label: `평범 (실패 → ${item.normalSuccessItemName})`, chance: savedProb?.normalSuccess ?? 0, quantity: 0, readonly: false, color: '#71717a' })
        return list
    }

    if (item.criticalSuccessQuantity > 0) {
        list.push({
            key: 'critical',
            label: props.job === 'crafter' ? '영감받음' : '대성공',
            chance: props.job === 'crafter' ? (savedProb?.inspired ?? 0) : (savedProb?.criticalSuccess ?? 0),
            quantity: item.criticalSuccessQuantity,
            readonly: false,
            color: props.job === 'crafter' ? '#a855f7' : '#fbbf24',
        })
    }
    if (item.additionalSuccessQuantity > 0) {
        list.push({ key: 'additional', label: '추가 제작', chance: savedProb?.additional ?? 0, quantity: item.additionalSuccessQuantity, readonly: false, color: '#34d399' })
    }
    if (item.normalSuccessQuantity > 0) {
        list.push({ key: 'normal', label: '성공', chance: savedProb?.normalSuccess ?? 0, quantity: item.normalSuccessQuantity, readonly: false, color: '#60a5fa' })
    }
    if (list.length === 1 && list[0].key === 'normal') {
        list[0].chance = 100
        list[0].readonly = true
    }
    return list
}

const autoFilledKey = ref(null)
const outcomes = ref(buildInitialOutcomes())
const targetQuantity = ref(props.initialTarget)
const result = ref(null)
const isComputing = ref(false)
const selectedAttempts = ref(null)

watch(() => props.item, () => {
    outcomes.value = buildInitialOutcomes()
    targetQuantity.value = props.initialTarget
    result.value = null
    selectedAttempts.value = null
})

watch(() => props.initialTarget, (val) => {
    targetQuantity.value = val
})

const totalChance = computed(() => outcomes.value.reduce((s, o) => s + Number(o.chance || 0), 0))
const isValid = computed(() => Math.abs(totalChance.value - 100) < 0.5 && Number(targetQuantity.value) > 0)

function autoFillIfPossible() {
    const editable = outcomes.value.filter(o => !o.readonly)
    if (editable.length < 2) return
    if (autoFilledKey.value) {
        const was = editable.find(o => o.key === autoFilledKey.value)
        if (was) { was.chance = 0; autoFilledKey.value = null }
    }
    const filled = editable.filter(o => Number(o.chance) > 0)
    const empty = editable.filter(o => Number(o.chance) === 0)
    if (empty.length === 1 && filled.length === editable.length - 1) {
        const sum = filled.reduce((s, o) => s + Number(o.chance), 0)
        if (sum > 0 && sum < 100) {
            empty[0].chance = Number((100 - sum).toFixed(2))
            autoFilledKey.value = empty[0].key
        }
    }
}

async function runSimulation() {
    if (!isValid.value) return
    isComputing.value = true
    await new Promise(r => setTimeout(r, 50))
    const numericOutcomes = outcomes.value.map(o => ({ chance: Number(o.chance), quantity: Number(o.quantity) }))
    result.value = simulateAttempts(Number(targetQuantity.value), numericOutcomes, 10000)
    selectedAttempts.value = Math.round(result.value.mean)
    isComputing.value = false
}

const selectedInfo = computed(() => {
    if (!result.value || selectedAttempts.value == null) return null
    const probability = getCompletionProbability(result.value.sortedAttempts, selectedAttempts.value)
    const totalMaterials = props.item.requiredMaterials.map(m => ({
        ...m, totalRequired: m.requiredQuantity * selectedAttempts.value,
    }))
    return { attempts: selectedAttempts.value, probability, totalMaterials }
})

const handleBarClick = (attempts) => {
    selectedAttempts.value = attempts
}

function applyCount() {
    if (selectedAttempts.value) {
        emit('apply-count', selectedAttempts.value)
    }
}

const categoryMap = {
    vanilla: '바닐라', farmer: '농부', lumberjack: '나무꾼',
    fisher: '어부', miner: '광부', hunter: '사냥꾼', blacksmith: '대장장이',
}
const sourceCategoryLabel = (cat) => categoryMap[cat] || cat
const sourceCategoryColor = (cat) => `var(--job-${cat})`

const formatStacks = (count) => {
    if (count < 64) return `${count}개`
    const shulker = Math.floor(count / 1728)
    const r1 = count % 1728
    const stacks = Math.floor(r1 / 64)
    const remainder = r1 % 64
    const parts = []
    if (shulker > 0) parts.push(`${shulker}셜커`)
    if (stacks > 0) parts.push(`${stacks}세트`)
    if (remainder > 0) parts.push(`${remainder}개`)
    return `${count.toLocaleString()}개 (${parts.join(' ')})`
}
</script>

<template>
    <div class="sim-inline">
        <div class="sim-header">
            <div class="sim-title">
                <img v-if="getItemImage(item.itemName)" :src="getItemImage(item.itemName)"
                    :alt="item.itemName" class="sim-img"
                    @error="$event.target.style.display='none'" />
                <strong>{{ item.itemName }}</strong> 시뮬레이션
            </div>
        </div>

        <div class="sim-body">
            <!-- 좌측: 입력 -->
            <div class="sim-input">
                <div class="input-row">
                    <label>목표 수량</label>
                    <input type="number" v-model.number="targetQuantity" min="1" class="num-input" />
                    <span class="suffix">개</span>
                </div>

                <div class="outcomes-block">
                    <div class="block-header">
                        <span class="block-title">제작 등급별 확률</span>
                    </div>
                    <div v-for="o in outcomes" :key="o.key" class="outcome-row">
                        <div class="outcome-label" :style="{ color: o.color }">{{ o.label }}</div>
                        <input type="number" v-model.number="o.chance" step="0.01" min="0" max="100"
                            :readonly="o.readonly" class="num-input chance-input"
                            :class="{ readonly: o.readonly }"
                            @input="autoFillIfPossible" />
                        <span class="suffix">%</span>
                        <span class="outcome-qty">→ {{ o.quantity }}개</span>
                    </div>
                    <div class="total-chance" :class="{ invalid: Math.abs(totalChance - 100) > 0.5 }">
                        합계: <strong>{{ totalChance.toFixed(2) }}%</strong>
                        <span v-if="Math.abs(totalChance - 100) > 0.5"> · 100%여야 합니다</span>
                    </div>
                </div>

                <button class="run-btn" :disabled="!isValid || isComputing" @click="runSimulation">
                    {{ isComputing ? '계산 중...' : '🎲 시뮬레이션 실행' }}
                </button>
            </div>

            <!-- 우측: 결과 -->
            <div class="sim-result">
                <div v-if="!result" class="empty-state">
                    <div class="empty-icon">📊</div>
                    <p>왼쪽에서 시뮬레이션을 실행해주세요</p>
                </div>
                <template v-else>
                    <div class="stats-row">
                        <div class="stat"><div class="stat-label">최소</div><div class="stat-value">{{ result.min }}회</div></div>
                        <div class="stat"><div class="stat-label">평균</div><div class="stat-value highlight">{{ result.mean.toFixed(1) }}회</div></div>
                        <div class="stat"><div class="stat-label">최대</div><div class="stat-value">{{ result.max }}회</div></div>
                    </div>

                    <OutcomeChart
                        :distribution="result.distribution"
                        :sorted-attempts="result.sortedAttempts"
                        :selected="selectedAttempts"
                        @bar-click="handleBarClick"
                    />

                    <div v-if="selectedInfo" class="selected-info">
                        <div class="info-header">
                            <div class="info-title">📌 <strong>{{ selectedInfo.attempts }}번</strong> 시도</div>
                            <div class="info-prob">완료 확률 <strong>{{ selectedInfo.probability.toFixed(2) }}%</strong></div>
                            <button class="apply-btn" @click="applyCount">
                                ✅ {{ selectedInfo.attempts }}개 적용
                            </button>
                        </div>
                        <div class="materials-list">
                            <div v-for="m in selectedInfo.totalMaterials" :key="m.materialName" class="material-row">
                                <span class="source-tag" :style="{ background: sourceCategoryColor(m.sourceCategory) }">
                                    {{ sourceCategoryLabel(m.sourceCategory) }}
                                </span>
                                <img v-if="getItemImage(m.materialName)" :src="getItemImage(m.materialName)"
                                    :alt="m.materialName" class="mat-img"
                                    @error="$event.target.style.display='none'" />
                                <span class="material-name">{{ m.materialName }}</span>
                                <span class="material-qty">{{ formatStacks(m.totalRequired) }}</span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
.sim-inline {
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg-secondary);
}
.sim-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    background: rgba(139,92,246,0.06);
}
.sim-title {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 700; color: var(--text-primary);
}
.sim-img { width: 20px; height: 20px; object-fit: contain; image-rendering: pixelated; }

.sim-body {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 0;
}

.sim-input {
    border-right: 1px solid var(--border);
    padding: 16px;
    display: flex; flex-direction: column; gap: 16px;
}

.input-row { display: flex; align-items: center; gap: 8px; }
.input-row label { font-size: 13px; font-weight: 600; color: var(--text-secondary); min-width: 70px; }
.num-input {
    background: var(--bg-tertiary); border: 1px solid var(--border);
    color: var(--text-primary); border-radius: 8px;
    padding: 6px 10px; font-size: 13px; font-weight: 600; width: 100%;
}
.num-input:focus { border-color: var(--accent); outline: none; }
.num-input.readonly { background: var(--bg-primary); color: var(--text-tertiary); cursor: not-allowed; }
.suffix { font-size: 12px; color: var(--text-tertiary); }

.outcomes-block { background: var(--bg-tertiary); border-radius: 10px; padding: 12px; }
.block-title { font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
.block-header { margin-bottom: 10px; }
.outcome-row {
    display: grid; grid-template-columns: 90px 1fr auto auto;
    gap: 6px; align-items: center; margin-bottom: 6px;
}
.outcome-label { font-size: 11px; font-weight: 700; }
.chance-input { max-width: 70px; }
.outcome-qty { font-size: 11px; color: var(--text-tertiary); white-space: nowrap; }
.total-chance { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-secondary); }
.total-chance.invalid { color: #ef4444; }

.run-btn {
    background: var(--accent); color: white; border: none;
    border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
}
.run-btn:hover:not(:disabled) { background: var(--accent-hover); }
.run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.sim-result { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-tertiary); gap: 8px; padding: 32px 0; }
.empty-icon { font-size: 36px; opacity: 0.3; }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.stat { background: var(--bg-tertiary); border-radius: 8px; padding: 10px; text-align: center; }
.stat-label { font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; }
.stat-value { font-size: 18px; font-weight: 700; margin-top: 2px; }
.stat-value.highlight { color: var(--accent); }

.selected-info { background: var(--bg-tertiary); border-radius: 10px; padding: 12px; border: 1px solid var(--accent-soft); }
.info-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.info-title { font-size: 13px; }
.info-prob { font-size: 13px; color: var(--accent); }
.apply-btn {
    margin-left: auto; background: #10b981; color: white; border: none;
    border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer;
}
.apply-btn:hover { background: #059669; }

.materials-list { display: flex; flex-direction: column; gap: 4px; }
.material-row { display: grid; grid-template-columns: 56px 20px 1fr auto; gap: 8px; align-items: center; font-size: 12px; padding: 4px 0; }
.source-tag { font-size: 9px; font-weight: 700; color: white; padding: 2px 5px; border-radius: 3px; text-align: center; }
.mat-img { width: 18px; height: 18px; object-fit: contain; image-rendering: pixelated; }
.material-name { color: var(--text-primary); }
.material-qty { color: var(--text-secondary); font-weight: 600; white-space: nowrap; }

@media (max-width: 767px) {
    .sim-body { grid-template-columns: 1fr; }
    .sim-input { border-right: none; border-bottom: 1px solid var(--border); }
}
</style>