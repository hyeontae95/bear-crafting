// src/data/MasterDatabase.js

export const MasterDatabase = {
    // 🔨 대장장이 (Blacksmith) 데이터
    blacksmith: {
        level0: [
            {
                itemName: "못",
                criticalSuccessQuantity: 16,
                additionalSuccessQuantity: 12,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "철 주괴", requiredQuantity: 64, sourceCategory: "vanilla" },
                    { materialName: "구리 주괴", requiredQuantity: 64, sourceCategory: "vanilla" },
                    { materialName: "레드 스톤", requiredQuantity: 32, sourceCategory: "vanilla" }
                ]
            },
            {
                itemName: "기본 접착제",
                criticalSuccessQuantity: 16,
                additionalSuccessQuantity: 12,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "슬라임 블록", requiredQuantity: 64, sourceCategory: "vanilla" },
                    { materialName: "꿀 블록", requiredQuantity: 32, sourceCategory: "vanilla" },
                    { materialName: "물병", requiredQuantity: 8, sourceCategory: "vanilla" }
                ]
            }
        ],
        basicTier1: [
            {
                itemName: "곰백토",
                criticalSuccessQuantity: 12,
                additionalSuccessQuantity: 10,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "애벌레", requiredQuantity: 16, sourceCategory: "farmer" },
                    { materialName: "불의 원소 가루", requiredQuantity: 56, sourceCategory: "farmer" },
                    { materialName: "영혼의 원소 가루", requiredQuantity: 20, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "거친 종이",
                criticalSuccessQuantity: 12,
                additionalSuccessQuantity: 10,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "나무 껍질", requiredQuantity: 16, sourceCategory: "lumberjack" },
                    { materialName: "바람의 원소 가루", requiredQuantity: 56, sourceCategory: "lumberjack" },
                    { materialName: "영혼의 원소 가루", requiredQuantity: 20, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "반짝수",
                criticalSuccessQuantity: 12,
                additionalSuccessQuantity: 10,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "진주", requiredQuantity: 16, sourceCategory: "fisher" },
                    { materialName: "물의 원소 가루", requiredQuantity: 56, sourceCategory: "fisher" },
                    { materialName: "영혼의 원소 가루", requiredQuantity: 20, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "베어 강력 접착제",
                criticalSuccessQuantity: 12,
                additionalSuccessQuantity: 10,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "가넷", requiredQuantity: 16, sourceCategory: "miner" },
                    { materialName: "땅의 원소 가루", requiredQuantity: 56, sourceCategory: "miner" },
                    { materialName: "영혼의 원소 가루", requiredQuantity: 20, sourceCategory: "hunter" }
                ]
            }
        ],
        basicTier2: [
            {
                itemName: "연마 가루",
                criticalSuccessQuantity: 5,
                additionalSuccessQuantity: 4,
                normalSuccessQuantity: 3,
                requiredMaterials: [
                    { materialName: "아쿠아마린", requiredQuantity: 32, sourceCategory: "miner" },
                    { materialName: "솔라이트 원석", requiredQuantity: 1, sourceCategory: "miner" },
                    { materialName: "용왕의 왕관", requiredQuantity: 1, sourceCategory: "fisher" },
                    { materialName: "땅의 원소 조각", requiredQuantity: 48, sourceCategory: "miner" },
                    { materialName: "영혼의 원소 조각", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "베어 크리스탈",
                criticalSuccessQuantity: 5,
                additionalSuccessQuantity: 4,
                normalSuccessQuantity: 3,
                requiredMaterials: [
                    { materialName: "행운의 편지", requiredQuantity: 32, sourceCategory: "fisher" },
                    { materialName: "용왕의 왕관", requiredQuantity: 1, sourceCategory: "fisher" },
                    { materialName: "개량된 목화솜", requiredQuantity: 1, sourceCategory: "farmer" },
                    { materialName: "물의 원소 조각", requiredQuantity: 48, sourceCategory: "fisher" },
                    { materialName: "영혼의 원소 조각", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "탐욕의 실",
                criticalSuccessQuantity: 5,
                additionalSuccessQuantity: 4,
                normalSuccessQuantity: 3,
                requiredMaterials: [
                    { materialName: "고목나무 수액", requiredQuantity: 32, sourceCategory: "lumberjack" },
                    { materialName: "원시 부족 가면", requiredQuantity: 1, sourceCategory: "lumberjack" },
                    { materialName: "솔라이트 원석", requiredQuantity: 1, sourceCategory: "miner" },
                    { materialName: "바람의 원소 조각", requiredQuantity: 48, sourceCategory: "lumberjack" },
                    { materialName: "영혼의 원소 조각", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "에너지 오브",
                criticalSuccessQuantity: 5,
                additionalSuccessQuantity: 4,
                normalSuccessQuantity: 3,
                requiredMaterials: [
                    { materialName: "무당벌레", requiredQuantity: 32, sourceCategory: "farmer" },
                    { materialName: "개량된 목화솜", requiredQuantity: 1, sourceCategory: "farmer" },
                    { materialName: "원시 부족 가면", requiredQuantity: 1, sourceCategory: "lumberjack" },
                    { materialName: "불의 원소 조각", requiredQuantity: 48, sourceCategory: "farmer" },
                    { materialName: "영혼의 원소 조각", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            }
        ],
        toolsAndOthers: [
            {
                itemName: "요리용 그릇",
                criticalSuccessQuantity: 0,
                additionalSuccessQuantity: 0,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "곰백토", requiredQuantity: 8, sourceCategory: "blacksmith" },
                    { materialName: "에너지 오브", requiredQuantity: 2, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "디저트용 그릇",
                criticalSuccessQuantity: 0,
                additionalSuccessQuantity: 0,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "거친 종이", requiredQuantity: 8, sourceCategory: "blacksmith" },
                    { materialName: "베어 크리스탈", requiredQuantity: 2, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "유리병",
                criticalSuccessQuantity: 0,
                additionalSuccessQuantity: 0,
                normalSuccessQuantity: 8,
                requiredMaterials: [
                    { materialName: "반짝수", requiredQuantity: 8, sourceCategory: "blacksmith" },
                    { materialName: "탐욕의 실", requiredQuantity: 2, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "공예품 끌",
                criticalSuccessQuantity: 0,
                additionalSuccessQuantity: 0,
                normalSuccessQuantity: 3,
                requiredMaterials: [
                    { materialName: "베어 크리스탈", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "에너지 오브", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "거친 종이", requiredQuantity: 8, sourceCategory: "blacksmith" }
                ]
            }
        ],
        basicTier3: [
            {
                itemName: "고품질 종이",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "메뚜기", requiredQuantity: 16, sourceCategory: "farmer" },
                    { materialName: "실종된 농부의 땅문서", requiredQuantity: 2, sourceCategory: "farmer" },
                    { materialName: "고대식물의 모종", requiredQuantity: 1, sourceCategory: "farmer" },
                    { materialName: "곰백토", requiredQuantity: 12, sourceCategory: "blacksmith" },
                    { materialName: "에너지 오브", requiredQuantity: 6, sourceCategory: "blacksmith" },
                    { materialName: "불의 원소 정수", requiredQuantity: 24, sourceCategory: "farmer" }
                ]
            },
            {
                itemName: "정화 플라스크",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "해적의 보물상자", requiredQuantity: 16, sourceCategory: "fisher" },
                    { materialName: "실종된 잠수부 헬멧", requiredQuantity: 2, sourceCategory: "fisher" },
                    { materialName: "고대 물의 영혼석", requiredQuantity: 1, sourceCategory: "fisher" },
                    { materialName: "반짝수", requiredQuantity: 12, sourceCategory: "blacksmith" },
                    { materialName: "베어 크리스탈", requiredQuantity: 6, sourceCategory: "blacksmith" },
                    { materialName: "물의 원소 정수", requiredQuantity: 24, sourceCategory: "fisher" }
                ]
            },
            {
                itemName: "보존 코어 소자",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "토파즈", requiredQuantity: 16, sourceCategory: "miner" },
                    { materialName: "실종된 광부의 표본 샘플", requiredQuantity: 2, sourceCategory: "miner" },
                    { materialName: "고대의 피라미드 큐브", requiredQuantity: 1, sourceCategory: "miner" },
                    { materialName: "베어 강력 접착제", requiredQuantity: 12, sourceCategory: "blacksmith" },
                    { materialName: "연마 가루", requiredQuantity: 6, sourceCategory: "blacksmith" },
                    { materialName: "땅의 원소 정수", requiredQuantity: 24, sourceCategory: "miner" }
                ]
            },
            {
                itemName: "체인",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "맨드레이크", requiredQuantity: 16, sourceCategory: "lumberjack" },
                    { materialName: "실종된 나무꾼의 장갑", requiredQuantity: 2, sourceCategory: "lumberjack" },
                    { materialName: "고대 정령의 메아리", requiredQuantity: 1, sourceCategory: "lumberjack" },
                    { materialName: "거친 종이", requiredQuantity: 12, sourceCategory: "blacksmith" },
                    { materialName: "탐욕의 실", requiredQuantity: 6, sourceCategory: "blacksmith" },
                    { materialName: "바람의 원소 정수", requiredQuantity: 24, sourceCategory: "lumberjack" }
                ]
            },
            {
                itemName: "영혼 가죽",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 3, sourceCategory: "hunter" },
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 1, sourceCategory: "hunter" },
                    { materialName: "영혼의 원소 정수", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            }
        ],
        basicTier4: [
            {
                itemName: "고품질 원단",
                artisanSuccessQuantity: 1,
                normalSuccessQuantity: 1,
                normalSuccessItemName: "고품질 종이",
                requiredMaterials: [
                    { materialName: "딱정벌레", requiredQuantity: 80, sourceCategory: "farmer" },
                    { materialName: "고대식물의 모종", requiredQuantity: 2, sourceCategory: "farmer" },
                    { materialName: "불의 정령의 꽃 화관", requiredQuantity: 4, sourceCategory: "farmer" },
                    { materialName: "불의 원소 정수", requiredQuantity: 32, sourceCategory: "farmer" },
                    { materialName: "에너지 오브", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "정화의 결정",
                artisanSuccessQuantity: 1,
                normalSuccessQuantity: 1,
                normalSuccessItemName: "정화 플라스크",
                requiredMaterials: [
                    { materialName: "마녀의 눈물", requiredQuantity: 80, sourceCategory: "fisher" },
                    { materialName: "고대 물의 영혼석", requiredQuantity: 2, sourceCategory: "fisher" },
                    { materialName: "물의 정령의 유리구두", requiredQuantity: 4, sourceCategory: "fisher" },
                    { materialName: "물의 원소 정수", requiredQuantity: 32, sourceCategory: "fisher" },
                    { materialName: "베어 크리스탈", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "보존 코어 모듈",
                artisanSuccessQuantity: 1,
                normalSuccessQuantity: 1,
                normalSuccessItemName: "보존 코어 소자",
                requiredMaterials: [
                    { materialName: "페리도트", requiredQuantity: 80, sourceCategory: "miner" },
                    { materialName: "고대의 피라미드 큐브", requiredQuantity: 2, sourceCategory: "miner" },
                    { materialName: "대지의 정령의 호박화석", requiredQuantity: 4, sourceCategory: "miner" },
                    { materialName: "땅의 원소 정수", requiredQuantity: 32, sourceCategory: "miner" },
                    { materialName: "연마 가루", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "베어 철판",
                artisanSuccessQuantity: 1,
                normalSuccessQuantity: 1,
                normalSuccessItemName: "체인",
                requiredMaterials: [
                    { materialName: "바오밥나무 뿌리", requiredQuantity: 80, sourceCategory: "lumberjack" },
                    { materialName: "고대 정령의 메아리", requiredQuantity: 2, sourceCategory: "lumberjack" },
                    { materialName: "나무의 정령의 연꽃 찻잔", requiredQuantity: 4, sourceCategory: "lumberjack" },
                    { materialName: "바람의 원소 정수", requiredQuantity: 32, sourceCategory: "lumberjack" },
                    { materialName: "탐욕의 실", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "무두질된 영혼 가죽",
                artisanSuccessQuantity: 1,
                normalSuccessQuantity: 1,
                normalSuccessItemName: "영혼 가죽",
                requiredMaterials: [
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "어둠의 정령의 부서진 스태프", requiredQuantity: 4, sourceCategory: "hunter" },
                    { materialName: "영혼의 원소 정수", requiredQuantity: 32, sourceCategory: "hunter" }
                ]
            }
        ]
    },
    // 🎨 공예가 (Crafter) 데이터
    crafter: {
        uncommon: [
            {
                itemName: "베어 프린세스 모자",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "부드러운 깃털", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "거친 종이", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "개량된 가죽 벨트",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "짐승의 가죽", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "곰백토", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "바다의 보물지도",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "부드러운 털", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "거친 종이", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "선장의 미니 포켓백",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "물방울의 별", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "베어 강력 접착제", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "타락의 안내서",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "더러운 천", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "거친 종이", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "수상한 약재 정제세트",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "수상한 주머니", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "반짝수", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "천계의 찬란한 물약",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "미스틱 코어", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "반짝수", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "타락한 요정의 상자",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "엔더 진주 가루", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "곰백토", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            },
            {
                itemName: "가죽 어깨 보호구",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "짐승의 가죽", requiredQuantity: 9, sourceCategory: "hunter" },
                    { materialName: "신비한 동물 가죽", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "베어 강력 접착제", requiredQuantity: 4, sourceCategory: "blacksmith" }
                ]
            }
        ],
        rare: [
            {
                itemName: "광휘의 정화석",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "에너지 오브", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "반짝수", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "미스틱 코어", requiredQuantity: 18, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "스컬웰의 악의 구술",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "탐욕의 실", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "곰백토", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "사악한 기운", requiredQuantity: 18, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "불꽃 감옥 구술",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "연마가루", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "곰백토", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "넘실거리는 불꽃", requiredQuantity: 18, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "물방울 떡꼬치",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "베어 크리스탈", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "반짝수", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "물방울의 별", requiredQuantity: 18, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "환 약",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "에너지 오브", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "거친 종이", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "짐승의 꼬리", requiredQuantity: 18, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "수호의 증표",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "베어 크리스탈", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "반짝수", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "야생사냥꾼 증표 I", requiredQuantity: 1, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "불길한 증표",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "탐욕의 실", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "실종된 사냥꾼 고글", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "거친 종이", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "야생사냥꾼 증표 I", requiredQuantity: 1, sourceCategory: "hunter" }
                ]
            }
        ],
        epic: [
            {
                itemName: "바다의 울림 팬던트",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "정화 플라스크", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "베어 크리스탈", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "공허의 파동", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "메뚜기떼의 해적 깃발",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "영혼 가죽", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "탐욕의 실", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "용의 피", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "날카로운 송곳니 너클",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "체인", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "연마가루", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "야생사냥꾼 증표 II", requiredQuantity: 1, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "엔더 소드",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "보존 코어소자", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "베어 크리스탈", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "타락한 요정의 가루", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "루미너트 루프",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "고품질 종이", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "에너지 오브", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "요정의 가루", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "따스한 후드 점퍼",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "영혼 가죽", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "고대의 맘모스 뿔", requiredQuantity: 2, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "탐욕의 실", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "가스트의 파편", requiredQuantity: 24, sourceCategory: "hunter" }
                ]
            }
        ],
        legendary: [
            {
                itemName: "드래곤 마법진",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "고품질 원단", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "영혼 가죽", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "어둠의 정령의 부서진 스태프", requiredQuantity: 1, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 4, sourceCategory: "blacksmith" },
                    { materialName: "불의 결정체", requiredQuantity: 32, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "곤충 채집통",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "보존 코어 모듈", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "정화 플라스크", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "어둠의 정령의 부서진 스태프", requiredQuantity: 1, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 4, sourceCategory: "blacksmith" },
                    { materialName: "대지의 결정체", requiredQuantity: 32, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "위더 크루세이더의 갑옷",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "베어 철판", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "체인", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "어둠의 정령의 부서진 스태프", requiredQuantity: 1, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 4, sourceCategory: "blacksmith" },
                    { materialName: "바람의 결정체", requiredQuantity: 32, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "맹독의 손길",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "무두질된 영혼 가죽", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "보존 코어소자", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "어둠의 정령의 부서진 스태프", requiredQuantity: 1, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 4, sourceCategory: "blacksmith" },
                    { materialName: "물의 결정체", requiredQuantity: 32, sourceCategory: "hunter" }
                ]
            },
            {
                itemName: "여의주",
                criticalSuccessQuantity: 3,
                additionalSuccessQuantity: 2,
                normalSuccessQuantity: 1,
                requiredMaterials: [
                    { materialName: "정화의 결정", requiredQuantity: 1, sourceCategory: "blacksmith" },
                    { materialName: "고품질 종이", requiredQuantity: 2, sourceCategory: "blacksmith" },
                    { materialName: "어둠의 정령의 부서진 스태프", requiredQuantity: 1, sourceCategory: "hunter" },
                    { materialName: "공예품 끌", requiredQuantity: 4, sourceCategory: "blacksmith" },
                    { materialName: "빛의 결정체", requiredQuantity: 16, sourceCategory: "hunter" },
                    { materialName: "어둠의 결정체", requiredQuantity: 16, sourceCategory: "hunter" }
                ]
            }
        ]
    }
};