// src/data/PokedexDatabase.js

// ════════════════════════════════════════
// 난이도별 누적 필요 개수 (0~11단계)
// ════════════════════════════════════════
export const DIFFICULTY_LEVELS = {
  매우쉬움:   [0, 10, 100, 1000, 10000, 50000, 250000, 1000000, 3000000, 9000000, 27000000, 81000000],
  쉬움:       [0, 2, 10, 50, 250, 1250, 6250, 31250, 156250, 781250, 3906250, 19531250],
  약간쉬움:   [0, 4, 16, 64, 256, 1024, 4096, 16384, 65536, 262144, 1048576, 4194304],
  보통:       [0, 4, 16, 64, 256, 1024, 3072, 9216, 27648, 82944, 248832, 746496],
  약간어려움: [0, 3, 9, 27, 81, 243, 729, 2187, 6561, 19683, 59049, 177147],
  어려움:     [0, 3, 9, 27, 81, 243, 729, 2187, 6561, 13122, 34992, 69984],
  매우어려움: [0, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 4096, 16384],
  극히어려움: [0, 49, 196, 441, 784, 1225, 1764, 2401, 3136, 3969, 4900, 5929],
  약간악랄함: [0, 25, 100, 225, 400, 625, 900, 1225, 1600, 2025, 2500, 3025],
  악랄함:     [0, 9, 36, 81, 144, 225, 324, 441, 576, 729, 900, 1089],
  매우악랄함: [0, 1, 9, 25, 49, 81, 121, 169, 225, 289, 361, 441],
  극악:       [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44],
  지옥:       [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
  시그니션:   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}

// ════════════════════════════════════════
// 난이도별 마스터리 1단계 기본 배율
// ════════════════════════════════════════
export const MASTERY_BASE_RATE = {
  매우쉬움:   3,
  쉬움:       2,
  약간쉬움:   1.9,
  보통:       1.6,
  약간어려움: 1.5,
  어려움:     1.4,
  매우어려움: 1.25,
  극히어려움: 1.3,
  약간악랄함: 1.25,
  악랄함:     1.25,
  매우악랄함: 1.25,
  극악:       1.15,
  지옥:       1.06,
  시그니션:   1.00,
}

// ════════════════════════════════════════
// 마스터리 배율 계산
// masteryLevel 0 → 1배, n → baseRate^n
// ════════════════════════════════════════
export function getMasteryMultiplier(difficulty, masteryLevel) {
  if (masteryLevel === 0) return 1
  const base = MASTERY_BASE_RATE[difficulty]
  return Math.pow(base, masteryLevel)
}

// ════════════════════════════════════════
// 현재 단계 계산 (누적 등록 개수 기준)
// ════════════════════════════════════════
export function getCurrentStage(difficulty, registeredCount) {
  const levels = DIFFICULTY_LEVELS[difficulty]
  let stage = 0
  for (let i = levels.length - 1; i >= 0; i--) {
    if (registeredCount >= levels[i]) {
      stage = i
      break
    }
  }
  return stage
}

// ════════════════════════════════════════
// 도감 보너스 보상
// ════════════════════════════════════════
export const POKEDEX_REWARDS = {
  고급재료도감: [
    { level: 1, reward: '손재주(스탯) +1' },
    { level: 2, reward: '최대 +100' },
    { level: 3, reward: '손재주(스탯) +3' },
    { level: 4, reward: '최대 +200' },
    { level: 5, reward: '뚝딱이 (네임태그)' },
    { level: 6, reward: '손재주(스탯) +5' },
    { level: 7, reward: '도감 마스터리 +1' },
    { level: 8, reward: '손재주(스탯) +7' },
    { level: 9, reward: '최대 +400' },
    { level: 10, reward: '맥가이버 (네임태그)' },
  ],
  공예품도감: [
    { level: 1, reward: '손재주(스탯) +1' },
    { level: 2, reward: '최대 +100' },
    { level: 3, reward: '손재주(스탯) +3' },
    { level: 4, reward: '최대 +200' },
    { level: 5, reward: '손재주 (네임태그)' },
    { level: 6, reward: '손재주(스탯) +5' },
    { level: 7, reward: '도감 마스터리 +1' },
    { level: 8, reward: '손재주(스탯) +7' },
    { level: 9, reward: '최대 +400' },
    { level: 10, reward: '트레이더 (네임태그)' },
  ],
}

// ════════════════════════════════════════
// 고급 재료 도감 아이템 목록
// ════════════════════════════════════════
export const MATERIAL_POKEDEX = [
  { name: '못',           difficulty: '보통' },
  { name: '접착제',       difficulty: '보통' },
  { name: '곰백토',       difficulty: '약간어려움' },
  { name: '거친 종이',    difficulty: '약간어려움' },
  { name: '반짝수',       difficulty: '약간어려움' },
  { name: '베어 강력 접착제', difficulty: '약간어려움' },
  { name: '연마 가루',    difficulty: '어려움' },
  { name: '베어 크리스탈', difficulty: '어려움' },
  { name: '탐욕의 실',    difficulty: '어려움' },
  { name: '에너지 오브',  difficulty: '어려움' },
  { name: '요리용 그릇',  difficulty: '어려움' },
  { name: '디저트용 그릇', difficulty: '어려움' },
  { name: '음료병',       difficulty: '어려움' },
  { name: '보존 코어 소자', difficulty: '매우어려움' },
  { name: '고품질 종이',  difficulty: '매우어려움' },
  { name: '정화 플라스크', difficulty: '매우어려움' },
  { name: '체인',         difficulty: '매우어려움' },
  { name: '고품질 원단',  difficulty: '극히어려움' },
  { name: '보존 코어 모듈', difficulty: '극히어려움' },
  { name: '베어 철판',    difficulty: '극히어려움' },
  { name: '정화의 결정',  difficulty: '극히어려움' },
  { name: '무기의 혼',    difficulty: '약간악랄함' },
  { name: '방어구의 혼',  difficulty: '약간악랄함' },
  { name: '일반 장비 가루', difficulty: '극히어려움' },
  { name: '고급 장비 가루', difficulty: '약간악랄함' },
  { name: '희귀 장비 가루', difficulty: '악랄함' },
  { name: '영웅 장비 가루', difficulty: '극악' },
  { name: '전설 장비 가루', difficulty: '지옥' },
  { name: '황금 주괴',    difficulty: '극히어려움' },
  { name: '슈팅스타',     difficulty: '약간악랄함' },
  { name: '오만의 왕관',  difficulty: '악랄함' },
  { name: '신의 주사위',  difficulty: '매우악랄함' },
  { name: '황금 망치',    difficulty: '매우악랄함' },
  { name: '황금 톱니바퀴', difficulty: '매우악랄함' },
  { name: '황금 열매',    difficulty: '매우악랄함' },
  { name: '황금 램프',    difficulty: '매우악랄함' },
]

// ════════════════════════════════════════
// 공예품 도감 아이템 목록
// 타락한 요정의 상자는 양쪽 도감에 모두 등록
// ════════════════════════════════════════
export const CRAFT_POKEDEX = [
  { name: '타락한 요정의 상자', difficulty: '극히어려움' },
  { name: '선장의 미니 포켓백', difficulty: '극히어려움' },
  { name: '베어 프린세스 모자', difficulty: '극히어려움' },
  { name: '가죽 어깨 보호구',  difficulty: '극히어려움' },
  { name: '바다의 보물지도',   difficulty: '극히어려움' },
  { name: '타락의 안내서',     difficulty: '극히어려움' },
  { name: '수상한 약재 정제세트', difficulty: '극히어려움' },
  { name: '천계의 찬란한 물약', difficulty: '극히어려움' },
  { name: '개량된 가죽 벨트',  difficulty: '극히어려움' },
  { name: '엔더 소드',         difficulty: '악랄함' },
  { name: '날카로운 송곳니 너클', difficulty: '악랄함' },
  { name: '불길한 증표',       difficulty: '약간악랄함' },
  { name: '수호의 증표',       difficulty: '약간악랄함' },
  { name: '바다의 울림 팬던트', difficulty: '악랄함' },
  { name: '광휘의 정화석',     difficulty: '약간악랄함' },
  { name: '스컬웹의 악의 구슬', difficulty: '약간악랄함' },
  { name: '불꽃 감옥 구슬',    difficulty: '약간악랄함' },
  { name: '타락한 요정의 상자', difficulty: '극히어려움' }, // 중복 등록
  { name: '여의주',            difficulty: '매우악랄함' },
  { name: '물방울 떡꼬치',     difficulty: '약간악랄함' },
  { name: '환약',              difficulty: '약간악랄함' },
  { name: '메뚜기떼의 해적 깃발', difficulty: '악랄함' },
  { name: '따스한 후드 점퍼',  difficulty: '악랄함' },
  { name: '드래곤 마법진',     difficulty: '매우악랄함' },
  { name: '위더 크루세이더의 갑옷', difficulty: '매우악랄함' },
  { name: '루미너스 루프',     difficulty: '악랄함' },
  { name: '맹독의 손길',       difficulty: '매우악랄함' },
  { name: '곤충 채집통',       difficulty: '매우악랄함' },
]