import { MasterDatabase } from '../data/MasterDatabase.js'

/**
 * 모든 아이템을 평면 리스트로 변환
 * @returns [{ itemName, job, tier, jobLabel, tierLabel, item }]
 */
export function getAllItems() {
    const tierLabels = {
        level0: '기본',
        basicTier1: 'I급 기본재',
        basicTier2: 'II급 기본재',
        toolsAndOthers: '도구',
        basicTier3: 'III급 기본재',
        basicTier4: 'IIII급 기본재',
        uncommon: 'UNCOMMON',
        rare: 'RARE',
        epic: 'EPIC',
        legendary: 'LEGENDARY',
    }

    const result = []
    for (const job of Object.keys(MasterDatabase)) {
        const jobLabel = job === 'blacksmith' ? '대장장이' : '공예가'
        for (const tier of Object.keys(MasterDatabase[job])) {
            for (const item of MasterDatabase[job][tier]) {
                result.push({
                    itemName: item.itemName,
                    job,
                    tier,
                    jobLabel,
                    tierLabel: tierLabels[tier] || tier,
                    item,
                })
            }
        }
    }
    return result
}

/**
 * 검색: 아이템 이름 또는 재료 이름에 매칭
 * @param {String} query
 * @returns 매칭된 아이템 리스트
 */
export function searchItems(query) {
    if (!query || query.trim().length === 0) return []
    const q = query.trim().toLowerCase()

    const all = getAllItems()
    const results = []

    for (const entry of all) {
        // 1. 아이템 이름 매칭
        if (entry.itemName.toLowerCase().includes(q)) {
            results.push({ ...entry, matchType: 'item' })
            continue
        }

        // 2. 재료 이름 매칭
        const matchedMaterial = entry.item.requiredMaterials.find(m =>
            m.materialName.toLowerCase().includes(q)
        )
        if (matchedMaterial) {
            results.push({
                ...entry,
                matchType: 'material',
                matchedMaterial: matchedMaterial.materialName,
            })
        }
    }

    return results.slice(0, 30)  // 최대 30개
}

/**
 * 재료 이름으로 마스터DB에서 아이템 데이터 찾기
 * @param {String} materialName - 예: "에너지 오브"
 * @returns { item, job, tier } 또는 null
 */
export function findItemByName(materialName) {
    const all = getAllItems()
    const found = all.find(entry => entry.itemName === materialName)
    if (!found) return null
    return {
        item: found.item,
        job: found.job,
        tier: found.tier,
    }
}