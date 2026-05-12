<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { simulateAttempts, getCompletionProbability } from "../utils/simulator.js";
import OutcomeChart from "./OutcomeChart.vue";
import { findItemByName } from "../utils/searchHelper.js";
import { getItemImage } from '../data/imageMap.js'
import { useSettings} from '../composables/useSettings.js'

const props = defineProps({
  item: { type: Object, required: true },
  job: { type: String, required: true },
  tier: { type: String, required: true },
  initialTarget: { type: Number, default: 0 }, // 부모가 요구하는 양
});
const emit = defineEmits(["close"]);

const {getProbabilityByDbKey} = useSettings();

// ════════════════════════════════════════
// 등급 입력칸 자동 생성 
// ════════════════════════════════════════
function buildInitialOutcomes() {
  const item = props.item;
  const list = [];

  // 설정에서 확률 가져오기 (tier 키 기반)
  const savedProb = getProbabilityByDbKey(props.tier);

  // ① Tier4: 장인 / 평범 (실패)
  if (item.artisanSuccessQuantity !== undefined) {
    list.push({
      key: "artisan",
      label: "장인",
      chance: savedProb?.artisanSuccess ?? 0,
      quantity: item.artisanSuccessQuantity,
      readonly: false,
      color: "#f59e0b",
    });
    list.push({
      key: "normal_fail",
      label: `평범 (실패 → ${item.normalSuccessItemName})`,
      chance: savedProb?.normalSuccess ?? 0,
      quantity: 0,
      readonly: false,
      color: "#71717a",
    });
    return list;
  }

  // ② 일반: 데이터에 있는 등급만 동적으로
  const hasCritical = item.criticalSuccessQuantity > 0;
  const hasAdditional = item.additionalSuccessQuantity > 0;
  const hasNormal = item.normalSuccessQuantity > 0;

  if (hasCritical) {
    // 공예가: inspired (영감받음) / 대장장이: criticalSuccess (대성공)
    const chanceValue = props.job === "crafter"
      ? (savedProb?.inspired ?? 0)
      : (savedProb?.criticalSuccess ?? 0);

    list.push({
      key: "critical",
      label: props.job === "crafter" ? "영감받음" : "대성공",
      chance: chanceValue,
      quantity: item.criticalSuccessQuantity,
      readonly: false,
      color: props.job === "crafter" ? "#a855f7" : "#fbbf24",
    });
  }

  if (hasAdditional) {
    list.push({
      key: "additional",
      label: "추가 제작",
      chance: savedProb?.additional ?? 0,
      quantity: item.additionalSuccessQuantity,
      readonly: false,
      color: "#34d399",
    });
  }

  if (hasNormal) {
    list.push({
      key: "normal",
      label: "성공",
      chance: savedProb?.normalSuccess ?? 0,
      quantity: item.normalSuccessQuantity,
      readonly: false,
      color: "#60a5fa",
    });
  }

  // ③ 도구류 (성공만 있는 경우): 100% 자동 + readonly
  if (list.length === 1 && list[0].key === "normal") {
    list[0].chance = 100;
    list[0].readonly = true;
  }

  return list;
}

// 자동 채워진 칸 키 추적
const autoFilledKey = ref(null);

// ════════════════════════════════════════
// 자동 채우기: 마지막 빈 칸 자동 계산
// ════════════════════════════════════════
function autoFillIfPossible() {
  const editable = outcomes.value.filter((o) => !o.readonly);
  if (editable.length < 2) return;

  // 자동 채워진 칸이 있으면 → 모두 초기화 (사용자가 수동값을 바꾼 것)
  // 단, 방금 자동 채운 칸이 변경된 거면 무시
  if (autoFilledKey.value) {
    const wasAutoFilled = editable.find((o) => o.key === autoFilledKey.value);
    if (wasAutoFilled) {
      wasAutoFilled.chance = 0;
      autoFilledKey.value = null;
    }
  }

  // 채워진/비어있는 칸 분석
  const filled = editable.filter((o) => Number(o.chance) > 0);
  const empty = editable.filter((o) => Number(o.chance) === 0);

  // 한 칸만 비어있고 나머지 합이 100 미만이면 자동 채움
  if (empty.length === 1 && filled.length === editable.length - 1) {
    const sum = filled.reduce((s, o) => s + Number(o.chance), 0);
    if (sum > 0 && sum < 100) {
      empty[0].chance = Number((100 - sum).toFixed(2));
      autoFilledKey.value = empty[0].key;
    }
  }
}

// ════════════════════════════════════════
// 상태
// ════════════════════════════════════════
const targetQuantity = ref(props.initialTarget);
const outcomes = ref(buildInitialOutcomes());

const totalChance = computed(() =>
  outcomes.value.reduce((s, o) => s + Number(o.chance || 0), 0)
);
const isValid = computed(
  () => Math.abs(totalChance.value - 100) < 0.5 && Number(targetQuantity.value) > 0
);

// ════════════════════════════════════════
// 시뮬레이션
// ════════════════════════════════════════
const result = ref(null);
const isComputing = ref(false);
const selectedAttempts = ref(null);

async function runSimulation() {
  if (!isValid.value) return;

  isComputing.value = true;
  await new Promise((r) => setTimeout(r, 50)); // UI 블로킹 방지

  const numericOutcomes = outcomes.value.map((o) => ({
    chance: Number(o.chance),
    quantity: Number(o.quantity),
  }));

  result.value = simulateAttempts(Number(targetQuantity.value), numericOutcomes, 10000);

  // 기본 강조: 평균값과 가장 가까운 막대
  selectedAttempts.value = Math.round(result.value.mean);
  isComputing.value = false;
}

// ════════════════════════════════════════
// 막대 클릭 시 정보
// ════════════════════════════════════════
const selectedInfo = computed(() => {
  if (!result.value || selectedAttempts.value == null) return null;

  const probability = getCompletionProbability(
    result.value.sortedAttempts,
    selectedAttempts.value
  );

  // 재료 합산: 시도 횟수 × 1세트 재료
  const totalMaterials = props.item.requiredMaterials.map((m) => ({
    ...m,
    totalRequired: m.requiredQuantity * selectedAttempts.value,
  }));

  return {
    attempts: selectedAttempts.value,
    probability,
    totalMaterials,
  };
});

const handleBarClick = (attempts) => {
  selectedAttempts.value = attempts;
};

// ════════════════════════════════════════
// 카테고리 라벨/색상
// ════════════════════════════════════════
const categoryMap = {
  vanilla: "바닐라",
  farmer: "농부",
  lumberjack: "나무꾼",
  fisher: "어부",
  miner: "광부",
  hunter: "사냥꾼",
  blacksmith: "대장장이",
};
const sourceCategoryLabel = (cat) => categoryMap[cat] || cat;
const sourceCategoryColor = (cat) => `var(--job-${cat})`;

// ════════════════════════════════════════
// ESC 키로 닫기
// ════════════════════════════════════════
const handleEsc = (e) => {
  if (e.key === "Escape") emit("close");
};
onMounted(() => window.addEventListener("keydown", handleEsc));
onBeforeUnmount(() => window.removeEventListener("keydown", handleEsc));

// ════════════════════════════════════════
// 하위 재료 시뮬 (재귀)
// ════════════════════════════════════════
const subSimItem = ref(null); // 하위 시뮬 대상

const handleSubSim = (material) => {
  const found = findItemByName(material.materialName);
  if (!found) return;

  // 시뮬 모달용 데이터 + 필요 수량 전달
  subSimItem.value = {
    ...found,
    requiredQty: material.totalRequired, // 부모가 필요로 하는 양
  };
};

const handleSubClose = () => {
  subSimItem.value = null;
};

// 재료가 시뮬 가능한지 (대장장이 산물인지)
const canSimulate = (material) => {
  return material.sourceCategory === "blacksmith";
};

// 64개 단위로 변환: "1,280개 (20세트)"
const formatStacks = (count) => {
  if (count < 64) return `${count}개`
  const stacks = Math.floor(count / 64)
  const remainder = count % 64
  if (remainder === 0) return `${count.toLocaleString()}개 (${stacks}세트)`
  return `${count.toLocaleString()}개 (${stacks}세트 ${remainder}개)`
}
</script>

<template>
  <div class="modal-overlay">
    <div class="modal">
      <header class="modal-header">
        <div class="header-title">
          <img
            v-if="getItemImage(item.itemName)"
            :src="getItemImage(item.itemName)"
            :alt="item.itemName"
            class="header-image"
            @error="$event.target.style.display='none'"
          />
          <h2>{{ item.itemName }}</h2>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <!-- ═══════ 좌측: 입력 ═══════ -->
        <section class="input-section">
          <div class="input-group">
            <label>목표 수량</label>
            <input
              type="number"
              v-model.number="targetQuantity"
              min="1"
              class="num-input"
            />
            <span class="suffix">개</span>
          </div>

          <div class="outcomes-block">
            <div class="block-header">
              <h3>제작 등급별 확률</h3>
              <span class="hint">⚙️ 설정에서 기본값 변경 가능</span>
            </div>
            <div v-for="o in outcomes" :key="o.key" class="outcome-row">
              <div class="outcome-label" :style="{ color: o.color }">
                {{ o.label }}
              </div>
              <input
                type="number"
                v-model.number="o.chance"
                step="0.01"
                min="0"
                max="100"
                :readonly="o.readonly"
                class="num-input chance-input"
                :class="{ readonly: o.readonly }"
                @input="autoFillIfPossible"
              />
              <span class="suffix">%</span>
              <span class="outcome-qty">→ {{ o.quantity }}개</span>
            </div>

            <div
              class="total-chance"
              :class="{ invalid: Math.abs(totalChance - 100) > 0.5 }"
            >
              합계: <strong>{{ totalChance.toFixed(2) }}%</strong>
              <span v-if="Math.abs(totalChance - 100) > 0.5"> · 100%여야 합니다</span>
            </div>
          </div>

          <button
            class="run-btn"
            :disabled="!isValid || isComputing"
            @click="runSimulation"
          >
            {{ isComputing ? "계산 중..." : "🎲 시뮬레이션 실행" }}
          </button>
        </section>

        <!-- ═══════ 우측: 결과 ═══════ -->
        <section class="result-section">
          <div v-if="!result" class="empty-state">
            <div class="empty-icon">📊</div>
            <p>왼쪽에서 시뮬레이션을 실행해주세요</p>
          </div>

          <template v-else>
            <!-- 통계 -->
            <div class="stats-row">
              <div class="stat">
                <div class="stat-label">최소</div>
                <div class="stat-value">{{ result.min }}회</div>
              </div>
              <div class="stat">
                <div class="stat-label">평균</div>
                <div class="stat-value highlight">{{ result.mean.toFixed(1) }}회</div>
              </div>
              <div class="stat">
                <div class="stat-label">최대</div>
                <div class="stat-value">{{ result.max }}회</div>
              </div>
            </div>

            <!-- 그래프 -->
            <OutcomeChart
              :distribution="result.distribution"
              :sorted-attempts="result.sortedAttempts"
              :selected="selectedAttempts"
              @bar-click="handleBarClick"
            />

            <!-- 선택된 막대 정보 -->
            <div v-if="selectedInfo" class="selected-info">
              <div class="info-header">
                <div class="info-title">
                  📌 <strong>{{ selectedInfo.attempts }}번</strong> 시도
                </div>
                <div class="info-prob">
                  완료 확률 <strong>{{ selectedInfo.probability.toFixed(2) }}%</strong>
                </div>
              </div>

              <div class="materials-grid">
                <div
                  v-for="m in selectedInfo.totalMaterials"
                  :key="m.materialName"
                  class="material-row"
                >
                  <span
                    class="source-tag"
                    :style="{ background: sourceCategoryColor(m.sourceCategory) }"
                  >
                    {{ sourceCategoryLabel(m.sourceCategory) }}
                  </span>
                  <img
                    v-if="getItemImage(m.materialName)"
                    :src="getItemImage(m.materialName)"
                    :alt="m.materialName"
                    class="material-image"
                    @error="$event.target.style.display='none'"
                  />
                  <span v-else class="material-image-placeholder">📦</span>
                  <span class="material-name">{{ m.materialName }}</span>
                  <span class="material-qty">{{ formatStacks(m.totalRequired) }}</span>
                  <button
                    v-if="canSimulate(m)"
                    class="sub-sim-btn"
                    @click="handleSubSim(m)"
                    title="이 재료 시뮬레이션"
                  >
                    ⚡ 시뮬
                  </button>
                  <span v-else class="sub-sim-spacer"></span>
                </div>
              </div>
            </div>
          </template>
        </section>
      </div>
    </div>
    <!-- 하위 재료 시뮬 (재귀) -->
    <SimulationModal
      v-if="subSimItem"
      :item="subSimItem.item"
      :job="subSimItem.job"
      :tier="subSimItem.tier"
      :initial-target="subSimItem.requiredQty"
      @close="handleSubClose"
    />
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 32px;
}

.modal {
  background: var(--bg-secondary);
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  color: var(--text-tertiary);
  font-size: 18px;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}
.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  padding: 24px;
  overflow: auto;
}

/* ── 입력 섹션 ── */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 80px;
}
.num-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  width: 100%;
}
.num-input:focus {
  border-color: var(--accent);
}
.num-input.readonly {
  background: var(--bg-primary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}
.suffix {
  color: var(--text-tertiary);
  font-size: 13px;
}

.outcomes-block {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px;
}
.outcomes-block h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.outcome-row {
  display: grid;
  grid-template-columns: 100px 1fr auto auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.outcome-label {
  font-size: 12px;
  font-weight: 700;
}
.chance-input {
  max-width: 80px;
}
.outcome-qty {
  font-size: 12px;
  color: var(--text-tertiary);
  white-space: nowrap;
}

.total-chance {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--text-secondary);
}
.total-chance.invalid {
  color: var(--job-hunter);
}

.run-btn {
  background: var(--accent);
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 14px;
  border-radius: 10px;
}
.run-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}
.run-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── 결과 섹션 ── */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  gap: 12px;
}
.empty-icon {
  font-size: 48px;
  opacity: 0.3;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.stat {
  background: var(--bg-tertiary);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.stat-label {
  font-size: 11px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  margin-top: 4px;
}
.stat-value.highlight {
  color: var(--accent);
}

/* ── 선택 정보 ── */
.selected-info {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--accent-soft);
}
.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.info-title {
  font-size: 14px;
}
.info-prob {
  font-size: 14px;
  color: var(--accent);
}

.materials-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.material-row {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 6px 4px;
  font-size: 13px;
}
.source-tag {
  font-size: 10px;
  font-weight: 700;
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
}
.material-name {
  color: var(--text-primary);
}
.material-qty {
  color: var(--text-secondary);
  font-weight: 600;
}

.sub-sim-btn {
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  margin-left: 8px;
}
.sub-sim-btn:hover {
  background: var(--accent);
  color: white;
}
.sub-sim-spacer {
  width: 0;
  margin-left: 8px;
}

/* material-row 그리드 수정 - 버튼 자리 추가 */
.material-row {
  grid-template-columns: 64px 1fr auto auto !important;
}

/* 모달 헤더 이미지 */
.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
  image-rendering: pixelated;
}

.material-image-wrap,
.material-image,
.material-image-placeholder {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.material-image {
  object-fit: contain;
  image-rendering: pixelated;
}
.material-image-placeholder {
  font-size: 11px;
  opacity: 0.3;
}

/* material-row 그리드 수정 (이미지 칸 추가) */
.material-row {
  grid-template-columns: 64px 24px 1fr auto auto !important;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.block-header h3 {
  margin-bottom: 0;
}
.hint {
  font-size: 10px;
  color: var(--text-tertiary);
}
</style>
