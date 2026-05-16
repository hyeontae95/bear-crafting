<script setup>
import { ref, computed } from "vue";
import { searchItems } from "../utils/searchHelper.js";
import SettingsModal from "./SettingsModal.vue";

const props = defineProps({
  currentCategory: { type: Object, required: true },
});
const emit = defineEmits(["select", "search-select"]);

const showSettings = ref(false);

const menu = [
  {
    job: "favorites",
    label: "⭐ 즐겨찾기",
    color: "#fbbf24",
    tiers: [{ key: "__favorites__", label: "내 즐겨찾기" }],
  },
  {
    job: "blacksmith",
    label: "🔨 대장장이",
    color: "var(--job-blacksmith)",
    tiers: [
      { key: "level0", label: "기본" },
      { key: "toolsAndOthers", label: "도구" },
      { key: "basicTier1", label: "I급 기본재" },
      { key: "basicTier2", label: "II급 기본재" },
      { key: "basicTier3", label: "III급 기본재" },
      { key: "basicTier4", label: "IIII급 기본재" },
    ],
  },
  {
    job: "crafter",
    label: "🪄 공예가",
    color: "var(--job-crafter)",
    tiers: [
      { key: "uncommon", label: "UNCOMMON" },
      { key: "rare", label: "RARE" },
      { key: "epic", label: "EPIC" },
      { key: "legendary", label: "LEGENDARY" },
    ],
  },
]

const pokedexMenu = [
  {
    job: "pokedex",
    label: "📖 도감",
    color: "#38bdf8",
    tiers: [
      { key: "material", label: "고급 재료 도감" },
      { key: "craft", label: "공예품 도감" },
    ],
  },
]

const isActive = (job, tier) =>
  props.currentCategory.job === job && props.currentCategory.tier === tier

const searchQuery = ref("")
const searchResults = computed(() => searchItems(searchQuery.value))
const isSearching = computed(() => searchQuery.value.trim().length > 0)

const handleSearchClick = (entry) => {
  emit("search-select", entry)
  searchQuery.value = ""
}

const clearSearch = () => {
  searchQuery.value = ""
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">⚒️</div>
      <div class="title">
        <div class="title-main">Crafting</div>
        <div class="title-sub">Calculator</div>
      </div>
      <button class="settings-btn" @click="showSettings = true" title="확률 설정">⚙️</button>
    </div>

    <div class="search-wrap">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input v-model="searchQuery" type="text" placeholder="아이템 / 재료 검색..." class="search-input" />
        <button v-if="isSearching" class="clear-btn" @click="clearSearch">✕</button>
      </div>
    </div>

    <div v-if="isSearching" class="search-results">
      <div class="results-label">검색 결과 {{ searchResults.length }}건</div>
      <div v-if="searchResults.length === 0" class="no-results">결과 없음</div>
      <button v-for="(entry, idx) in searchResults" :key="idx" class="result-item" @click="handleSearchClick(entry)">
        <div class="result-main">
          <span class="result-name">{{ entry.itemName }}</span>
          <span v-if="entry.matchType === 'material'" class="material-hint">🧱 {{ entry.matchedMaterial }}</span>
        </div>
        <div class="result-sub">
          <span class="result-job" :class="entry.job">{{ entry.jobLabel }}</span>
          <span class="result-tier">{{ entry.tierLabel }}</span>
        </div>
      </button>
    </div>

    <nav v-else class="menu">
      <!-- 제작 메뉴 -->
      <div v-for="section in menu" :key="section.job" class="section">
        <div class="section-label" :style="{ color: section.color }">{{ section.label }}</div>
        <div class="tier-list">
          <button
            v-for="tier in section.tiers" :key="tier.key"
            class="tier-btn"
            :class="{ active: isActive(section.job, tier.key) }"
            :style="{ '--job-color': section.color }"
            @click="emit('select', { job: section.job, tier: tier.key })"
          >
            {{ tier.label }}
          </button>
        </div>
      </div>

      <!-- 구분선 -->
      <div class="divider" />

      <!-- 도감 메뉴 -->
      <div v-for="section in pokedexMenu" :key="section.job" class="section">
        <div class="section-label" :style="{ color: section.color }">{{ section.label }}</div>
        <div class="tier-list">
          <button
            v-for="tier in section.tiers" :key="tier.key"
            class="tier-btn"
            :class="{ active: isActive(section.job, tier.key) }"
            :style="{ '--job-color': section.color }"
            @click="emit('select', { job: section.job, tier: tier.key })"
          >
            {{ tier.label }}
          </button>
        </div>
      </div>
    </nav>
  </aside>
  <SettingsModal v-model="showSettings" />
</template>

<style scoped>
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  height: 100%;
}

.sidebar-header {
  padding: 20px 20px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.logo { font-size: 28px; }
.title-main { font-size: 16px; font-weight: 700; }
.title-sub { font-size: 12px; color: var(--text-tertiary); }

.search-wrap {
  padding: 0 12px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 8px 10px;
  border: 1px solid transparent;
  transition: border-color 0.15s;
}
.search-box:focus-within { border-color: var(--accent); }
.search-icon { font-size: 13px; opacity: 0.6; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  min-width: 0;
}
.search-input::placeholder { color: var(--text-tertiary); }

.clear-btn {
  background: transparent;
  color: var(--text-tertiary);
  font-size: 11px;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  flex-shrink: 0;
}
.clear-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px;
}
.results-label {
  font-size: 10px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 8px 8px;
  font-weight: 600;
}
.no-results { padding: 20px; text-align: center; color: var(--text-tertiary); font-size: 12px; }

.result-item {
  width: 100%;
  background: transparent;
  text-align: left;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 2px;
}
.result-item:hover { background: var(--bg-hover); }
.result-main { display: flex; flex-direction: column; gap: 3px; }
.result-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.material-hint { font-size: 11px; color: var(--accent); }
.result-sub { display: flex; gap: 6px; font-size: 10px; }
.result-job { padding: 2px 6px; border-radius: 3px; color: white; font-weight: 600; }
.result-job.blacksmith { background: var(--job-blacksmith); }
.result-job.crafter { background: var(--job-crafter); }
.result-tier { color: var(--text-tertiary); }

.menu {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
}
.section { margin-bottom: 24px; }
.section-label {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0 8px 8px;
}
.tier-list { display: flex; flex-direction: column; gap: 2px; }
.tier-btn {
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border-left: 2px solid transparent;
}
.tier-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
.tier-btn.active {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-left-color: var(--job-color);
}

.settings-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: auto;
  transition: all 0.15s;
}
.settings-btn:hover { background: var(--bg-hover); color: var(--text-primary); transform: rotate(45deg); }

.divider {
  height: 1px;
  background: var(--border);
  margin: 0 8px 24px;
}

/* ── 모바일 세로 ── */
@media (max-width: 767px) {
  .sidebar {
    width: 100%;
    border-right: none;
  }
  .section-label { font-size: 14px; }
}

/* ── 태블릿 ── */
@media (min-width: 768px) and (max-width: 1279px) {
  .sidebar { width: 200px; }
  .section-label { font-size: 13px; }
  .tier-btn { font-size: 12px; padding: 8px 10px; }
}
</style>