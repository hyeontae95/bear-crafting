<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const props = defineProps({
  distribution: { type: Object, required: true }, // { 시도횟수: 빈도 }
  sortedAttempts: { type: Array, required: true }, // 정렬된 시도횟수 배열
  selected: { type: Number, default: null }, // 현재 선택된 막대
});
const emit = defineEmits(["bar-click"]);

const canvas = ref(null);
let chartInstance = null;

// 데이터 변환: x축 (시도횟수), y축 (빈도)
const buildChartData = () => {
  const entries = Object.entries(props.distribution)
    .map(([k, v]) => [Number(k), v])
    .sort((a, b) => a[0] - b[0]);

  const labels = entries.map((e) => e[0]);
  const counts = entries.map((e) => e[1]);

  // 누적 분포 (cumulative %)
  const total = props.sortedAttempts.length;
  let acc = 0;
  const cumulative = entries.map(([attempts, count]) => {
    acc += count;
    return (acc / total) * 100;
  });

  // 선택된 막대만 강조 색
  const barColors = labels.map(
    (l) =>
      l === props.selected
        ? "#a78bfa" // 선택: 밝은 보라
        : "rgba(139, 92, 246, 0.5)" // 일반: 반투명 보라
  );

  return { labels, counts, cumulative, barColors };
};

const renderChart = () => {
  if (!canvas.value) return;
  if (chartInstance) chartInstance.destroy();

  const { labels, counts, cumulative, barColors } = buildChartData();

  chartInstance = new Chart(canvas.value, {
    data: {
      labels,
      datasets: [
        {
          type: "bar",
          label: "빈도",
          data: counts,
          backgroundColor: barColors,
          borderRadius: 4,
          yAxisID: "y",
          order: 2, // 뒤로
        },
        {
          type: "line",
          label: "누적 분포",
          data: cumulative,
          borderColor: "#f59e0b",
          backgroundColor: "transparent",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.2,
          yAxisID: "y1",
          order: 1, // 앞으로
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          const attempts = labels[idx];
          emit("bar-click", attempts);
        }
      },
      onHover: (e, elements) => {
        e.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
      },
      plugins: {
        legend: {
          labels: { color: "#a1a1aa", font: { size: 11 } },
        },
        tooltip: {
          backgroundColor: "#1a1b21",
          borderColor: "#2d2e36",
          borderWidth: 1,
          titleColor: "#f4f4f5",
          bodyColor: "#a1a1aa",
          padding: 10,
          callbacks: {
            title: (items) => `${items[0].label}번 시도`,
            label: (ctx) => {
              if (ctx.dataset.type === "bar") {
                const total = props.sortedAttempts.length;
                const pct = ((ctx.parsed.y / total) * 100).toFixed(2);
                return `빈도: ${ctx.parsed.y}회 (${pct}%)`;
              }
              return `누적: ${ctx.parsed.y.toFixed(2)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#71717a", font: { size: 11 } },
          grid: { display: false },
          title: {
            display: true,
            text: "시도 횟수",
            color: "#a1a1aa",
            font: { size: 12 },
          },
        },
        y: {
          beginAtZero: true,
          position: "left",
          ticks: { color: "#71717a", font: { size: 11 } },
          grid: { color: "rgba(45, 46, 54, 0.5)" },
          title: {
            display: true,
            text: "빈도",
            color: "#a1a1aa",
            font: { size: 12 },
          },
        },
        y1: {
          beginAtZero: true,
          max: 100,
          position: "right",
          ticks: {
            color: "#f59e0b",
            font: { size: 11 },
            callback: (v) => v + "%",
          },
          grid: { drawOnChartArea: false },
          title: {
            display: true,
            text: "누적 분포",
            color: "#f59e0b",
            font: { size: 12 },
          },
        },
      },
    },
  });
};

onMounted(renderChart);
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy();
});

watch(() => [props.distribution, props.selected], renderChart, { deep: true });
</script>

<template>
  <div class="chart-wrap">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.chart-wrap {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px;
  height: 320px;
}
</style>
