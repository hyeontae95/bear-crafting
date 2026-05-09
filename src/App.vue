<script setup>
import { ref } from "vue";
import Sidebar from "./components/Sidebar.vue";
import MainPanel from "./components/MainPanel.vue";
import QueuePanel from "./components/QueuePanel.vue";

const currentCategory = ref({ job: "blacksmith", tier: "level0" });
const externalSelect = ref(null);

const handleCategorySelect = (category) => {
  currentCategory.value = category;
  externalSelect.value = null;
};

const handleSearchSelect = (entry) => {
  currentCategory.value = { job: entry.job, tier: entry.tier };
  externalSelect.value = entry.itemName;
};
</script>

<template>
  <div class="app-layout">
    <Sidebar
      :current-category="currentCategory"
      @select="handleCategorySelect"
      @search-select="handleSearchSelect"
    />
    <MainPanel :category="currentCategory" :auto-select="externalSelect" />
    <QueuePanel />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: var(--bg-primary);
}
</style>
