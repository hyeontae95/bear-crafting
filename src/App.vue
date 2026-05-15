<script setup>
import { ref, computed } from "vue";
import Sidebar from "./components/Sidebar.vue";
import MainPanel from "./components/MainPanel.vue";
import QueuePanel from "./components/QueuePanel.vue";

const currentCategory = ref({ job: "blacksmith", tier: "level0" });
const externalSelect = ref(null);
const activeTab = ref("main");
const queueOpen = ref(false);

const getIsPortrait = () => window.matchMedia('(max-width: 1023px)').matches || window.innerWidth < 1024;
const getIsDesktop = () => window.matchMedia('(min-width: 1280px)').matches || window.innerWidth >= 1280;

const isPortrait = ref(getIsPortrait());
const isDesktop = ref(getIsDesktop());
const isFABMode = computed(() => !isPortrait.value && !isDesktop.value);

window.addEventListener('resize', () => {
  isPortrait.value = getIsPortrait();
  isDesktop.value = getIsDesktop();
});

const portraitQuery = window.matchMedia('(max-width: 1023px)');
const desktopQuery = window.matchMedia('(min-width: 1280px)');
portraitQuery.addEventListener('change', () => { isPortrait.value = getIsPortrait(); });
desktopQuery.addEventListener('change', () => { isDesktop.value = getIsDesktop(); });

const handleTabClick = (tab) => {
  if (isPortrait.value && activeTab.value === tab && tab !== 'main') {
    activeTab.value = "main";
  } else {
    activeTab.value = tab;
  }
};

const handleCategorySelect = (category) => {
  currentCategory.value = category;
  externalSelect.value = null;
  if (isPortrait.value) activeTab.value = "main";
};
const handleSearchSelect = (entry) => {
  currentCategory.value = { job: entry.job, tier: entry.tier };
  externalSelect.value = entry.itemName;
  if (isPortrait.value) activeTab.value = "main";
};

const portraitQuery_width = ref(window.innerWidth);
</script>

<template>
  <div
    style="position:fixed;top:0;left:0;background:red;color:white;z-index:99999;font-size:14px;padding:6px;pointer-events:none;">
    {{ isPortrait ? '모바일' : isFABMode ? 'FAB' : '데스크탑' }} / {{ portraitQuery_width }}
  </div>

  <div class="app-layout">
    <div class="panels">
      <Sidebar v-if="!isPortrait || activeTab === 'sidebar'" class="panel-sidebar" :current-category="currentCategory"
        @select="handleCategorySelect" @search-select="handleSearchSelect" />
      <MainPanel v-if="!isPortrait || activeTab === 'main'" class="panel-main" :category="currentCategory"
        :auto-select="externalSelect" />
      <QueuePanel v-if="isDesktop || (isPortrait && activeTab === 'queue') || (isFABMode && queueOpen)"
        class="panel-queue" :class="{ 'queue-slide': isFABMode, 'queue-open': isFABMode && queueOpen }" />
    </div>

    <!-- FAB 큐 토글 버튼 -->
    <button v-if="isFABMode" class="fab-btn" @click="queueOpen = !queueOpen">
      <span>📦</span>
      <span v-if="queueOpen" class="fab-close">✕</span>
    </button>

    <!-- 세로모바일 하단 탭바 -->
    <nav v-if="isPortrait" class="bottom-tab-bar">
      <button class="tab-btn" :class="{ active: activeTab === 'sidebar' }" @click="handleTabClick('sidebar')">
        <span class="tab-icon">☰</span>
        <span class="tab-label">메뉴</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'main' }" @click="handleTabClick('main')">
        <span class="tab-icon">⚒️</span>
        <span class="tab-label">제작</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'queue' }" @click="handleTabClick('queue')">
        <span class="tab-icon">📦</span>
        <span class="tab-label">큐</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
  position: relative;
}

.panels {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.panel-sidebar,
.panel-main,
.panel-queue {
  height: 100%;
  min-height: 0;
}

.queue-slide {
  position: fixed !important;
  top: 0;
  right: 0;
  height: 100vh !important;
  width: 320px;
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 500;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.6);
}

.queue-slide.queue-open {
  transform: translateX(0);
}

.fab-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  font-size: 20px;
  z-index: 600;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: background 0.15s, transform 0.15s;
}

.fab-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.fab-close {
  font-size: 12px;
  opacity: 0.8;
}

.bottom-tab-bar {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  z-index: 100;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: transparent;
  color: var(--text-tertiary);
  border: none;
  transition: color 0.15s;
}

.tab-btn.active {
  color: var(--accent);
}

.tab-btn .tab-icon {
  font-size: 20px;
  line-height: 1;
  transition: transform 0.15s;
}

.tab-btn.active .tab-icon {
  transform: scale(1.15);
}

.tab-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.tab-btn.active .tab-label {
  font-weight: 800;
}
</style>