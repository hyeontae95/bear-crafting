<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <div class="modal">
      <!-- 헤더 -->
      <div class="modal-header">
        <h2>⚙️ 확률 설정</h2>
        <button class="btn-close" @click="close">✕</button>
      </div>

      <!-- 안내 -->
      <p class="note">
        본인 캐릭터 기준 등급별 제작 확률을 입력하세요. 자동으로 저장됩니다.<br>
        도구는 100% 고정이라 입력란이 없습니다.
      </p>

      <!-- 대장장이 -->
      <section class="section">
        <h3 class="section-title">🔨 대장장이</h3>

        <div class="grade-row" v-for="tier in blacksmithTiers" :key="tier.key">
          <div class="grade-name">{{ tier.label }}</div>
          <div class="inputs">
            <template v-if="tier.key !== 'basicTier4'">
              <div class="prob-input">
                <label>대성공</label>
                <div class="input-wrap">
                  <input
                    type="number" min="0" max="100"
                    :value="settings.blacksmith[tier.key].criticalSuccess"
                    @input="onInput('blacksmith', tier.key, 'criticalSuccess', $event)"
                  />
                  <span class="percent">%</span>
                </div>
              </div>
              <div class="prob-input">
                <label>추가</label>
                <div class="input-wrap">
                  <input
                    type="number" min="0" max="100"
                    :value="settings.blacksmith[tier.key].additional"
                    @input="onInput('blacksmith', tier.key, 'additional', $event)"
                  />
                  <span class="percent">%</span>
                </div>
              </div>
              <div class="prob-input">
                <label>성공</label>
                <div class="input-wrap">
                  <input
                    type="number" min="0" max="100"
                    :value="settings.blacksmith[tier.key].normalSuccess"
                    @input="onInput('blacksmith', tier.key, 'normalSuccess', $event)"
                  />
                  <span class="percent">%</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="prob-input">
                <label>장인</label>
                <div class="input-wrap">
                  <input
                    type="number" min="0" max="100"
                    :value="settings.blacksmith[tier.key].artisanSuccess"
                    @input="onInput('blacksmith', tier.key, 'artisanSuccess', $event)"
                  />
                  <span class="percent">%</span>
                </div>
              </div>
              <div class="prob-input">
                <label>평범</label>
                <div class="input-wrap">
                  <input
                    type="number" min="0" max="100"
                    :value="settings.blacksmith[tier.key].normalSuccess"
                    @input="onInput('blacksmith', tier.key, 'normalSuccess', $event)"
                  />
                  <span class="percent">%</span>
                </div>
              </div>
            </template>
            <div class="total" :class="{ valid: isValid(tier.key, 'blacksmith') }">
              합계: {{ getTotal(tier.key, 'blacksmith') }}%
            </div>
          </div>
        </div>
      </section>

      <!-- 공예가 -->
      <section class="section">
        <h3 class="section-title">🪡 공예가</h3>

        <div class="grade-row" v-for="grade in crafterGrades" :key="grade.key">
          <div class="grade-name">{{ grade.label }}</div>
          <div class="inputs">
            <div class="prob-input">
              <label>영감받음</label>
              <div class="input-wrap">
                <input
                  type="number" min="0" max="100"
                  :value="settings.crafter[grade.key].inspired"
                  @input="onInput('crafter', grade.key, 'inspired', $event)"
                />
                <span class="percent">%</span>
              </div>
            </div>
            <div class="prob-input">
              <label>추가</label>
              <div class="input-wrap">
                <input
                  type="number" min="0" max="100"
                  :value="settings.crafter[grade.key].additional"
                  @input="onInput('crafter', grade.key, 'additional', $event)"
                />
                <span class="percent">%</span>
              </div>
            </div>
            <div class="prob-input">
              <label>성공</label>
              <div class="input-wrap">
                <input
                  type="number" min="0" max="100"
                  :value="settings.crafter[grade.key].normalSuccess"
                  @input="onInput('crafter', grade.key, 'normalSuccess', $event)"
                />
                <span class="percent">%</span>
              </div>
            </div>
            <div class="total" :class="{ valid: isValid(grade.key, 'crafter') }">
              합계: {{ getTotal(grade.key, 'crafter') }}%
            </div>
          </div>
        </div>
      </section>

      <!-- 푸터 -->
      <div class="modal-footer">
        <button class="btn-reset" @click="onReset">🔄 모두 초기화</button>
        <button class="btn-done" @click="close">완료</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettings } from '../composables/useSettings.js';

const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(['update:modelValue']);

const { settings, resetSettings } = useSettings();

const blacksmithTiers = [
  { key: 'level0', label: '기본' },
  { key: 'basicTier1', label: 'I급 기본재' },
  { key: 'basicTier2', label: 'II급 기본재' },
  { key: 'basicTier3', label: 'III급 기본재' },
  { key: 'basicTier4', label: 'IIII급 기본재' },
];

const crafterGrades = [
  { key: 'uncommon', label: 'UNCOMMON' },
  { key: 'rare', label: 'RARE' },
  { key: 'epic', label: 'EPIC' },
  { key: 'legendary', label: 'LEGENDARY' },
];

function onInput(category, tierKey, field, event) {
  const val = Math.max(0, Math.min(100, Number(event.target.value) || 0));
  settings.value[category][tierKey][field] = val;
}

function getTotal(tierKey, category) {
  const obj = settings.value[category][tierKey];
  if (!obj) return 0;
  return Object.values(obj).reduce((sum, v) => sum + (Number(v) || 0), 0);
}

function isValid(tierKey, category) {
  return getTotal(tierKey, category) === 100;
}

function close() {
  emit('update:modelValue', false);
}

function onReset() {
  if (confirm('모든 확률을 0으로 초기화하시겠습니까?')) {
    resetSettings();
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  background: #1a1a1a;
  z-index: 2;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.btn-close {
  background: transparent;
  color: #888;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.btn-close:hover {
  background: rgba(255, 100, 100, 0.15);
  color: #ff6464;
}

.note {
  padding: 16px 24px 0;
  color: #999;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.section {
  padding: 16px 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #fbbf24;
  margin: 0 0 14px 0;
  letter-spacing: 0.5px;
}

.grade-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px;
  background: #222;
  border: 1px solid #2c2c2c;
  border-radius: 8px;
  margin-bottom: 8px;
}

.grade-name {
  width: 120px;
  flex-shrink: 0;
  color: #ddd;
  font-size: 13px;
  font-weight: 500;
}

.inputs {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.prob-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prob-input label {
  font-size: 10px;
  color: #888;
  letter-spacing: 0.3px;
}

.input-wrap {
  display: flex;
  align-items: center;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0 8px;
  width: 80px;
}

.input-wrap:focus-within {
  border-color: #60a5fa;
}

.input-wrap input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  padding: 6px 0;
  font-size: 13px;
  outline: none;
  width: 100%;
}

.input-wrap input::-webkit-outer-spin-button,
.input-wrap input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.percent {
  color: #666;
  font-size: 11px;
}

.total {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.total.valid {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #333;
  position: sticky;
  bottom: 0;
  background: #1a1a1a;
}

.btn-reset {
  background: transparent;
  color: #888;
  border: 1px solid #444;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.btn-reset:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.btn-done {
  background: #60a5fa;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.btn-done:hover {
  background: #3b82f6;
}
</style>