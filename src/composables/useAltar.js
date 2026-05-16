import { ref, watch } from 'vue'

const STORAGE_KEY = 'altar_weekly_list'
const PRESTIGE_KEY = 'altar_prestige'

const weeklyList = ref([])
const prestige = ref('none')

// 초기 로드
try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) weeklyList.value = JSON.parse(saved)
} catch (e) { weeklyList.value = [] }

try {
    const savedPrestige = localStorage.getItem(PRESTIGE_KEY)
    if (savedPrestige) prestige.value = savedPrestige
} catch (e) { prestige.value = 'none' }

// 자동 저장
watch(weeklyList, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

watch(prestige, (val) => {
    localStorage.setItem(PRESTIGE_KEY, val)
})

export function useAltar() {
    return { weeklyList, prestige }
}