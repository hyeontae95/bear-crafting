import { ref, watch } from 'vue';

const STORAGE_KEY = 'mc_craft_settings';

// 기본값 (사용자가 자유롭게 수정)
const DEFAULT_SETTINGS = {
    blacksmith: {
        level0: { criticalSuccess: 0, additional: 0, normalSuccess: 0 },
        basicTier1: { criticalSuccess: 0, additional: 0, normalSuccess: 0 },
        basicTier2: { criticalSuccess: 0, additional: 0, normalSuccess: 0 },
        basicTier3: { criticalSuccess: 0, additional: 0, normalSuccess: 0 },
        basicTier4: { artisanSuccess: 0, normalSuccess: 0 }, // 장인/평범
    },
    crafter: {
        uncommon: { inspired: 0, additional: 0, normalSuccess: 0 },
        rare: { inspired: 0, additional: 0, normalSuccess: 0 },
        epic: { inspired: 0, additional: 0, normalSuccess: 0 },
        legendary: { inspired: 0, additional: 0, normalSuccess: 0 },
    },
};

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function mergeDeep(target, source) {
    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            target[key] = mergeDeep(target[key] || {}, source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

// localStorage 로드
function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return deepClone(DEFAULT_SETTINGS);

        const parsed = JSON.parse(raw);
        return mergeDeep(deepClone(DEFAULT_SETTINGS), parsed);
    } catch (e) {
        console.warn('settings load failed:', e);
        return deepClone(DEFAULT_SETTINGS);
    }
}

// 전역 reactive 상태
const settings = ref(loadSettings());

// 변경 시 자동 저장
watch(settings, (newVal) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
    } catch (e) {
        console.warn('settings save failed:', e);
    }
}, { deep: true });

/**
 * 카테고리명으로 확률 가져오기
 * @param {string} category - 'blacksmith' | 'crafter'
 * @param {string} tier - 'level0', 'basicTier1', 'uncommon', 'rare' 등
 * @returns {Object|null}
 */
function getProbability(category, tier) {
    if (!category || !tier) return null;
    return settings.value[category]?.[tier] || null;
}

/**
 * DB 키(category)로 부터 확률 구조 자동 매핑
 * 도구(toolsAndOthers)는 null 반환 (100% 고정)
 */
function getProbabilityByDbKey(dbKey) {
    // 대장장이
    const blacksmithKeys = ['level0', 'basicTier1', 'basicTier2', 'basicTier3', 'basicTier4'];
    if (blacksmithKeys.includes(dbKey)) {
        return settings.value.blacksmith[dbKey];
    }

    // 도구는 100% 고정
    if (dbKey === 'toolsAndOthers') {
        return null;
    }

    // 공예가
    const crafterKeys = ['uncommon', 'rare', 'epic', 'legendary'];
    if (crafterKeys.includes(dbKey)) {
        return settings.value.crafter[dbKey];
    }

    return null;
}

export function useSettings() {
    function resetSettings() {
        settings.value = deepClone(DEFAULT_SETTINGS);
    }

    return {
        settings,
        resetSettings,
        getProbability,
        getProbabilityByDbKey,
    };
}