/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StageConfig, Equipment, AgeGroup, CharacterState } from "./types";

export const STAGES: StageConfig[] = [
  {
    id: "stage-k7",
    title: "가르기와 모으기 산속 마을",
    ageGroup: AgeGroup.K7,
    theme: "10 이하 덧셈과 뺄셈",
    description: "블록을 자르고 묶고 모으며 수리 감각의 기초를 세워요!",
    concepts: ["10 이하 가르기와 모으기", "더하기 식 가르기", "직관적 동물 카운팅"],
    color: "pink",
    bgGradient: "from-pink-500/20 to-rose-500/20 text-pink-700 border-pink-200"
  },
  {
    id: "stage-g1",
    title: "10의 보수 신비한 동굴",
    ageGroup: AgeGroup.G1,
    theme: "20 이하의 연산",
    description: "10칸 프레임 상자를 쏙쏙 채우며 십의 자리 올림을 정복해봐요!",
    concepts: ["10의 보수 만들기", "받아올림 있는 덧셈", "받아내림이 있는 뺄셈"],
    color: "amber",
    bgGradient: "from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200"
  },
  {
    id: "stage-g2",
    title: "동수누가 받아올림 화강암 성",
    ageGroup: AgeGroup.G2,
    theme: "두 자리 수 연산 & 곱셈구구",
    description: "십 모형과 일 모형을 쌓아 대형 덧셈을 풀고 번개같은 곱셈구구를 배워요!",
    concepts: ["두 자리 수의 덧셈/뺄셈 세로셈", "동수누가 (같은 수 반복해서 더하기)", "곱셈 원리와 묶음 모델"],
    color: "emerald",
    bgGradient: "from-emerald-500/20 to-teal-500/20 text-emerald-700 border-emerald-200"
  },
  {
    id: "stage-g3",
    title: "대수학자의 등분할 마법 숲",
    ageGroup: AgeGroup.G3,
    theme: "나눗셈 기초, 곱셈 심화 및 분수",
    description: "과일을 접시에 나누어 담듯 나눗셈을 배우고, 원형 케이크를 쪼개어 분수를 배워요!",
    concepts: ["두 자리 수 곱하기 한 자리 수", "나눗셈 분배/등분 가르기", "분수 기본 (전체와 부분 분할)"],
    color: "sky",
    bgGradient: "from-sky-500/20 to-blue-500/20 text-sky-700 border-sky-200"
  }
];

export const CHARACTER_TEMPLATES: { [key: string]: CharacterState } = {
  fire: {
    id: "fire_starter",
    name: "불리",
    type: "fire",
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    evolutionStage: 1,
    avatarName: "아기용 불리",
    description: "꼬리 끝에 수학 열정이 타오르는 아기 드래곤. 문제를 풀수록 불꽃이 화려해져요!"
  },
  water: {
    id: "water_starter",
    name: "아쿠",
    type: "water",
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    evolutionStage: 1,
    avatarName: "아기오리 아쿠",
    description: "수만 가지 공식을 물총으로 뿜어내는 호기심 많은 오리. 연산 속도가 아주 빠르답니다!"
  },
  leaf: {
    id: "leaf_starter",
    name: "그리니",
    type: "leaf",
    level: 1,
    exp: 0,
    nextLevelExp: 100,
    evolutionStage: 1,
    avatarName: "요정스프라우트 그리니",
    description: "수학적 지혜를 자양분 삼아 정교해지는 요정 전사. 사고력 실수가 적은 신중한 새싹이랍니다!"
  }
};

export const INITIAL_SHOP_ITEMS: Equipment[] = [
  // Weapons
  {
    id: "weapon_wood",
    name: "수습 수학 검",
    type: "weapon",
    grade: "NORMAL",
    statDescription: "EXP 보너스 +5%",
    goldPrice: 60,
    expBonus: 5,
    icon: "Sword",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    equipped: false
  },
  {
    id: "weapon_magi",
    name: "연산 마법 지팡이",
    type: "weapon",
    grade: "RARE",
    statDescription: "EXP 보너스 +12%",
    goldPrice: 150,
    expBonus: 12,
    icon: "Sparkles",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    equipped: false
  },
  {
    id: "weapon_pytha",
    name: "피타고라스 세이버",
    type: "weapon",
    grade: "EPIC",
    statDescription: "EXP 보너스 +25%",
    goldPrice: 320,
    expBonus: 25,
    icon: "Zap",
    color: "text-purple-600 bg-purple-50 border-purple-200",
    equipped: false
  },
  
  // Helmets
  {
    id: "helm_cap",
    name: "수리 탐험 모험모",
    type: "helmet",
    grade: "NORMAL",
    statDescription: "획득 골드 증가 +5%",
    goldPrice: 50,
    expBonus: 0,
    icon: "Crown",
    color: "text-slate-600 bg-slate-50 border-slate-200",
    equipped: false
  },
  {
    id: "helm_goggles",
    name: "숫자 돋보기 고글",
    type: "helmet",
    grade: "RARE",
    statDescription: "획득 골드 증가 +12%",
    goldPrice: 120,
    expBonus: 0,
    icon: "Eye",
    color: "text-pink-600 bg-pink-50 border-pink-200",
    equipped: false
  },
  {
    id: "helm_crown",
    name: "대수학자의 금관",
    type: "helmet",
    grade: "EPIC",
    statDescription: "EXP +10% | 골드 +10%",
    goldPrice: 300,
    expBonus: 10,
    icon: "Wand2",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    equipped: false
  },

  // Armors / Cape
  {
    id: "armor_robe",
    name: "연습용 수학 로브",
    type: "armor",
    grade: "NORMAL",
    statDescription: "EXP 보너스 +5%",
    goldPrice: 70,
    expBonus: 5,
    icon: "ShieldAlert",
    color: "text-teal-600 bg-teal-50 border-teal-200",
    equipped: false
  },
  {
    id: "armor_matrix",
    name: "매트릭스 수리 갑옷",
    type: "armor",
    grade: "RARE",
    statDescription: "골드 가속 +8% | EXP +8%",
    goldPrice: 180,
    expBonus: 8,
    icon: "Shield",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    equipped: false
  },
  {
    id: "armor_gandus",
    name: "원리 영원의 황금 갑옷",
    type: "armor",
    grade: "LEGENDARY",
    statDescription: "획득 EXP +20% | 골드 +15%",
    goldPrice: 450,
    expBonus: 20,
    icon: "ShieldCheck",
    color: "text-red-600 bg-red-50 border-red-200",
    equipped: false
  },

  // Accessory
  {
    id: "acc_book",
    name: "원리셈 비법 노트",
    type: "accessory",
    grade: "RARE",
    statDescription: "EXP 보너스 +10%",
    goldPrice: 140,
    expBonus: 10,
    icon: "BookOpen",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    equipped: false
  },
  {
    id: "acc_necklace",
    name: "무한대 기호 목걸이",
    type: "accessory",
    grade: "EPIC",
    statDescription: "획득 골드 가속 +25%",
    goldPrice: 280,
    expBonus: 0,
    icon: "Infinity",
    color: "text-sky-600 bg-sky-50 border-sky-300",
    equipped: false
  },
  
  // Special Daily Quest Reward Equipments (5 types)
  {
    id: "sp_pencil",
    name: "반짝이는 연필",
    type: "weapon",
    grade: "RARE",
    statDescription: "연산 보수 정확도 +5% 상승",
    goldPrice: 999, // Unbuyable, reward only
    expBonus: 5,
    icon: "Pencil",
    color: "text-yellow-500 bg-yellow-50 border-yellow-200",
    equipped: false
  },
  {
    id: "sp_potion",
    name: "시간 가속 물약",
    type: "accessory",
    grade: "RARE",
    statDescription: "퀴즈 제한 시간 +10초 가속",
    goldPrice: 999,
    expBonus: 0,
    icon: "FlaskConical",
    color: "text-cyan-500 bg-cyan-50 border-cyan-200",
    equipped: false
  },
  {
    id: "sp_feather",
    name: "지혜의 깃털펜",
    type: "weapon",
    grade: "EPIC",
    statDescription: "EXP 획득 보너스 +10%",
    goldPrice: 999,
    expBonus: 10,
    icon: "PenTool",
    color: "text-purple-500 bg-purple-50 border-purple-200",
    equipped: false
  },
  {
    id: "sp_book",
    name: "원리셈 마법책",
    type: "accessory",
    grade: "EPIC",
    statDescription: "골드 획득 가속 +15%",
    goldPrice: 999,
    expBonus: 0,
    icon: "BookOpenCheck",
    color: "text-rose-500 bg-rose-50 border-rose-200",
    equipped: false
  },
  {
    id: "sp_clover",
    name: "행운의 네잎클로버",
    type: "accessory",
    grade: "LEGENDARY",
    statDescription: "경험치 획득 보너스 +15%",
    goldPrice: 999,
    expBonus: 15,
    icon: "Clover",
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    equipped: false
  }
];

// Helper functions to get EVOLUTION status based on Level
export function getEvolutionStage(type: string, level: number): { stage: number, name: string, description: string, imagePrompt: string } {
  if (level >= 12) {
    if (type === "fire") return {
      stage: 3,
      name: "피로고라스 메가드래곤",
      description: "고대 3층 불꽃 연산의 화신. 완벽한 양적 수리 감각으로 우주를 불태워 계산해요!",
      imagePrompt: "fearsome friendly red math fire dragon wizard wearing gold mathematical pi crown, high fantasy digital art"
    };
    if (type === "water") return {
      stage: 3,
      name: "넵튜니안 로얄오리",
      description: "바다의 무한한 나눗셈과 비례의 제왕. 초고속 암산 능력으로 쓰나미처럼 공격합니다!",
      imagePrompt: "powerful cute blue sea seal king wearing royal ocean robe with glowing math equations runestones, highly detailed fantasy digital art"
    };
    return {
      stage: 3,
      name: "세쿼이아 세계수의 대수학수",
      description: "자연의 피보나치 수열과 고결한 등분할 기하학의 수호신. 흔들림 없는 완벽한 원리 마스터!",
      imagePrompt: "wise majestic elven white wolf with glowing leaf wings and green geometrical circle aura, peaceful magical setting"
    };
  } else if (level >= 5) {
    if (type === "fire") return {
      stage: 2,
      name: "원리 파이터 불캐논",
      description: "모으기와 가르기의 불꽃 주먹 용사. 정비된 연산력을 주위에 분출합니다!",
      imagePrompt: "cool cute dinosaur dragon wearing steel helmet with numbers, fire element sparky companion"
    };
    if (type === "water") return {
      stage: 2,
      name: "아쿠아 십보수 랜서",
      description: "10의 자리를 자르며 정확한 보수 창끝을 겨누는 아웃복서. 연산 비법을 터득했습니다!",
      imagePrompt: "cute champion duck holding wooden water staff with 10-frame symbols, dynamic water splash"
    };
    return {
      stage: 2,
      name: "실바 플라워 엘븐",
      description: "나뭇잎의 줄기로 곱셈 매트릭스 백발백중 화살을 쏘는 요정 전사. 실수가 거의 없어요!",
      imagePrompt: "elegant green elven fox companion with beautiful glowing yellow flowers and wooden bow"
    };
  } else {
    if (type === "fire") return {
      stage: 1,
      name: "아기용 불리",
      description: "꼬리 끝에 수학 열정이 타오르는 아기 드래곤. 문제를 풀수록 불꽃이 화려해져요!",
      imagePrompt: "cute tiny chibi red fire dragon sitting on math book, cute friendly face big eyes"
    };
    if (type === "water") return {
      stage: 1,
      name: "아기오리 아쿠",
      description: "수만 가지 공식을 물총으로 뿜어내는 호기심 많은 오리. 연산 속도가 아주 빠르답니다!",
      imagePrompt: "cute little yellow baby duck sitting in a water droplet with bubbles, smiling eyes"
    };
    return {
      stage: 1,
      name: "스프라우트 그리니",
      description: "수학적 지혜를 자양분 삼아 정교해지는 요정 전사. 사고력 실수가 적은 신중한 새싹이랍니다!",
      imagePrompt: "adorable tiny micro green sprout monster with pink blushing cheeks and leaf hat, cute happy expression"
    };
  }
}
