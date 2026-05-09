/**
 * "목표 수량 N개를 모을 때까지 몇 번 시도해야 하는지" 시뮬레이션
 *
 * @param {Number} targetQuantity - 목표 개수 (예: 10)
 * @param {Array} outcomes - [{ chance: 61.51, quantity: 1 }, { chance: 38.49, quantity: 0 }]
 * @param {Number} iterations - 시뮬레이션 반복 (기본 10000)
 * @returns {Object} { distribution, sortedAttempts, mean, min, max }
 */
export function simulateAttempts(targetQuantity, outcomes, iterations = 10000) {
    // 누적 확률 테이블
    const cumulative = []
    let acc = 0
    for (const o of outcomes) {
        acc += o.chance
        cumulative.push({ ...o, cumulative: acc })
    }

    const sortedAttempts = []
    const distribution = {}  // { 시도횟수: 빈도 }

    for (let iter = 0; iter < iterations; iter++) {
        let collected = 0
        let attempts = 0
        const SAFETY_LIMIT = 100000  // 무한루프 방지

        while (collected < targetQuantity && attempts < SAFETY_LIMIT) {
            attempts++
            const roll = Math.random() * 100

            for (const c of cumulative) {
                if (roll <= c.cumulative) {
                    collected += c.quantity
                    break
                }
            }
        }

        sortedAttempts.push(attempts)
        distribution[attempts] = (distribution[attempts] || 0) + 1
    }

    sortedAttempts.sort((a, b) => a - b)

    const mean = sortedAttempts.reduce((a, b) => a + b, 0) / sortedAttempts.length

    return {
        distribution,
        sortedAttempts,
        mean,
        min: sortedAttempts[0],
        max: sortedAttempts[sortedAttempts.length - 1],
        iterations,
    }
}

/**
 * "이 시도 횟수 이내에 끝날 확률" (= 누적 분포)
 * @param {Array} sortedAttempts
 * @param {Number} attempts
 * @returns {Number} 0~100
 */
export function getCompletionProbability(sortedAttempts, attempts) {
    let count = 0
    for (const a of sortedAttempts) {
        if (a <= attempts) count++
    }
    return (count / sortedAttempts.length) * 100
}