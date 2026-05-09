<script setup>
import { computed, ref, watch } from "vue";
import { MasterDatabase } from "../data/MasterDatabase.js";
import SimulationModal from "./SimulationModal.vue";
import { useQueue } from "../composables/useQueue.js";
import { useFavorites } from "../composables/useFavorites.js";
import { getItemImage } from '../data/imageMap.js'

const props = defineProps({
  category: { type: Object, required: true },
  autoSelect: { type: String, default: null },
});

const { add: addToQueue } = useQueue();
const { favorites, isFavorite, toggle: toggleFavorite } = useFavorites();

const items = computed(() => {
  if (props.category.tier === "__favorites__") {
    return getFavoriteItems();
  }
  return MasterDatabase[props.category.job]?.[props.category.tier] || [];
});

function getFavoriteItems() {
  const result = [];
  for (const fav of favorites.value) {
    const item = MasterDatabase[fav.job]?.[fav.tier]?.find(
      (i) => i.itemName === fav.itemName
    );
    if (item) {
      result.push({ ...item, _job: fav.job, _tier: fav.tier });
    }
  }
  return result;
}

const jobLabel = computed(() => {
  if (props.category.tier === "__favorites__") return "⭐ 즐겨찾기";
  return props.category.job === "blacksmith" ? "🔨 대장장이" : "🪡 공예가";
});

const tierLabelMap = {
  level0: "기본",
  basicTier1: "I급 기본재",
  basicTier2: "II급 기본재",
  toolsAndOthers: "도구",
  basicTier3: "III급 기본재",
  basicTier4: "IIII급 기본재",
  uncommon: "UNCOMMON",
  rare: "RARE",
  epic: "EPIC",
  legendary: "LEGENDARY",
};
const tierLabel = computed(() =>
  props.category.tier === "__favorites__"
    ? ""
    : tierLabelMap[props.category.tier] || props.category.tier
);

// 모달
const selectedItem = ref(null);
const handleItemClick = (item) => {
  selectedItem.value = item;
};
const handleClose = () => {
  selectedItem.value = null;
};

watch(
  () => props.autoSelect,
  (name) => {
    if (!name) return;
    setTimeout(() => {
      const found = items.value.find((it) => it.itemName === name);
      if (found) selectedItem.value = found;
    }, 100);
  }
);

// 카드 액션
const handleStarClick = (item, event) => {
  event.stopPropagation();
  toggleFavorite({
    itemName: item.itemName,
    job: item._job || props.category.job,
    tier: item._tier || props.category.tier,
  });
};

const handleAddToQueue = (item, event) => {
  event.stopPropagation();
  addToQueue({
    itemName: item.itemName,
    job: item._job || props.category.job,
    tier: item._tier || props.category.tier,
  }, 1);
};

// 모달 안에서 직업/티어
const modalJob = computed(() => selectedItem.value?._job || props.category.job);
const modalTier = computed(() => selectedItem.value?._tier || props.category.tier);
</script>

<template>
  <main class="main-panel">
    <header class="panel-header">
      <div class="breadcrumb">
        <span class="job">{{ jobLabel }}</span>
        <span v-if="tierLabel" class="separator">›</span>
        <span v-if="tierLabel" class="tier">{{ tierLabel }}</span>
      </div>
      <div class="count">{{ items.length }}개 아이템</div>
    </header>

    <div v-if="items.length === 0" class="empty">
      <div class="empty-icon">⭐</div>
      <p>즐겨찾기한 아이템이 없습니다</p>
      <p class="hint">아이템 카드의 별을 눌러 추가하세요</p>
    </div>

    <div v-else class="items-grid">
      <div
        v-for="item in items"
        :key="item.itemName"
        class="item-card"
        @click="handleItemClick(item)"
      >
        <div class="card-top">
          <div class="item-image-wrap">
            <img
              v-if="getItemImage(item.itemName)"
              :src="getItemImage(item.itemName)"
              :alt="item.itemName"
              class="item-image"
              @error="$event.target.style.display='none'"
            />
            <div v-else class="item-image-placeholder">📦</div>
          </div>
          <div class="item-name">{{ item.itemName }}</div>
          <button
            class="star-btn"
            :class="{ active: isFavorite(item.itemName) }"
            @click="handleStarClick(item, $event)"
            :title="isFavorite(item.itemName) ? '즐겨찾기 해제' : '즐겨찾기 추가'"
          >
            {{ isFavorite(item.itemName) ? "★" : "☆" }}
          </button>
        </div>

        <div class="item-info">
          <template v-if="item.artisanSuccessQuantity !== undefined">
            <span class="grade-tag artisan">장인 {{ item.artisanSuccessQuantity }}</span>
            <span class="grade-tag fail">평범 → {{ item.normalSuccessItemName }}</span>
          </template>
          <template v-else>
            <span v-if="item.criticalSuccessQuantity > 0" class="grade-tag critical">
              {{ (item._job || category.job) === "crafter" ? "영감" : "대성공" }}
              {{ item.criticalSuccessQuantity }}
            </span>
            <span v-if="item.additionalSuccessQuantity > 0" class="grade-tag additional">
              추가 {{ item.additionalSuccessQuantity }}
            </span>
            <span v-if="item.normalSuccessQuantity > 0" class="grade-tag normal">
              성공 {{ item.normalSuccessQuantity }}
            </span>
          </template>
        </div>

        <button
          class="queue-btn"
          @click="handleAddToQueue(item, $event)"
          title="제작 큐에 추가"
        >
          ➕ 큐에 추가
        </button>
      </div>
    </div>

    <SimulationModal
      v-if="selectedItem"
      :item="selectedItem"
      :job="modalJob"
      :tier="modalTier"
      @close="handleClose"
    />
  </main>
</template>

<style scoped>
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}
.job {
  color: var(--accent);
}
.separator {
  color: var(--text-tertiary);
}
.tier {
  color: var(--text-primary);
}
.count {
  color: var(--text-tertiary);
  font-size: 13px;
}

.items-grid {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  align-content: start;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  gap: 8px;
}
.empty-icon {
  font-size: 48px;
  opacity: 0.4;
}
.hint {
  font-size: 12px;
}

.item-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-card:hover {
  border-color: var(--accent);
  background: var(--bg-tertiary);
  transform: translateY(-2px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.star-btn {
  background: transparent;
  color: var(--text-tertiary);
  font-size: 18px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex-shrink: 0;
}
.star-btn:hover {
  color: #fbbf24;
}
.star-btn.active {
  color: #fbbf24;
}

.item-info {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.grade-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
}
.grade-tag.artisan {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.grade-tag.fail {
  background: rgba(113, 113, 122, 0.15);
  color: #71717a;
}
.grade-tag.critical {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}
.grade-tag.additional {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}
.grade-tag.normal {
  background: rgba(96, 165, 250, 0.15);
  color: #60a5fa;
}

.queue-btn {
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  align-self: flex-start;
}
.queue-btn:hover {
  background: var(--accent);
  color: white;
}

.item-image-wrap {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  margin-bottom: 4px;
}
.item-image-placeholder {
  font-size: 12px;
  opacity: 0.4;
}

</style>
