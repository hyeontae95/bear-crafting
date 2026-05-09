// src/data/imageMap.js

/**
 * 한글 아이템/재료 이름 → 이미지 파일명 (확장자 제외)
 * 
 * 사용:
 *   import { getItemImage } from './imageMap.js'
 *   const url = getItemImage('고품질 원단')
 *   // → '/images/items/high_quality_fabric.png' 또는 null
 * 
 * 이미지 위치: public/images/items/{filename}.png
 * 
 * 매핑 없는 아이템은 자동으로 null 반환 (텍스트만 표시)
 */

export const imageMap = {
  // ════════════════════════════════════════
  // 🔨 대장장이 - level0 (기본)
  // ════════════════════════════════════════
  '못': 'nail',
  '기본 접착제': 'basic_glue',

  // ════════════════════════════════════════
  // 🔨 대장장이 - basicTier1 (I급)
  // ════════════════════════════════════════
  '곰백토': 'bear_clay',
  '거친 종이': 'rough_paper',
  '반짝수': 'glitter_water',
  '베어 강력 접착제': 'bear_strong_glue',

  // ════════════════════════════════════════
  // 🔨 대장장이 - basicTier2 (II급)
  // ════════════════════════════════════════
  '연마 가루': 'polishing_powder',
  '베어 크리스탈': 'bear_crystal',
  '탐욕의 실': 'greed_thread',
  '에너지 오브': 'energy_orb',

  // ════════════════════════════════════════
  // 🔨 대장장이 - 도구
  // ════════════════════════════════════════
  '요리용 그릇': 'cooking_bowl',
  '디저트용 그릇': 'dessert_bowl',
  '유리병': 'glass_bottle',
  '공예품 끌': 'craft_chisel',

  // ════════════════════════════════════════
  // 🔨 대장장이 - basicTier3 (III급)
  // ════════════════════════════════════════
  '고품질 종이': 'high_quality_paper',
  '정화 플라스크': 'purification_flask',
  '보존 코어 소자': 'preservation_core_element',
  '체인': 'chain',
  '영혼 가죽': 'soul_leather',

  // ════════════════════════════════════════
  // 🔨 대장장이 - basicTier4 (IIII급, 장인)
  // ════════════════════════════════════════
  '고품질 원단': 'high_quality_fabric',
  '정화의 결정': 'purification_crystal',
  '보존 코어 모듈': 'preservation_core_module',
  '베어 철판': 'bear_steel_plate',
  '무두질된 영혼 가죽': 'tanned_soul_leather',

  // ════════════════════════════════════════
  // 🪡 공예가 - UNCOMMON
  // ════════════════════════════════════════
  '베어 프린세스 모자': 'bear_princess_hat',
  '개량된 가죽 벨트': 'improved_leather_belt',
  '바다의 보물지도': 'sea_treasure_map',
  '선장의 미니 포켓백': 'captain_mini_pocketbag',
  '타락의 안내서': 'corruption_guidebook',
  '수상한 약재 정제세트': 'suspicious_herb_kit',
  '천계의 찬란한 물약': 'celestial_potion',
  '타락한 요정의 상자': 'corrupted_fairy_box',
  '가죽 어깨 보호구': 'leather_shoulder_pad',

  // ════════════════════════════════════════
  // 🪡 공예가 - RARE
  // ════════════════════════════════════════
  '광휘의 정화석': 'radiance_purification_stone',
  '스컬웰의 악의 구술': 'skullwell_evil_orb',
  '불꽃 감옥 구술': 'flame_prison_orb',
  '물방울 떡꼬치': 'waterdrop_skewer',
  '환 약': 'pill',
  '수호의 증표': 'guardian_token',
  '불길한 증표': 'ominous_token',

  // ════════════════════════════════════════
  // 🪡 공예가 - EPIC
  // ════════════════════════════════════════
  '바다의 울림 팬던트': 'sea_echo_pendant',
  '메뚜기떼의 해적 깃발': 'locust_pirate_flag',
  '날카로운 송곳니 너클': 'sharp_fang_knuckle',
  '엔더 소드': 'ender_sword',
  '루미너트 루프': 'luminate_loop',
  '따스한 후드 점퍼': 'warm_hood_jumper',

  // ════════════════════════════════════════
  // 🪡 공예가 - LEGENDARY
  // ════════════════════════════════════════
  '드래곤 마법진': 'dragon_magic_circle',
  '곤충 채집통': 'insect_collector',
  '위더 크루세이더의 갑옷': 'wither_crusader_armor',
  '맹독의 손길': 'poison_touch',
  '여의주': 'wishing_orb',

  // ════════════════════════════════════════
  // 🌾 농부 재료
  // ════════════════════════════════════════
  '애벌레': 'larva',
  '무당벌레': 'ladybug',
  '메뚜기': 'grasshopper',
  '딱정벌레': 'beetle',
  '불의 원소 가루': 'fire_essence_powder',
  '불의 원소 조각': 'fire_essence_shard',
  '불의 원소 정수': 'fire_essence_essence',
  '개량된 목화솜': 'improved_cotton',
  '실종된 농부의 땅문서': 'farmer_lost_deed',
  '고대식물의 모종': 'ancient_plant_seedling',
  '불의 정령의 꽃 화관': 'fire_spirit_flower_crown',

  // ════════════════════════════════════════
  // 🪓 나무꾼 재료
  // ════════════════════════════════════════
  '나무 껍질': 'tree_bark',
  '맨드레이크': 'mandrake',
  '바오밥나무 뿌리': 'baobab_root',
  '고목나무 수액': 'oldtree_sap',
  '바람의 원소 가루': 'wind_essence_powder',
  '바람의 원소 조각': 'wind_essence_shard',
  '바람의 원소 정수': 'wind_essence_essence',
  '원시 부족 가면': 'primitive_tribe_mask',
  '실종된 나무꾼의 장갑': 'lumberjack_lost_glove',
  '고대 정령의 메아리': 'ancient_spirit_echo',
  '나무의 정령의 연꽃 찻잔': 'wood_spirit_lotus_teacup',

  // ════════════════════════════════════════
  // 🎣 어부 재료
  // ════════════════════════════════════════
  '진주': 'pearl',
  '행운의 편지': 'lucky_letter',
  '해적의 보물상자': 'pirate_treasure_chest',
  '마녀의 눈물': 'witch_tears',
  '물의 원소 가루': 'water_essence_powder',
  '물의 원소 조각': 'water_essence_shard',
  '물의 원소 정수': 'water_essence_essence',
  '용왕의 왕관': 'dragonking_crown',
  '실종된 잠수부 헬멧': 'diver_lost_helmet',
  '고대 물의 영혼석': 'ancient_water_soulstone',
  '물의 정령의 유리구두': 'water_spirit_glassslippers',

  // ════════════════════════════════════════
  // ⛏️ 광부 재료
  // ════════════════════════════════════════
  '가넷': 'garnet',
  '아쿠아마린': 'aquamarine',
  '토파즈': 'topaz',
  '페리도트': 'peridot',
  '솔라이트 원석': 'solite_ore',
  '땅의 원소 가루': 'earth_essence_powder',
  '땅의 원소 조각': 'earth_essence_shard',
  '땅의 원소 정수': 'earth_essence_essence',
  '실종된 광부의 표본 샘플': 'miner_lost_sample',
  '고대의 피라미드 큐브': 'ancient_pyramid_cube',
  '대지의 정령의 호박화석': 'earth_spirit_amber_fossil',

  // ════════════════════════════════════════
  // 🏹 사냥꾼 재료
  // ════════════════════════════════════════
  '영혼의 원소 가루': 'soul_essence_powder',
  '영혼의 원소 조각': 'soul_essence_shard',
  '영혼의 원소 정수': 'soul_essence_essence',
  '실종된 사냥꾼 고글': 'hunter_lost_goggles',
  '고대의 맘모스 뿔': 'ancient_mammoth_horn',
  '어둠의 정령의 부서진 스태프': 'dark_spirit_broken_staff',
  '신비한 동물 가죽': 'mystic_animal_leather',
  '부드러운 깃털': 'soft_feather',
  '짐승의 가죽': 'beast_leather',
  '부드러운 털': 'soft_fur',
  '물방울의 별': 'waterdrop_star',
  '더러운 천': 'dirty_cloth',
  '수상한 주머니': 'suspicious_pouch',
  '미스틱 코어': 'mystic_core',
  '엔더 진주 가루': 'ender_pearl_powder',
  '사악한 기운': 'evil_aura',
  '넘실거리는 불꽃': 'surging_flame',
  '짐승의 꼬리': 'beast_tail',
  '야생사냥꾼 증표 I': 'wild_hunter_token',
  '야생사냥꾼 증표 II': 'wild_hunter_token2',
  '공허의 파동': 'void_wave',
  '타락한 월계수 잎': 'corrupted_laurel_leaf',
  '타락한 요정의 가루': 'corrupted_fairy_dust',
  '요정의 가루': 'fairy_dust',
  '가스트의 파편': 'ghast_fragment',
  '불의 결정체': 'fire_crystal_pure',
  '대지의 결정체': 'earth_crystal_pure',
  '바람의 결정체': 'wind_crystal_pure',
  '물의 결정체': 'water_crystal_pure',
  '빛의 결정체': 'light_crystal_pure',
  '어둠의 결정체': 'dark_crystal_pure',

  // ════════════════════════════════════════
  // 🟫 바닐라 재료 (마크 기본)
  // ════════════════════════════════════════
  '철 주괴': 'iron_ingot',
  '구리 주괴': 'copper_ingot',
  '레드 스톤': 'redstone',
  '슬라임 블록': 'slime_block',
  '꿀 블록': 'honey_block',
  '물병': 'water_bottle',
}

/**
 * 한글 이름 → 이미지 URL
 * 매핑 없거나 이미지 없으면 null 반환
 */
export function getItemImage(name) {
  const fileName = imageMap[name]
  if (!fileName) return null
  return `/images/items/${fileName}.png`
}