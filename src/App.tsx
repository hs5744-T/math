/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  Shield,
  Crown,
  Sword,
  BookOpen,
  Infinity,
  Eye,
  Trophy,
  Coins,
  Play,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Home,
  ShoppingBag,
  User,
  Map,
  Award,
  Plus,
  Minus,
  Check
} from "lucide-react";

import { AgeGroup, UserProfile, QuizQuestion, StageConfig, Equipment, GameQuest } from "./types";
import { STAGES, CHARACTER_TEMPLATES, INITIAL_SHOP_ITEMS, getEvolutionStage } from "./constants";
import { generateLocalQuestion } from "./mathGenerator";
import MathVisualizer from "./components/MathVisualizer";
import StudentLogin from "./components/StudentLogin";
import DailyDrill from "./components/DailyDrill";
import DailyFiveQuiz from "./components/DailyFiveQuiz";
import MomsDashboard from "./components/MomsDashboard";
import TeacherExplanationModal from "./components/TeacherExplanationModal";

// Default Profile for Quick Starting / Normal Setup
const INITIAL_PROFILE: UserProfile = {
  name: "용맹한 아기 용사",
  ageGroup: AgeGroup.K7,
  gold: 150,
  character: {
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
  inventory: [],
  equippedWeapon: null,
  equippedHelmet: null,
  equippedArmor: null,
  equippedAccessory: null,
  currentStageId: "stage-k7",
  difficultyRank: "보통",
  stats: {
    correctStreak: 0,
    totalSolved: 0,
    totalCorrect: 0,
    stageHighScores: {},
    dailyQuizzesSolved: 0,
    lastPlayedDate: new Date().toISOString().split("T")[0]
  }
};

export default function App() {
  // --- STATE SYSTEM ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("wonri_math_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PROFILE;
      }
    }
    return INITIAL_PROFILE;
  });

  const [hasRegistered, setHasRegistered] = useState<boolean>(() => {
    return localStorage.getItem("wonri_math_registered") === "true";
  });

  const [studentId, setStudentId] = useState<string>(() => {
    return localStorage.getItem("wonri_student_id") || "default_child";
  });

  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    return localStorage.getItem("wonri_apps_script_url") || "";
  });

  // Navigation: "map" | "shop" | "profile" | "training" | "battle" | "ai-quiz"
  const [activeTab, setActiveTab] = useState<string>("map");
  const [selectedStage, setSelectedStage] = useState<StageConfig>(STAGES[0]);
  const [mapViewMode, setMapViewMode] = useState<"world" | "stage">("world");

  // Helper helper to check if a learning age group stage is unlocked sequentially
  const isWorldUnlocked = (stageId: string, currentProfile: UserProfile): boolean => {
    if (stageId === "stage-k7") return true; // 7 years old is always open by default
    
    // 8 years old G1 is open if 7 years old K7 is mastered (>=3 bosses defeated) or if signup was higher age
    if (stageId === "stage-g1") {
      const k7Score = currentProfile.stats.stageHighScores["stage-k7"] || 0;
      return k7Score >= 3 || currentProfile.ageGroup !== AgeGroup.K7;
    }
    
    // 9 years old G2 is open if 8 years old G1 is mastered (>=3 bosses) or if signup was higher age (G2, G3)
    if (stageId === "stage-g2") {
      const g1Score = currentProfile.stats.stageHighScores["stage-g1"] || 0;
      const isG1Unlocked = (currentProfile.stats.stageHighScores["stage-k7"] || 0) >= 3 || currentProfile.ageGroup !== AgeGroup.K7;
      return (g1Score >= 3 && isG1Unlocked) || [AgeGroup.G2, AgeGroup.G3].includes(currentProfile.ageGroup);
    }
    
    // 10 years old G3 is open if 9 years old G2 is mastered (>=3 bosses) or signup was G3
    if (stageId === "stage-g3") {
      const g2Score = currentProfile.stats.stageHighScores["stage-g2"] || 0;
      const isG2Unlocked = (currentProfile.stats.stageHighScores["stage-g1"] || 0) >= 3 || [AgeGroup.G2, AgeGroup.G3].includes(currentProfile.ageGroup);
      return (g2Score >= 3 && isG2Unlocked) || currentProfile.ageGroup === AgeGroup.G3;
    }
    
    return false;
  };

  // Concept Sandbox params (for interactive learning)
  const [sandboxVal1, setSandboxVal1] = useState<number>(6);
  const [sandboxVal2, setSandboxVal2] = useState<number>(4);

  // Battle Mode Game loop state
  const [battleMonster, setBattleMonster] = useState<{
    name: string;
    maxHp: number;
    hp: number;
    image: string;
    level: number;
  }>({ name: "초록 물풀방울 슬라임", maxHp: 100, hp: 100, image: "🟢", level: 1 });

  const [battleQuiz, setBattleQuiz] = useState<QuizQuestion | null>(null);
  const [answeredState, setAnsweredState] = useState<{
    selectedIdx: number | null;
    isCorrect: boolean | null;
  }>({ selectedIdx: null, isCorrect: null });

  // Teacher explanation state
  const [showTeacherModal, setShowTeacherModal] = useState<boolean>(false);
  const [teacherModalData, setTeacherModalData] = useState<{
    question: string;
    explanation: string;
    correctAnswerText?: string;
  } | null>(null);

  // Floating feedback
  const [battleFeedback, setBattleFeedback] = useState<string>("");
  const [floatDamage, setFloatDamage] = useState<{ show: boolean; amt: number; isHeal: boolean }>({
    show: false,
    amt: 0,
    isHeal: false
  });

  // Daily Quests System
  const [quests, setQuests] = useState<GameQuest[]>([
    { id: "quest-1", title: "완벽 용사: 3번 연속 정답 맞추기", rewardExp: 30, rewardGold: 20, targetCount: 3, currentCount: 0, completed: false },
    { id: "quest-2", title: "연산 마스터: 몬스터 전투 5문제 풀기", rewardExp: 40, rewardGold: 30, targetCount: 5, currentCount: 0, completed: false },
    { id: "quest-3", title: "AI 도인: 무한의 AI 사고력 퀴즈 1회 풀기", rewardExp: 50, rewardGold: 40, targetCount: 1, currentCount: 0, completed: false }
  ]);

  // AI Quiz Specifics
  const [aiQuizLoading, setAiQuizLoading] = useState<boolean>(false);
  const [aiQuizError, setAiQuizError] = useState<string | null>(null);
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState<boolean>(true);

  // Growth / Level up / Evolution Alert triggers
  const [alertMessage, setAlertMessage] = useState<{ title: string; desc: string; icon: string } | null>(null);

  // Setup / Register options
  const [setupName, setSetupName] = useState<string>("");
  const [setupAge, setSetupAge] = useState<AgeGroup>(AgeGroup.K7);
  const [setupType, setSetupType] = useState<"fire" | "water" | "leaf">("fire");

  // --- SAVE PROFILE TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem("wonri_math_profile", JSON.stringify(profile));
  }, [profile]);

  // Synchronize initial stage selection based on ageGroup
  useEffect(() => {
    const stage = STAGES.find(s => s.ageGroup === profile.ageGroup) || STAGES[0];
    setSelectedStage(stage);
  }, [profile.ageGroup]);

  // --- REGISTRATION / START ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = setupName.trim() || `${setupType === "fire" ? "불꽃" : setupType === "water" ? "푸른" : "숲의"} 용사`;
    const starterChar = CHARACTER_TEMPLATES[setupType];
    const initialStage = STAGES.find(s => s.ageGroup === setupAge) || STAGES[0];

    // Build the inventory starting with some basic items matching age
    const startingProfile: UserProfile = {
      ...INITIAL_PROFILE,
      name: finalName,
      ageGroup: setupAge,
      currentStageId: initialStage.id,
      character: {
        ...starterChar,
        avatarName: starterChar.avatarName
      }
    };

    setProfile(startingProfile);
    setHasRegistered(true);
    localStorage.setItem("wonri_math_registered", "true");
    setActiveTab("map");

    setAlertMessage({
      title: "대모험 시작!",
      desc: `안녕, ${finalName}! 파트너 ${starterChar.avatarName}와 함께 수학 비밀을 헤쳐나가는 멋진 연산 어드벤처가 열렸어요. 화이팅!`,
      icon: "🎉"
    });
  };

  // --- QUEST EVALUATIONS ---
  const evalQuests = (actionType: "streak" | "battle" | "ai", count: number = 1) => {
    setQuests(prev => {
      return prev.map(q => {
        if (q.completed) return q;

        let newCount = q.currentCount;
        if (actionType === "streak" && q.id === "quest-1") {
          newCount = count;
        } else if (actionType === "battle" && q.id === "quest-2") {
          newCount = Math.min(q.targetCount, q.currentCount + count);
        } else if (actionType === "ai" && q.id === "quest-3") {
          newCount = Math.min(q.targetCount, q.currentCount + count);
        }

        const completed = newCount >= q.targetCount;
        if (completed && !q.completed) {
          // Grant reward immediately
          setTimeout(() => {
            gainRewards(q.rewardExp, q.rewardGold, `일일 퀘스트 [${q.title}] 성공!`);
          }, 300);
        }

        return { ...q, currentCount: newCount, completed };
      });
    });
  };

  // --- REWARDS SYSTEM (XP, GOLD) ---
  const gainRewards = (expAmt: number, goldAmt: number, reason: string) => {
    // Add gear multipliers if equipped
    let expMultiplier = 1;
    let goldMultiplier = 1;

    [profile.equippedWeapon, profile.equippedHelmet, profile.equippedArmor, profile.equippedAccessory].forEach(item => {
      if (item) {
        if (item.expBonus) expMultiplier += item.expBonus / 100;
        if (item.id === "helm_cap") goldMultiplier += 0.05;
        if (item.id === "helm_goggles") goldMultiplier += 0.12;
        if (item.id === "helm_crown") goldMultiplier += 0.10;
        if (item.id === "acc_necklace") goldMultiplier += 0.25;
        if (item.id === "armor_matrix") goldMultiplier += 0.08;
        if (item.id === "armor_gandus") goldMultiplier += 0.15;
      }
    });

    const finalExp = Math.round(expAmt * expMultiplier);
    const finalGold = Math.round(goldAmt * goldMultiplier);

    setProfile(prev => {
      let currentExp = prev.character.exp + finalExp;
      let currentLvl = prev.character.level;
      let nextExpLimit = prev.character.nextLevelExp;
      let evoStage = prev.character.evolutionStage;
      let currentAvatarName = prev.character.avatarName;
      let currentDesc = prev.character.description;

      let lvlUpHappened = false;
      let evolutionHappened = false;

      // Check level up loop
      while (currentExp >= nextExpLimit) {
        currentExp -= nextExpLimit;
        currentLvl += 1;
        nextExpLimit = Math.round(nextExpLimit * 1.35);
        lvlUpHappened = true;

        // Check evolution based on new level
        const evoStatus = getEvolutionStage(prev.character.type, currentLvl);
        if (evoStatus.stage > evoStage) {
          evoStage = evoStatus.stage;
          currentAvatarName = evoStatus.name;
          currentDesc = evoStatus.description;
          evolutionHappened = true;
        }
      }

      if (evolutionHappened) {
        setAlertMessage({
          title: "☄️ 파트너 몬스터 극적 진화 완료!",
          desc: `축하합니다! ${prev.character.avatarName}가 한계를 돌파해 레벨 ${currentLvl}에서 [${currentAvatarName}]로 진화했습니다! 더 강력하고 수려한 무기를 얻을 수 있어졌어요!`,
          icon: "🔥"
        });
      } else if (lvlUpHappened) {
        setAlertMessage({
          title: "✨ 용사단 레벨 업!",
          desc: `레벨 ${currentLvl}이 완성되었습니다! 성장을 기념해 보너스 전리품 상자(비법 상자)가 열렸습니다!`,
          icon: "⭐"
        });
      }

      return {
        ...prev,
        gold: prev.gold + finalGold,
        character: {
          ...prev.character,
          level: currentLvl,
          exp: currentExp,
          nextLevelExp: nextExpLimit,
          evolutionStage: evoStage,
          avatarName: currentAvatarName,
          description: currentDesc
        }
      };
    });

    setBattleFeedback(`${reason} (+${finalExp} XP / +${finalGold} G 획득!)`);
  };

  // --- SHOP BUY SYSTEM ---
  const handleBuyItem = (item: Equipment) => {
    if (profile.gold < item.goldPrice) {
      setAlertMessage({
        title: "골드가 부족해요!",
        desc: "수학 연산 전투에서 몬스터들을 격파하고 골드를 더 많이 수확해 상점에 방문해 주세요.",
        icon: "🪙"
      });
      return;
    }

    // Add to inventory
    setProfile(prev => {
      // Check if already bought
      if (prev.inventory.some(i => i.id === item.id)) {
        return prev;
      }
      return {
        ...prev,
        gold: prev.gold - item.goldPrice,
        inventory: [...prev.inventory, { ...item, equipped: false }]
      };
    });

    setAlertMessage({
      title: "장비 획득 완수!",
      desc: `[${item.name}] 장비를 성공적으로 제작/구매했습니다! 도구 보관함(무기고)에서 장착하면 고유 보너스가 발동됩니다.`,
      icon: "⚔️"
    });
  };

  // --- EQUIP / UNEQUIP SYSTEM ---
  const handleEquipToggle = (item: Equipment) => {
    setProfile(prev => {
      const updatedInv = prev.inventory.map(inv => {
        if (inv.id === item.id) {
          return { ...inv, equipped: !inv.equipped };
        }
        // If equipping a weapon, unequip previous equipped weapon, etc.
        if (inv.type === item.type && !inv.equipped && inv.id !== item.id) {
          return { ...inv, equipped: false };
        }
        return inv;
      });

      // Update equipped slots
      let equippedWeapon = prev.equippedWeapon;
      let equippedHelmet = prev.equippedHelmet;
      let equippedArmor = prev.equippedArmor;
      let equippedAccessory = prev.equippedAccessory;

      if (item.type === "weapon") {
        equippedWeapon = prev.equippedWeapon?.id === item.id ? null : item;
      } else if (item.type === "helmet") {
        equippedHelmet = prev.equippedHelmet?.id === item.id ? null : item;
      } else if (item.type === "armor") {
        equippedArmor = prev.equippedArmor?.id === item.id ? null : item;
      } else {
        equippedAccessory = prev.equippedAccessory?.id === item.id ? null : item;
      }

      return {
        ...prev,
        inventory: updatedInv,
        equippedWeapon,
        equippedHelmet,
        equippedArmor,
        equippedAccessory
      };
    });
  };

  // --- BATTLE MODE START ---
  const handleInitBattle = (stage: StageConfig) => {
    setSelectedStage(stage);
    setActiveTab("battle");

    // Spawn custom styled monster based on stage
    const monsterNames = {
      "stage-k7": { name: "모으기 뭉뭉 골렘", maxHp: 80, image: "🐶" },
      "stage-g1": { name: "보수 자칼 버그", maxHp: 110, image: "🐺" },
      "stage-g2": { name: "십자리 철갑 전차", maxHp: 150, image: "🛡️" },
      "stage-g3": { name: "대마도사 카이로스", maxHp: 200, image: "🧠" }
    };

    const cfg = monsterNames[stage.id as keyof typeof monsterNames] || { name: "훈련용 대칭 슬라임", maxHp: 100, image: "👾" };

    setBattleMonster({
      name: cfg.name,
      maxHp: cfg.maxHp,
      hp: cfg.maxHp,
      image: cfg.image,
      level: profile.character.level + (profile.difficultyRank === "지옥" ? 3 : profile.difficultyRank === "어려움" ? 1 : 0)
    });

    // Make first question
    const q = generateLocalQuestion(stage.ageGroup, profile.difficultyRank);
    setBattleQuiz(q);
    setAnsweredState({ selectedIdx: null, isCorrect: null });
    setBattleFeedback("");
  };

  // --- SUBMIT BATTLE ANSWER ---
  const handleBattleAnswer = (choiceIdx: number) => {
    if (answeredState.selectedIdx !== null || !battleQuiz) return; // Answer locked

    const isCorrect = choiceIdx === battleQuiz.correctIndex;
    setAnsweredState({ selectedIdx: choiceIdx, isCorrect });

    if (isCorrect) {
      // Correct! Attack monster
      const baseDmg = 34; // 3 hit kill roughly
      const doubleCrit = profile.stats.correctStreak >= 2;
      const dmg = Math.round(baseDmg * (doubleCrit ? 1.5 : 1));

      // Trigger visual damage feedback
      setFloatDamage({ show: true, amt: dmg, isHeal: false });
      setTimeout(() => setFloatDamage(prev => ({ ...prev, show: false })), 1000);

      // Deal HP damage
      setBattleMonster(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - dmg)
      }));

      // Update streaks
      const newStreak = profile.stats.correctStreak + 1;
      setBattleFeedback(doubleCrit ? "🔥 치명타 적중! 연속 정답 공격!" : "🎯 정확한 계산 공격!");

      setProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalSolved: prev.stats.totalSolved + 1,
          totalCorrect: prev.stats.totalCorrect + 1,
          correctStreak: newStreak
        }
      }));

      evalQuests("streak", newStreak);
      evalQuests("battle", 1);

      // Adaptive Difficulty Control (자동 난이도 조절):
      // If streak lands on multiples of 4, auto step up the difficulty
      if (newStreak >= 4 && profile.difficultyRank !== "지옥") {
        setProfile(prev => {
          const ranks: Array<"쉬움" | "보통" | "어려움" | "지옥"> = ["쉬움", "보통", "어려움", "지옥"];
          const currIdx = ranks.indexOf(prev.difficultyRank);
          const nextRank = ranks[Math.min(3, currIdx + 1)];
          if (nextRank !== prev.difficultyRank) {
            setTimeout(() => {
              setBattleFeedback(`✨ 연산 대폭발! 난이도가 '${nextRank}'으로 올라가 전리품 보너스 가중치가 커졌습니다!`);
            }, 600);
          }
          return { ...prev, difficultyRank: nextRank };
        });
      }

    } else {
      // Incorrect! Take hit or status alert
      const selfDmg = 20;
      setFloatDamage({ show: true, amt: selfDmg, isHeal: false });
      setTimeout(() => setFloatDamage(prev => ({ ...prev, show: false })), 1000);

      setBattleFeedback(`⚠️ 오답 발생! 원리를 다시 곱씹어 봐요.`);

      // Open Teacher Coach Modal
      setTeacherModalData({
        question: battleQuiz.question,
        explanation: battleQuiz.explanation,
        correctAnswerText: battleQuiz.choices[battleQuiz.correctIndex]
      });
      setTimeout(() => {
        setShowTeacherModal(true);
      }, 600);

      setProfile(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalSolved: prev.stats.totalSolved + 1,
          correctStreak: 0
        }
      }));

      evalQuests("streak", 0);
      evalQuests("battle", 1);

      // Dynamic Difficulty Helper (난이도 조절 하향):
      // Consecutive mistakes triggers fallback
      setProfile(prev => {
        if (prev.difficultyRank !== "쉬움") {
          const ranks: Array<"쉬움" | "보통" | "어려움" | "지옥"> = ["쉬움", "보통", "어려움", "지옥"];
          const currIdx = ranks.indexOf(prev.difficultyRank);
          const prevRank = ranks[Math.max(0, currIdx - 1)];
          setTimeout(() => {
            setBattleFeedback(`💡 눈높이 모드 활성화: 더 쉬운 연산 원리로 친절히 가이드 해드릴게요! (${prevRank})`);
          }, 800);
          return { ...prev, difficultyRank: prevRank };
        }
        return prev;
      });
    }
  };

  // --- GO TO NEXT QUESTION OR CLOSE BATTLE ---
  const handleNextBattleQuestion = () => {
    if (battleMonster.hp <= 0) {
      // Monster defeated! Award loot
      const goldReward = 40 + Math.floor(Math.random() * 25);
      const expReward = 50 + Math.floor(Math.random() * 20);

      // Small chance to find rare gear
      const luckyChance = Math.random() < 0.35;
      let bonusLoot: Equipment | null = null;
      if (luckyChance) {
        // Pick one at random from shop list
        const luckyItem = INITIAL_SHOP_ITEMS[Math.floor(Math.random() * INITIAL_SHOP_ITEMS.length)];
        // Check if user already has it
        if (!profile.inventory.some(i => i.id === luckyItem.id)) {
          bonusLoot = luckyItem;
          setProfile(prev => ({
            ...prev,
            inventory: [...prev.inventory, { ...luckyItem, equipped: false }]
          }));
        }
      }

      gainRewards(expReward, goldReward, "⚔️ 보스 몬스터 토벌 대성공!");

      if (bonusLoot) {
        setAlertMessage({
          title: "🎁 전설급 전리품 보물상자 발견!",
          desc: `전투 도중 굴러떨어진 [${bonusLoot.name}]를 습득했습니다! 수리 능력이 한층 강화됩니다!`,
          icon: "🦖"
        });
      }

      setProfile(prev => {
        const currentHigh = prev.stats.stageHighScores[selectedStage.id] || 0;
        return {
          ...prev,
          stats: {
            ...prev.stats,
            stageHighScores: {
              ...prev.stats.stageHighScores,
              [selectedStage.id]: currentHigh + 1
            }
          }
        };
      });

      setActiveTab("map");
      return;
    }

    // Set next question
    const q = generateLocalQuestion(selectedStage.ageGroup, profile.difficultyRank);
    setBattleQuiz(q);
    setAnsweredState({ selectedIdx: null, isCorrect: null });
    setBattleFeedback("");
  };

  // --- DYNAMIC AI THINKING QUIZ TRIGGER (GEMINI API) ---
  const handleFetchAiQuiz = async (stage: StageConfig) => {
    setSelectedStage(stage);
    setActiveTab("ai-quiz");
    setAiQuizLoading(true);
    setAiQuizError(null);
    setBattleQuiz(null);
    setAnsweredState({ selectedIdx: null, isCorrect: null });
    setBattleFeedback("");

    try {
      const res = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: stage.ageGroup,
          difficulty: profile.difficultyRank,
          theme: stage.theme
        })
      });

      const rootVal = await res.json();
      if (rootVal.success && rootVal.data) {
        setBattleQuiz({
          ...rootVal.data,
          isAiGenerated: true
        });
        setIsApiKeyAvailable(rootVal.apiKeyConfigured);
      } else {
        throw new Error(rootVal.error || "Failed to load generated quiz template");
      }
    } catch (e: any) {
      console.error(e);
      setAiQuizError("AI 원리 선생님과 통신하는 중 지연이 생겼어요. 안전한 fallback 원리셈 모험 퀴즈를 준비했습니다.");
      // Render fallback
      setBattleQuiz({
        question: `[AI 원리 왕국 모험] 아기 드래곤 불리가 사과 농장에서 빨간 사과를 수확하고 있어요! 처음엔 상자에 8개가 가득 차 있었는데, 숲속 친구가 딸기 5개를 한 광주리 더 선물해주었어요. 10의 보수를 넘는 사과 계산방식으로 구하면 총과일은 몇 개일까요?`,
        choices: ["11개", "12개", "13개", "14개"],
        correctIndex: 2,
        visualInstruction: "FRAME10_REGROUP_ADD:8:5:13:2:3:사과 10칸 모으기",
        explanation: "8은 10을 만들기 위해 2가 더 필요해요! 곱고 소중코롬 5에서 2를 가져와 선상자를 꽉 채우고(8+2=10), 나머지 3알이 낱개로 남으므로 '10 + 3 = 13'알이 된답니다!"
      });
    } finally {
      setAiQuizLoading(false);
    }
  };

  // --- SUBMIT AI ANSWER ---
  const handleAiQuizAnswer = (choiceIdx: number) => {
    if (answeredState.selectedIdx !== null || !battleQuiz) return;

    const isCorrect = choiceIdx === battleQuiz.correctIndex;
    setAnsweredState({ selectedIdx: choiceIdx, isCorrect });

    if (isCorrect) {
      // Huge reward
      const baseExp = 70;
      const baseGold = 50;
      gainRewards(baseExp, baseGold, "🧠 인공지능 창의 사고력 퀴즈 정답 달성!");
      setBattleFeedback("정답 대성공! AI 수학 마스터 자격을 입증했어요.");

      evalQuests("ai", 1);
    } else {
      setBattleFeedback("아쉽게 틀렸어요. 하지만 아래의 시각 교구 원리를 정독해보면 쉽게 마스터할 수 있답니다.");

      // Open Teacher Coach Modal
      setTeacherModalData({
        question: battleQuiz.question,
        explanation: battleQuiz.explanation,
        correctAnswerText: battleQuiz.choices[battleQuiz.correctIndex]
      });
      setTimeout(() => {
        setShowTeacherModal(true);
      }, 600);
    }
  };

  // --- PLAY SOUNDS / RESET (Local helpers) ---
  const handleLoginSuccess = (loadedProfile: UserProfile, loginId: string) => {
    setProfile(loadedProfile);
    setStudentId(loginId);
    setHasRegistered(true);
    localStorage.setItem("wonri_student_id", loginId);
    localStorage.setItem("wonri_math_registered", "true");
    setAlertMessage({
      title: "수학 원정대 결성 완료!",
      desc: `${loadedProfile.name} 대장님! ${loadedProfile.character.avatarName}와(과) 함께 수의 비밀을 파헤치며 수 연산 지도 모험을 떠납시다! 🔥`,
      icon: "🎉"
    });
  };

  const handleResetApp = () => {
    if (confirm("정말 처음부터 다시 모험을 쓰고 싶나요?\n모든 레벨, EXP, 장비가 소멸됩니다.")) {
      localStorage.clear();
      setProfile(INITIAL_PROFILE);
      setHasRegistered(false);
      setSetupName("");
      setStudentId("default_child");
      setAppsScriptUrl("");
      setActiveTab("map");
    }
  };

  const getNextAgeGroup = (curr: AgeGroup): AgeGroup | null => {
    if (curr === AgeGroup.K7) return AgeGroup.G1;
    if (curr === AgeGroup.G1) return AgeGroup.G2;
    if (curr === AgeGroup.G2) return AgeGroup.G3;
    return null;
  };

  const handleProgressStage = () => {
    const nextGroup = getNextAgeGroup(profile.ageGroup);
    if (nextGroup) {
      const nextStage = STAGES.find(s => s.ageGroup === nextGroup);
      if (nextStage) {
        setProfile(prev => {
          const updated = {
            ...prev,
            ageGroup: nextGroup,
            currentStageId: nextStage.id
          };
          localStorage.setItem("wonri_math_profile", JSON.stringify(updated));
          return updated;
        });

        setAlertMessage({
          title: "🎉 마스터 진급 완료!",
          desc: `축하합니다! 새로운 수학 영역인 '${nextGroup}' 모험이 활성화되었습니다!`,
          icon: "👑"
        });
      }
    }
  };

  return (
    <div id="app-root-container" className="min-h-screen bg-slate-50 text-slate-900 font-sans leading-relaxed selection:bg-rose-200">
      
      {/* BACKGROUND FLOATING MATH ELEMENTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none opacity-5 z-0">
        <div className="absolute top-10 left-10 text-9xl font-black">10</div>
        <div className="absolute bottom-20 right-10 text-9xl font-black">+</div>
        <div className="absolute top-1/3 right-1/4 text-9xl font-black">÷</div>
        <div className="absolute bottom-1/3 left-1/4 text-9xl font-black">×</div>
      </div>

      {/* FLOATING ACTION ALERTS SCREEN overlays */}
      <AnimatePresence>
        {alertMessage && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full border border-rose-100 flex flex-col items-center text-center"
            >
              <div className="text-5xl mb-4 bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center">{alertMessage.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{alertMessage.title}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{alertMessage.desc}</p>
              <button
                onClick={() => setAlertMessage(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 pr-2 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <span>즐겁게 계속하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- SETUP SCREEN (FIRST REGISTER) --- */}
      {!hasRegistered ? (
        <StudentLogin onLoginSuccess={handleLoginSuccess} initialProfile={INITIAL_PROFILE} />
      ) : (
        /* --- MAIN HUB APPLICATION SCENE --- */
        <div id="main-adventure-scene" className="max-w-6xl mx-auto px-4 py-6 relative z-10 flex flex-col min-h-screen">
          
          {/* TOP BAR / CHARACTER STATUS CONTAINER */}
          <header className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between mb-6">
            
            {/* Left: User Active Profile, Level and Exp bar */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Pet representation badge */}
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 border-4 border-amber-300 flex items-center justify-center text-4xl shadow-inner select-none hover:rotate-12 transition-transform cursor-pointer">
                  {profile.character.type === "fire" ? (
                    profile.character.level >= 12 ? "🐲" : profile.character.level >= 5 ? "🦖" : "🦕"
                  ) : profile.character.type === "water" ? (
                    profile.character.level >= 12 ? "🦭" : profile.character.level >= 5 ? "🦢" : "🦆"
                  ) : (
                    profile.character.level >= 12 ? "🐺" : profile.character.level >= 5 ? "🦊" : "🌱"
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-black text-xs px-2 py-0.5 rounded-full shadow border-2 border-white">
                  Lv.{profile.character.level}
                </div>
              </div>

              {/* Name / XP Progress bar */}
              <div className="flex-1 min-w-[140px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-slate-800 text-base">{profile.name}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded font-bold">
                    {profile.ageGroup}
                  </span>
                </div>
                <div className="text-xs text-rose-500 font-black mt-0.5">
                  {profile.character.avatarName}
                </div>

                {/* XP Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden border border-slate-200/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (profile.character.exp / profile.character.nextLevelExp) * 105)}%` }}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                  <span>EXP {profile.character.exp}/{profile.character.nextLevelExp}</span>
                  <span>{Math.round((profile.character.exp / profile.character.nextLevelExp) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Middle: Equipment stats indicators */}
            <div className="flex gap-2 items-center flex-wrap bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 w-full md:w-auto">
              <span className="text-[10px] font-black text-slate-400 mr-1 uppercase">장착 능력:</span>
              {[profile.equippedWeapon, profile.equippedHelmet, profile.equippedArmor, profile.equippedAccessory].some(i => i !== null) ? (
                <div className="flex gap-2.5">
                  {profile.equippedWeapon && (
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5"><Sword className="w-3.5 h-3.5 text-rose-500" /> +{profile.equippedWeapon.expBonus}% XP</span>
                  )}
                  {profile.equippedHelmet && (
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5"><Crown className="w-3.5 h-3.5 text-amber-500" /> 골드 상향</span>
                  )}
                  {profile.equippedArmor && (
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> 방어율 UP</span>
                  )}
                  {profile.equippedAccessory && (
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-0.5"><Infinity className="w-3.5 h-3.5 text-indigo-500" /> 가속 버프</span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-semibold italic">장착 없음 (상점/무기고)</span>
              )}
            </div>

            {/* Right: Currency indicator & Nav handles */}
            <div className="flex items-center gap-4 py-1.5 px-3 bg-amber-50 rounded-2xl border border-amber-200/60 w-full md:w-auto justify-between md:justify-start">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow shadow-amber-500/30">
                  <Coins className="w-4 h-4 text-amber-950 font-bold" />
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-amber-700 font-black">골드 코인</div>
                  <div className="text-sm font-black text-amber-950 leading-none">{profile.gold} G</div>
                </div>
              </div>
              <div className="w-px h-6 bg-amber-200" />
              <div className="text-center">
                <div className="text-[9px] text-slate-400 font-black">AI 난이도</div>
                <div className="text-xs font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mt-0.5">
                  {profile.difficultyRank}
                </div>
              </div>
            </div>
          </header>

          {/* INNER NAVIGATION NAVIGATION TABS */}
          <nav className="flex gap-2 p-1.5 bg-slate-200/50 backdrop-blur-sm rounded-2xl mb-6 items-center justify-around md:justify-start self-center md:self-start w-full md:w-auto text-xs font-bold flex-wrap">
            <button
               id="nav-tab-map"
               onClick={() => setActiveTab("map")}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                 activeTab === "map" || activeTab === "battle" || activeTab === "ai-quiz"
                   ? "bg-white text-slate-900 shadow-sm" 
                   : "text-slate-600 hover:text-slate-900"
               }`}
            >
              <Map className="w-4 h-4" />
              <span>연산 지도</span>
            </button>
            <button
               id="nav-tab-drill"
               onClick={() => setActiveTab("drill")}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                 activeTab === "drill" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
               }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>연산 드릴 (20문제)</span>
            </button>
            <button
               id="nav-tab-drill-five"
               onClick={() => setActiveTab("drill-five")}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                 activeTab === "drill-five" ? "bg-white text-slate-900 shadow-sm" : "text-slate-650 hover:text-slate-900"
               }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>일일 5퀴즈 미션</span>
            </button>
            <button
               id="nav-tab-shop"
               onClick={() => setActiveTab("shop")}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                 activeTab === "shop" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
               }`}
            >
              <ShoppingBag className="w-4 h-4 text-pink-500" />
              <span>무기 보관함 & 상점</span>
            </button>
            <button
               id="nav-tab-profile"
               onClick={() => setActiveTab("profile")}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                 activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
               }`}
            >
              <User className="w-4 h-4 text-indigo-500" />
              <span>마이 프로필</span>
            </button>
            <button
               id="nav-tab-mom"
               onClick={() => setActiveTab("mom")}
               className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                 activeTab === "mom" ? "bg-white text-slate-900 shadow-sm" : "text-slate-650 hover:text-slate-900"
               }`}
            >
              <Trophy className="w-4 h-4 text-rose-500" />
              <span>엄마 확인방</span>
            </button>
          </nav>

          {/* TAB CONTENTS RENDER SYSTEM */}
          <main className="flex-1 w-full">
            
            {/* --- TAB 1: ADVENTURE MAP MAP --- */}
            {activeTab === "map" && (
              <div id="tab-map-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left col: Area Navigator and Map Stage (2/3 width on large desktop) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Kids-Friendly Difficulty & Initializer Toolbar */}
                  <div className="bg-gradient-to-r from-pink-100 via-amber-50 to-indigo-100 rounded-3xl p-5 border-4 border-white shadow-md relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 pointer-events-none select-none">🦄</div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider block w-fit mb-1 shadow-sm">
                          모험 전투 난이도 요새 🏰
                        </span>
                        <h3 className="text-sm font-black text-slate-800">
                          꼬마 용사님의 수학 난이도를 골라보세요!
                        </h3>
                      </div>
                      
                      {/* Entire Progress Reset Option for Parents */}
                      <button
                        onClick={handleResetApp}
                        className="bg-white/80 hover:bg-white text-[11px] text-rose-500 font-extrabold px-3.5 py-1.5 rounded-xl border border-rose-200/50 transition-all flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer shadow-sm active:scale-95"
                      >
                        <span>🔄 모든 모험 초기화</span>
                      </button>
                    </div>

                    {/* Cute Difficulty Selector Buttons */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[
                        { key: "쉬움", icon: "👶", title: "어린이 쉬움", desc: "기본 세트 중심", color: "border-emerald-300 text-emerald-800 bg-emerald-50" },
                        { key: "보통", icon: "⚔️", title: "용사 보통", desc: "사고력 35% 출현", color: "border-amber-300 text-amber-800 bg-amber-50" },
                        { key: "어려움", icon: "🔥", title: "정예 어려움", desc: "사고력 70% 출현", color: "border-rose-300 text-rose-800 bg-rose-50" },
                        { key: "지옥", icon: "😈", title: "마법사 지옥", desc: "100% 사고력/심화", color: "border-purple-300 text-purple-800 bg-purple-50" }
                      ].map((lvl) => {
                        const isSelected = profile.difficultyRank === lvl.key;
                        return (
                          <button
                            key={lvl.key}
                            onClick={() => {
                              setProfile(prev => {
                                const updated = { ...prev, difficultyRank: lvl.key as "쉬움" | "보통" | "어려움" | "지옥" };
                                localStorage.setItem("wonri_math_profile", JSON.stringify(updated));
                                return updated;
                              });
                            }}
                            className={`p-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                              isSelected 
                                ? `${lvl.color} border-current ring-4 ring-offset-1 ring-current bg-white scale-[1.03] shadow` 
                                : "bg-white/50 border-slate-100 opacity-60 hover:opacity-100 hover:bg-white"
                            }`}
                          >
                            <span className="text-xl sm:text-2xl mb-1">{lvl.icon}</span>
                            <span className="text-[11px] font-black tracking-tight">{lvl.title}</span>
                            <span className="text-[8px] opacity-75 font-semibold text-slate-500 leading-none mt-0.5 hidden sm:block">{lvl.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* BRANCH A: WORLD MAP OVERVIEW SCREEN */}
                  {mapViewMode === "world" && (
                    <div className="bg-white rounded-3xl p-6 border-4 border-rose-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-400/5 to-amber-400/5 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="text-center max-w-md mx-auto mb-6">
                        <span className="text-3xl animate-bounce inline-block">🗺️</span>
                        <h2 className="text-xl font-black text-slate-800 mt-1">원리셈 수 연산 마법 월드맵</h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          잠겨있는 다른 단계는 이전 단계를 마스터(보스 3마리 격파 🏆)하면 자동으로 문이 열려 다음 장소로 여행을 떠날 수 있답니다!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {STAGES.map((s) => {
                          const unlocked = isWorldUnlocked(s.id, profile);
                          const score = profile.stats.stageHighScores[s.id] || 0;
                          
                          // Custom styling for cards based on step
                          const themeColor = s.id === "stage-k7" ? { border: "border-pink-200", bg: "bg-pink-50/50", accent: "pink" } 
                                           : s.id === "stage-g1" ? { border: "border-amber-200", bg: "bg-amber-50/50", accent: "amber" }
                                           : s.id === "stage-g2" ? { border: "border-emerald-200", bg: "bg-emerald-50/50", accent: "emerald" } 
                                           : { border: "border-sky-200", bg: "bg-sky-50/50", accent: "sky" };

                          return (
                            <div
                              key={s.id}
                              onClick={() => {
                                if (unlocked) {
                                  // Update the active user profile target first
                                  setProfile(prev => {
                                    const updated = { ...prev, ageGroup: s.ageGroup, currentStageId: s.id };
                                    localStorage.setItem("wonri_math_profile", JSON.stringify(updated));
                                    return updated;
                                  });
                                  setSelectedStage(s);
                                  setMapViewMode("stage");
                                } else {
                                  setAlertMessage({
                                    title: "🔒 굳게 밀봉된 마법 금고!",
                                    desc: `아직 이 월드로 갈 수 없어요! 이전 월드(${s.id === "stage-g1" ? "7세" : s.id === "stage-g2" ? "8세" : "9세"})의 보스 몬스터 3마리를 물리쳐 완벽히 마스터해주면 봉인이 풀려요!`,
                                    icon: "🧙‍♂️"
                                  });
                                }
                              }}
                              className={`p-5 rounded-2xl border-3 transition-all relative flex flex-col justify-between group cursor-pointer ${themeColor.border} ${themeColor.bg} ${
                                unlocked 
                                  ? "hover:border-slate-800 hover:scale-[1.02] hover:shadow" 
                                  : "opacity-75 bg-slate-50 border-slate-200"
                              }`}
                            >
                              {/* Sequence Badge / Lock Icon */}
                              <div className="flex justify-between items-center mb-2">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  unlocked ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                                }`}>
                                  {s.ageGroup} 월드
                                </span>
                                <div>
                                  {unlocked ? (
                                    <span className="text-emerald-505 font-black text-[11px] flex items-center gap-0.5 text-emerald-600">🔓 오픈됨</span>
                                  ) : (
                                    <span className="text-slate-400 font-bold text-[11px] flex items-center gap-0.5">🔒 봉인됨</span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h3 className="text-base font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                                  {s.title}
                                </h3>
                                <p className="text-xs text-slate-500 leading-snug line-clamp-2 min-h-8">
                                  {s.description}
                                </p>
                              </div>

                              {/* Progress status or unlock requirements */}
                              <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                                {unlocked ? (
                                  <>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-amber-600">
                                      <span>⭐ 격파 수:</span>
                                      <span className="text-slate-800 bg-amber-100 px-1.5 py-0.5 rounded-full">{score}/3 마리</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 group-hover:text-slate-700 font-extrabold flex items-center gap-0.5">
                                      모험가 영지 입장 👉
                                    </span>
                                  </>
                                ) : (
                                  <div className="text-[10px] text-rose-500 font-black flex items-center gap-1 bg-rose-50 px-2 py-1 rounded w-full">
                                    <span>⚠️ 해금 요건:</span>
                                    <span>이전 단계 보스 토벌 완수 (3마리 격파)</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* BRANCH B: SINGLE STAGE PLAY DETAIL PANEL */}
                  {mapViewMode === "stage" && (
                    <div className="bg-white rounded-3xl p-6 border-4 border-slate-100 shadow-sm">
                      {/* Back to world navigator breadcrumb button */}
                      <button
                        onClick={() => setMapViewMode("world")}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer mb-5 border border-slate-200"
                      >
                        <span>⬅️ 전체 월드지도 보러 가기 (단계 전환)</span>
                      </button>

                      <div className="border bg-slate-50/50 p-5 rounded-3xl border-slate-200/80 mb-6">
                        <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block select-none mb-1">
                          현재 진입한 전용 영역 🌋
                        </span>
                        <h2 className="text-lg font-black text-slate-900 leading-tight">
                          {selectedStage.ageGroup} 전용: {selectedStage.title}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {selectedStage.description}
                        </p>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {selectedStage.concepts.map((concept, cIdx) => (
                            <span key={cIdx} className="text-[10px] bg-white text-slate-600 font-extrabold px-2.5 py-1 border border-slate-200 rounded-lg">
                              🧩 {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Main action triggers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. Math block training tool */}
                        <div className="p-5 border-3 border-emerald-400 bg-emerald-50/10 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                          <span className="absolute -right-4 -bottom-4 text-7xl opacity-10 font-bold select-none text-emerald-400">🧮</span>
                          <div>
                            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">눈 학습 놀이</span>
                            <h3 className="text-base font-black text-slate-800 mt-2">개념 원리 교구 교실</h3>
                            <p className="text-xs text-slate-505 leading-relaxed mt-1.5 h-12">
                              10칸 상자 판, 동수누가 과일 묶기 등 재미있는 애니메이션 도구판을 보며 수학 원리를 눈으로 먼저 마스터하세요.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              // Seed sandbox values
                              if (selectedStage.id === "stage-k7") {
                                setSandboxVal1(7);
                                setSandboxVal2(3);
                              } else if (selectedStage.id === "stage-g1") {
                                setSandboxVal1(8);
                                setSandboxVal2(6);
                              } else {
                                setSandboxVal1(24);
                                setSandboxVal2(8);
                              }
                              setActiveTab("training");
                            }}
                            className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
                          >
                            <span>입실하기 🏫</span>
                          </button>
                        </div>

                        {/* 2. Monster battle stage */}
                        <div className="p-5 border-3 border-rose-450 bg-rose-50/10 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                          <span className="absolute -right-4 -bottom-4 text-7xl opacity-10 font-bold select-none text-rose-400">⚔️</span>
                          <div>
                            <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">전투 모드</span>
                            <h3 className="text-base font-black text-slate-800 mt-2">연산 보스 몬스터 격파</h3>
                            <p className="text-xs text-slate-505 leading-relaxed mt-1.5 h-12">
                              천종현수학 사고력 문제와 실전 수식을 연속으로 성공시켜 마법포를 쏘고 보스를 사냥해 격파해 보세요!
                            </p>
                          </div>
                          <button
                            onClick={() => handleInitBattle(selectedStage)}
                            className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95"
                          >
                            <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            <span>연산 전투 시작하기 ⚔️</span>
                          </button>
                        </div>
                      </div>

                      {/* AI Quiz block */}
                      <button
                        onClick={() => handleFetchAiQuiz(selectedStage)}
                        className="mt-4 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                        <span>AI 원리 융합 사고력 퀴즈 훈련 받기 🎓</span>
                      </button>

                      {/* Mastery Stage Progress & Promotion Card inside single block */}
                      {(() => {
                        const score = profile.stats.stageHighScores[selectedStage.id] || 0;
                        const hasNext = getNextAgeGroup(selectedStage.ageGroup) !== null;

                        return (
                          <div className="mt-8 border-t border-slate-100 pt-6">
                            <div className="flex items-center justify-between text-xs font-black mb-2">
                              <span className="text-slate-600 font-extrabold">🏆 현재 월드 구역 보스 마스터 달성률</span>
                              <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{score}/3 마리 격파</span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, (score / 3) * 100)}%` }}
                              />
                            </div>

                            {score >= 3 ? (
                              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md relative overflow-hidden">
                                <span className="absolute top-2.5 right-3 text-2xl select-none animate-pulse">👑</span>
                                <h4 className="text-sm font-black flex items-center gap-1.5 mb-1 leading-none">
                                  축하합니다! {selectedStage.ageGroup} 마스터 등극!
                                </h4>
                                <p className="text-[11px] leading-relaxed opacity-95 mt-1.5">
                                  모든 수식을 완파하여 격파한 보스가 3마리에 도달했습니다! 이제 봉인되어 전설 속 금고에 갇혀 있던 한 살 위의 마법 영역이 영원히 해금되어 플레이할 수 있게 됩니다!
                                </p>
                                
                                {hasNext ? (
                                  <button
                                    onClick={handleProgressStage}
                                    className="mt-4 w-full bg-white hover:bg-slate-50 text-orange-600 font-extrabold text-xs py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <span>식선마법 관문 해제 ({getNextAgeGroup(selectedStage.ageGroup)}) 🌟</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <div className="mt-4 bg-amber-950/20 p-3 rounded-xl text-center text-xs font-black">
                                    🎉 올클리어 마스터 완수! 초등 원리셈 전 과정을 격파하여 모든 단원을 정복했습니다!
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-4 p-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500 text-[11px] leading-relaxed font-bold">
                                💡 <strong>보스 토벌 목표:</strong> 배틀에서 몬스터를 {3 - score}번만 더 낚아 승리하면 완벽 학년 마스터가 완료되며, 다음 학년 모험 카드의 굳게 닫힌 봉인 자물쇠가 사르르 풀려 들어갈 수 있답니다!
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>

                {/* Right col: Daily Missions & Pet Card Showcase */}
                <div className="space-y-6">
                  
                  {/* Daily Quests Board */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" /> 오늘의 모험 지령 (일일 퀘스트)
                    </h3>
                    
                    <div className="space-y-3">
                      {quests.map((q) => (
                        <div 
                          key={q.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                            q.completed 
                              ? "bg-slate-55 bg-slate-50/50 border-slate-200 text-slate-400" 
                              : "bg-amber-50/20 border-amber-200/50 text-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-black leading-snug ${q.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                              {q.title}
                            </span>
                            {q.completed ? (
                              <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded leading-none">완료</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded leading-none">수행 중</span>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-[9px] text-slate-400 font-bold">
                              진행도: {q.currentCount} / {q.targetCount}
                            </div>
                            <div className="flex gap-1.5 text-[9px] font-black">
                              <span className="text-indigo-600">+{q.rewardExp}xp</span>
                              <span className="text-amber-600">+{q.rewardGold}G</span>
                            </div>
                          </div>

                          {/* Mini Progress bar */}
                          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                            <div 
                              style={{ width: `${(q.currentCount / q.targetCount) * 100}%` }}
                              className={`h-full ${q.completed ? "bg-emerald-500" : "bg-amber-500"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Adaptive difficulty quick toggle / explanatory box */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300 rounded-3xl p-6 shadow-md border border-slate-800">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">
                      인공지능 난이도 케어 시스템
                    </h4>
                    <h3 className="text-sm font-black text-white mb-2">실력 맞춤형 자동 연산 엔진</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                      연속 정답을 맞출수록 난이도가 자동으로 향상되어 경험치 배율이 최대 <strong className="text-amber-300">2배</strong>까지 증가합니다. 연달아 한 문제를 실수하면 용기 도우미가 나타나 개념 원리 힌트와 함께 더 부드러운 문제로 자연스럽게 낮춰줍니다.
                    </p>
                    <div className="flex items-center justify-between text-[10px] bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="font-bold text-slate-400">나의 현재 탐험 난이도 가중치:</span>
                      <strong className="text-white font-black text-xs">
                        {profile.difficultyRank === "지옥" ? "🔥 지옥 (XP x1.5)" : profile.difficultyRank === "어려움" ? "⚡ 어려움 (XP x1.25)" : profile.difficultyRank === "보통" ? "🛡️ 보통 (XP x1.0)" : "🌱 쉬움 (XP x0.85)"}
                      </strong>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* --- TAB 2: SHOP / ARMORY --- */}
            {activeTab === "shop" && (
              <div id="tab-shop-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Armory (Active inventory and equips) - Left 1/3 */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-800 mb-1 flex items-center gap-1.5">
                      <Sword className="w-4 h-4 text-slate-600" /> 수리 무기고 (보관함)
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      상점 또는 사냥에서 획득한 비법 가죽, 장비를 장착할 수 있는 전용 마법 무기고입니다.
                    </p>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {profile.inventory.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <span className="text-slate-400 text-xs italic">보관 중인 장비가 없습니다.<br />아래의 용사 상점에서 마법 검을 구매해보세요!</span>
                        </div>
                      ) : (
                        profile.inventory.map((item) => (
                          <div 
                            key={item.id}
                            className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                              item.equipped 
                                ? "bg-indigo-50/50 border-indigo-400" 
                                : "bg-slate-50/50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Icon placeholder simulating gear */}
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${item.color}`}>
                                {item.name.substring(0, 2)}
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-800 flex items-center gap-1 leading-snug">
                                  {item.name}
                                  {item.grade === "EPIC" && <span className="bg-purple-150 text-purple-700 text-[7px] font-black px-1 rounded">에픽</span>}
                                  {item.grade === "LEGENDARY" && <span className="bg-red-150 text-red-700 text-[7px] font-black px-1 rounded animate-pulse">레전더리</span>}
                                </h4>
                                <span className="text-[10px] text-slate-500">{item.statDescription}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleEquipToggle(item)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                                item.equipped 
                                  ? "bg-slate-900 text-white hover:bg-slate-800" 
                                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                              }`}
                            >
                              {item.equipped ? "해제" : "장착"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <span className="text-[10px] font-extrabold text-indigo-500 uppercase flex items-center gap-1">
                      💡 원리셈 비법 안내
                    </span>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                      무력 무장 보너스로 획득한 경험치 추가 능력은 미션을 정복할 때마다 파트너의 초고속 성장을 실현시켜 진화 기준을 앞당겨 줍니다.
                    </p>
                  </div>
                </div>

                {/* Hero shop (Items for sale) - Right 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5 leading-snug">
                        <ShoppingBag className="w-5 h-5 text-pink-500" /> 수리 연산 백물 상점
                      </h3>
                      <p className="text-xs text-slate-500">
                        수집한 골드(G)를 활용해 귀엽고 대단히 위력적인 장비들을 구비할 수 있습니다!
                      </p>
                    </div>
                    <span className="bg-amber-100 text-amber-950 font-black text-xs px-3 py-1 rounded-full">
                      보유 골드: {profile.gold} G
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INITIAL_SHOP_ITEMS.map((item) => {
                      const alreadyOwned = profile.inventory.some(i => i.id === item.id);
                      return (
                        <div 
                          key={item.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            alreadyOwned 
                              ? "bg-slate-50 border-slate-100 opacity-60" 
                              : "bg-gradient-to-br from-white to-slate-50/50 border-slate-100 hover:border-slate-350 shadow-sm"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-black text-slate-800">{item.name}</span>
                                <span className={`text-[7px] font-black px-1.5 py-0.2 rounded uppercase ${
                                  item.grade === "LEGENDARY" 
                                    ? "bg-red-50 text-red-600 border border-red-200" 
                                    : item.grade === "EPIC" 
                                    ? "bg-purple-50 text-purple-600 border border-purple-200" 
                                    : item.grade === "RARE" 
                                    ? "bg-blue-50 text-blue-600 border border-blue-250" 
                                    : "bg-slate-50 text-slate-500 border border-slate-200"
                                }`}>
                                  {item.grade}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">{item.statDescription}</p>
                            </div>
                            {/* Visual dummy icon simulation */}
                            <span className="text-2xl pt-1">
                              {item.type === "weapon" ? "⚔️" : item.type === "helmet" ? "🪖" : item.type === "armor" ? "🛡️" : "📗"}
                            </span>
                          </div>

                          <div className="mt-4 border-t border-slate-100/60 pt-3 flex items-center justify-between">
                            <span className="text-xs font-black text-amber-700">{item.goldPrice} G</span>
                            {alreadyOwned ? (
                              <span className="text-[10px] font-bold text-slate-400 italic">이미 보유함</span>
                            ) : (
                              <button
                                onClick={() => handleBuyItem(item)}
                                className="bg-amber-400 hover:bg-amber-500 text-amber-950 text-[10px] font-black px-3 py-1.5 rounded-xl transition-all shadow-sm"
                              >
                                구매하기
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* --- TAB 3: USER PROFILE TAB --- */}
            {activeTab === "profile" && (
              <div id="tab-profile-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left card: Statistics display */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-800 mb-1 flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-indigo-500" /> 수리 연산 모험 지표 (성적표)
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      이곳은 우리 아기가 그간 모험을 돌며 획득한 올바른 산수 정답률과 실전 전투 기록입니다.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Metric 1 */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 text-center">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">총격파 수식 수</span>
                        <div className="text-2xl font-black text-slate-800 mt-1">{profile.stats.totalSolved}회</div>
                      </div>

                      {/* Metric 2 */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 text-center">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">정확한 연산 정답</span>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{profile.stats.totalCorrect}회</div>
                      </div>

                      {/* Metric 3 */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 text-center col-span-2 md:col-span-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">현재 달성 정확도</span>
                        <div className="text-2xl font-black text-indigo-600 mt-1">
                          {profile.stats.totalSolved > 0 
                            ? `${Math.round((profile.stats.totalCorrect / profile.stats.totalSolved) * 100)}%` 
                            : "0%"}
                        </div>
                      </div>
                    </div>

                    {/* High scores on stages grid */}
                    <div className="mt-8">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">탐험 지역별 정복 성과 (몬스터 처치 기록)</h4>
                      <div className="space-y-2">
                        {STAGES.map(s => {
                          const count = profile.stats.stageHighScores[s.id] || 0;
                          return (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                              <span className="text-xs font-extrabold text-slate-700">{s.title}</span>
                              <strong className="text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full">{count}마리 처단</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Settings section */}
                  <div className="border-t border-slate-250 pt-6 mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="text-center md:text-left">
                      <h4 className="text-xs font-black text-rose-600 leading-snug">모험 리셋 시스템</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">실력 수준을 다시 판단하기 위해 모든 계정 역사를 파기 후 처음부터 다시 등록합니다.</p>
                    </div>
                    <button
                      onClick={handleResetApp}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-extrabold rounded-xl transition-all"
                    >
                      모험 데이터 초기화
                    </button>
                  </div>
                </div>

                {/* Right card: Pet avatar showcase details */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 bg-amber-100 text-amber-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                    진화 등급: {profile.character.evolutionStage}단
                  </div>

                  <span className="text-7xl my-8 select-none animate-bounce">
                    {profile.character.type === "fire" ? (
                      profile.character.level >= 12 ? "🐲" : profile.character.level >= 5 ? "🦖" : "🦕"
                    ) : profile.character.type === "water" ? (
                      profile.character.level >= 12 ? "🦭" : profile.character.level >= 5 ? "🦢" : "🦆"
                    ) : (
                      profile.character.level >= 12 ? "🐺" : profile.character.level >= 5 ? "🦊" : "🌱"
                    )}
                  </span>

                  <h3 className="text-lg font-black text-slate-800 mt-2">{profile.character.avatarName}</h3>
                  <span className="text-xs text-rose-500 font-extrabold bg-rose-50 px-3 py-0.5 border border-rose-100 rounded-full mt-1.5 uppercase tracking-widest">
                    {profile.character.type === "fire" ? "화염 속성" : profile.character.type === "water" ? "빙하수 속성" : "잎새숲 속성"}
                  </span>

                  <p className="text-xs text-slate-500 leading-relaxed mt-4 max-w-[240px] italic">
                    {profile.character.description}
                  </p>

                  {/* Level rules visual guidance */}
                  <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-150/50 mt-8 text-left text-[11px] text-slate-500 space-y-2">
                    <h5 className="font-bold text-slate-700">진화 성장 로드맵:</h5>
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right font-black text-slate-400 text-[10px]">Lv.1</span>
                      <span className="text-slate-600">아기 펫 형태로 연산 모험을 시작해요.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right font-black text-amber-500 text-[10px]">Lv.5</span>
                      <span className="text-amber-800 font-medium">중간 용사 전사로 강력해져요 (2단계 진화).</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right font-black text-rose-500 text-[10px]">Lv.12</span>
                      <span className="text-rose-800 font-bold">궁극의 대수학 황제로 완성됩니다! (3단계 진화).</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* --- TAB 4: CONCEPT TRAINING / SANDBOX --- */}
            {activeTab === "training" && (
              <div id="tab-training-root" className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                
                {/* Header Training Info */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] text-pink-500 font-extrabold tracking-wider uppercase bg-pink-50 border border-pink-100 px-2 rounded-full py-0.2">CONCEPT TRAINING SANDBOX</span>
                    <h2 className="text-lg font-black text-slate-800 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-5 h-5 text-pink-500" /> [원리 마스터] {selectedStage.title} - 교구 수련장
                    </h2>
                    <p className="text-xs text-slate-500">
                      수식을 직접 바꾸며 어떤 원리로 연산이 채워지고 가라지는지 시각적으로 목격해봐요!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("map")}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    ← 뒤로 돌아가기
                  </button>
                </div>

                {/* Core sandbox visual interface */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Left: Input sliders controlling concepts */}
                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-150">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      ⚙️ 수치 조절 다이얼
                    </h3>
                    
                    {/* Val 1 controller */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                        <span>첫 번째 붉은 알 개수:</span>
                        <strong className="text-rose-500 font-black text-sm">{sandboxVal1}</strong>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <button
                          onClick={() => setSandboxVal1(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 bg-white border border-slate-250 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                        <input
                          type="range"
                          min={1}
                          max={selectedStage.id === "stage-k7" ? 9 : 15}
                          value={sandboxVal1}
                          onChange={(e) => setSandboxVal1(parseInt(e.target.value))}
                          className="flex-1 accent-rose-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <button
                          onClick={() => setSandboxVal1(prev => Math.min(selectedStage.id === "stage-k7" ? 9 : 15, prev + 1))}
                          className="w-10 h-10 bg-white border border-slate-250 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Val 2 controller */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                        <span>두 번째 푸른 알 개수:</span>
                        <strong className="text-blue-500 font-black text-sm">{sandboxVal2}</strong>
                      </div>
                      <div className="flex gap-2.5 items-center">
                        <button
                          onClick={() => setSandboxVal2(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 bg-white border border-slate-250 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                        <input
                          type="range"
                          min={1}
                          max={9}
                          value={sandboxVal2}
                          onChange={(e) => setSandboxVal2(parseInt(e.target.value))}
                          className="flex-1 accent-blue-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                        />
                        <button
                          onClick={() => setSandboxVal2(prev => Math.min(9, prev + 1))}
                          className="w-10 h-10 bg-white border border-slate-250 rounded-xl hover:bg-slate-100 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>

                    {/* Formula Summary display */}
                    <div className="bg-white p-4 rounded-xl text-center border border-slate-200">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">원리 개념 수식</div>
                      <div className="text-xl font-black text-slate-800 mt-1 flex items-center justify-center gap-2">
                        {selectedStage.id === "stage-k7" ? (
                          <>
                            <span>{sandboxVal1} + {sandboxVal2} = {sandboxVal1 + sandboxVal2}</span>
                            <span className="text-xs text-rose-500 font-bold">({sandboxVal1}을 가르고 모으기)</span>
                          </>
                        ) : selectedStage.id === "stage-g1" ? (
                          <>
                            <span>{sandboxVal1} + {sandboxVal2} = {sandboxVal1 + sandboxVal2}</span>
                            <span className="text-xs text-amber-500 font-bold">(10의 보수 빌려오기)</span>
                          </>
                        ) : selectedStage.id === "stage-g2" ? (
                          <>
                            <span>{sandboxVal1} × {sandboxVal2} = {sandboxVal1 * sandboxVal2}</span>
                            <span className="text-xs text-emerald-500 font-bold">({sandboxVal1}개씩 {sandboxVal2}번 더하기)</span>
                          </>
                        ) : (
                          <>
                            <span>{sandboxVal1} ÷ {sandboxVal2} = {Math.floor(sandboxVal1 / sandboxVal2)}</span>
                            <span className="text-xs text-sky-500 font-bold">({sandboxVal2}개씩 묶어 담기)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Dynamic Visualizer Rendering based on type */}
                  <div className="flex justify-center">
                    {selectedStage.id === "stage-k7" && (
                      <div className="space-y-4 w-full max-w-sm">
                        <MathVisualizer instruction={`BOND_SPLIT:${sandboxVal1 + sandboxVal2}:${sandboxVal1}:${sandboxVal2}:교구 가르기`} />
                        <MathVisualizer instruction={`COUNTER_ADD:${sandboxVal1}:${sandboxVal2}:${sandboxVal1 + sandboxVal2}:바둑돌 낱개셈 더하기`} />
                      </div>
                    )}
                    {selectedStage.id === "stage-g1" && (
                      <div className="space-y-4 w-full max-w-sm">
                        <MathVisualizer instruction={`FRAME10_REGROUP_ADD:${sandboxVal1}:${sandboxVal2}:${sandboxVal1 + sandboxVal2}:${Math.max(0, 10 - sandboxVal1)}:${Math.max(0, sandboxVal2 - (10 - sandboxVal1))}:보수 채우기`} />
                        <MathVisualizer instruction={`FRAME10_COMP:${sandboxVal1}:${Math.max(0, 10 - sandboxVal1)}`} />
                      </div>
                    )}
                    {selectedStage.id === "stage-g2" && (
                      <div className="space-y-4 w-full max-w-sm">
                        <MathVisualizer instruction={`GRID_MULT:${sandboxVal1}:${sandboxVal2}:${sandboxVal1 * sandboxVal2}`} />
                        <MathVisualizer instruction={`BASE10_ADD:${sandboxVal1}:${sandboxVal2}:${sandboxVal1 + sandboxVal2}`} />
                      </div>
                    )}
                    {selectedStage.id === "stage-g3" && (
                      <div className="space-y-4 w-full max-w-sm">
                        <MathVisualizer instruction={`SHARE_PLATE:${sandboxVal1}:${sandboxVal2}:${Math.floor(sandboxVal1 / sandboxVal2)}`} />
                        <MathVisualizer instruction={`FRACTION_CIRCLE:${sandboxVal2 - 1}:${sandboxVal2}`} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Training summary bottom note */}
                <div className="mt-8 bg-pink-50/40 p-5 rounded-2xl border border-pink-100 flex gap-4">
                  <div className="text-2xl mt-1">🧠</div>
                  <div>
                    <h4 className="text-sm font-black text-pink-700">천종현 원리셈만의 놀라운 직관 암산 교육법</h4>
                    <p className="text-xs text-pink-900 leading-relaxed mt-1">
                      손가락으로 단순히 하나둘씩 세어 나가는 덧셈은 큰 숫자를 풀 때 금방 막히게 됩니다. 10의 묶음 프레임이나, 갈라지는 가방 개념을 주춧돌로 삼으면 받아올림이 있는 대형 암산 문제도 단 몇 초 만에 수식 공간을 머릿속으로 그려내며 스스로 풀어나갈 수 있는 수학적 체력이 다집니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB 4.1: BATTLE SCENE OVERLAY --- */}
            {activeTab === "battle" && battleQuiz && (
              <div id="battle-scene-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Battle Stage UI - Left 2/3 */}
                <div className="lg:col-span-2 bg-gradient-to-br from-rose-50/20 via-white to-sky-50/20 rounded-3xl p-6 border border-slate-150/70 shadow-sm flex flex-col justify-between min-h-[500px]">
                  
                  {/* Top: Fight panel depicting dragon and boss */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    {/* Your Character status */}
                    <div className="flex items-center gap-2.5">
                      <div className="text-3xl animate-pulse">
                        {profile.character.type === "fire" ? "🦕" : profile.character.type === "water" ? "🦆" : "🌱"}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-rose-600 leading-snug">{profile.character.avatarName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold">LV.{profile.character.level} 아군 수호신</span>
                      </div>
                    </div>

                    {/* VS divider */}
                    <span className="font-black text-slate-300 tracking-widest text-sm uppercase">VS</span>

                    {/* Enemy Monster Status */}
                    <div className="flex items-center gap-2.5 text-right flex-row-reverse">
                      <div className="text-4xl hover:scale-110 transition-transform cursor-crosshair">
                        {battleMonster.image}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 leading-snug">{battleMonster.name}</h4>
                        <span className="text-[10px] text-red-500 font-bold">LV.{battleMonster.level} 마수</span>
                      </div>
                    </div>
                  </div>

                  {/* HP Health bars showcase */}
                  <div className="my-5 w-full flex gap-6 items-center flex-col md:flex-row">
                    {/* Player (dummy/active) shield representation or streak bubble */}
                    <div className="w-full flex-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>콤보 스트릭:</span>
                        <span className="text-orange-500 font-black">{profile.stats.correctStreak}연속</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border">
                        <div 
                          style={{ width: `${Math.min(100, (profile.stats.correctStreak % 4) * 25)}%` }} 
                          className="bg-amber-400 h-full rounded-full" 
                        />
                      </div>
                    </div>

                    {/* Enemy Boss HP */}
                    <div className="w-full flex-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>몬스터 체력:</span>
                        <span className="text-red-500 font-black">{battleMonster.hp} / {battleMonster.maxHp} HP</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border">
                        <div 
                          style={{ width: `${(battleMonster.hp / battleMonster.maxHp) * 100}%` }} 
                          className="bg-red-500 h-full rounded-full transition-all duration-300" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Float feedback indicator */}
                  <div className="h-2 flex justify-center">
                    {battleFeedback && (
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-150 animate-bounce">
                        {battleFeedback}
                      </span>
                    )}
                  </div>

                  {/* Battle question contents */}
                  <div className="bg-slate-50 border p-5 rounded-2xl my-5 text-center flex-1 flex flex-col justify-center min-h-[140px] relative">
                    {/* Float Damage animations */}
                    <AnimatePresence>
                      {floatDamage.show && (
                        <motion.div
                          initial={{ scale: 0.5, y: 10, opacity: 0 }}
                          animate={{ scale: 1.2, y: -40, opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                        >
                          <span className="text-4xl font-black text-red-500 bg-white/95 px-4 py-2 rounded-2xl shadow-xl border border-red-200">
                            💥 -{floatDamage.amt} HP
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-xl md:text-2xl font-black text-slate-900 leading-relaxed whitespace-pre-wrap max-w-2xl mx-auto">
                      {battleQuiz.question}
                    </p>
                  </div>

                  {/* Multiple Choice grids */}
                  <div className="grid grid-cols-2 gap-4">
                    {battleQuiz.choices.map((choice, cIdx) => {
                      const isSelected = answeredState.selectedIdx === cIdx;
                      const isCorrectAnswer = cIdx === battleQuiz.correctIndex;
                      
                      let btnStyle = "bg-white border-slate-200 hover:border-slate-350 text-slate-800 hover:scale-[1.01]";
                      if (answeredState.selectedIdx !== null) {
                        if (isCorrectAnswer) {
                          btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500 text-white border-rose-600";
                        } else {
                          btnStyle = "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={cIdx}
                          disabled={answeredState.selectedIdx !== null}
                          onClick={() => handleBattleAnswer(cIdx)}
                          className={`py-5 px-4 text-base md:text-xl font-black rounded-3xl border-3 transition-all leading-snug flex items-center justify-center gap-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] ${btnStyle} hover:scale-[1.03] active:scale-95 duration-100`}
                        >
                          <span>{choice}</span>
                          {answeredState.selectedIdx !== null && isCorrectAnswer && <Check className="w-5 h-5 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom next buttons */}
                  {answeredState.selectedIdx !== null && (
                    <div className="mt-5 border-t border-slate-100 pt-4 flex gap-3 items-center">
                      {/* Explanatory bubble toggle */}
                      <p className="text-xs text-slate-500 leading-relaxed flex-1 italic">
                        {battleQuiz.explanation}
                      </p>
                      <button
                        onClick={handleNextBattleQuestion}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-xl text-xs shadow-sm flex items-center gap-1 shrink-0"
                      >
                        <span>{battleMonster.hp <= 0 ? "전투 종료 (전리품 수확)" : "다음 연산 단계 던전으로"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Training Tools on the Side during Battle */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                      🛡️ 실전 전술 도구 (시각적 개념 힌트)
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      머릿속으로 가르기 짝꿍, 또는 십칸 상자가 어떻게 세워져 있는지 연산 원리를 보조하는 교구입니다:
                    </p>

                    <div className="my-2 select-none">
                      <MathVisualizer instruction={battleQuiz.visualInstruction} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">연산 지혜 비법:</span>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed mt-1">
                      정답을 연달아 맞출 때 오르는 콤보 스트릭은 연산 위력을 치성시킬 뿐 아니라, 상점에서 대우받는 특별한 골드 코인 보너스 수확량을 증폭시켜 기쁨을 줍니다.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* --- TAB 4.2: AI DYNAMIC STORY QUIZ (GEMINI POWERED) --- */}
            {activeTab === "ai-quiz" && (
              <div id="ai-quiz-scene-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* AI Interactive Panel - Left 2/3 */}
                <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 rounded-3xl p-6 border border-indigo-100 shadow-sm flex flex-col justify-between min-h-[500px]">
                  
                  {/* Top: AI tutor branding header */}
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-base font-black">
                        AI
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-indigo-700 leading-snug">AI 융합 사고력 숲속 오두막</h4>
                        <span className="text-[10px] text-slate-400 font-bold">인공지능 수학 선생님</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("map")}
                      className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      ← 탐험지도로 이탈
                    </button>
                  </div>

                  {/* Center Loading, error states, or generated questions display */}
                  {aiQuizLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20">
                      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                      <h4 className="text-sm font-black text-indigo-800">원리 마법 문제 다발 수합 중...</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-[280px] text-center">
                        아이의 기존 속도와 오밀조밀 정확도를 측정해 가장 맞춤식의 융합사고력 문제를 인공지능이 서술하고 있습니다.
                      </p>
                    </div>
                  ) : aiQuizError && !battleQuiz ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                      <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
                      <h4 className="text-sm font-bold text-slate-800">AI 통신 상태 불완전</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">{aiQuizError}</p>
                    </div>
                  ) : battleQuiz ? (
                    <div className="flex-1 flex flex-col justify-between">
                      
                      {/* Interactive Feedback banner */}
                      <div className="h-1 flex justify-center my-1">
                        {battleFeedback && (
                          <span className="text-[11px] font-black text-indigo-700 bg-indigo-50 px-3 py-1 border border-indigo-150 rounded-full animate-bounce">
                            {battleFeedback}
                          </span>
                        )}
                      </div>

                      {/* Generative Story Question Block */}
                      <div className="bg-white/80 border border-indigo-100 shadow-inner p-6 rounded-2xl my-4 text-center">
                        {battleQuiz.isAiGenerated && (
                          <span className="bg-indigo-100 text-indigo-700 text-[8px] font-black px-2 py-0.5 rounded uppercase inline-block mb-3">
                            Google Gemini AI 스마트 창작 문제
                          </span>
                        )}
                        <p className="text-sm font-extrabold text-slate-800 leading-relaxed max-w-xl mx-auto whitespace-pre-wrap">
                          {battleQuiz.question}
                        </p>
                      </div>

                      {/* Choices Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {battleQuiz.choices.map((choice, cIdx) => {
                          const isSelected = answeredState.selectedIdx === cIdx;
                          const isCorrectAnswer = cIdx === battleQuiz.correctIndex;

                          let btnStyle = "bg-white border-slate-200 hover:border-slate-350 text-slate-800 hover:scale-[1.01]";
                          if (answeredState.selectedIdx !== null) {
                            if (isCorrectAnswer) {
                              btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-sm";
                            } else if (isSelected) {
                              btnStyle = "bg-rose-500 text-white border-rose-600";
                            } else {
                              btnStyle = "bg-slate-150 border-slate-200 text-slate-400 cursor-not-allowed";
                            }
                          }

                          return (
                            <button
                              key={cIdx}
                              disabled={answeredState.selectedIdx !== null}
                              onClick={() => handleAiQuizAnswer(cIdx)}
                              className={`p-4 text-sm font-black rounded-2xl border-2 transition-all flex items-center justify-center gap-1.5 ${btnStyle}`}
                            >
                              <span>{choice}</span>
                              {answeredState.selectedIdx !== null && isCorrectAnswer && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation and navigation controls block */}
                      {answeredState.selectedIdx !== null && (
                        <div className="border-t border-indigo-100 pt-4 flex flex-col md:flex-row gap-4 items-center">
                          <p className="text-xs text-slate-500 leading-relaxed flex-1">
                            <strong>원리 이해식 해설:</strong> {battleQuiz.explanation}
                          </p>
                          <button
                            onClick={() => handleFetchAiQuiz(selectedStage)}
                            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1 shrink-0"
                          >
                            <span>새로운 AI 문제 정복하러 가기</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                    </div>
                  ) : null}

                </div>

                {/* AI Visual Assistant On the Right sidebar */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-1">
                      🧠 원리 해독 매직 힌트 (시각 교구)
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                      AI 선생님이 머릿속 수의 결합을 도출하기 위해 제시하는 맞춤 시각 보조 도구입니다.
                    </p>

                    {battleQuiz && (
                      <div className="my-2 select-none">
                        <MathVisualizer instruction={battleQuiz.visualInstruction} />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 leading-relaxed">
                    {!isApiKeyAvailable && (
                      <span className="text-orange-600 font-extrabold block mb-1">
                        ※ 현재 AI 스마트 발상이 기본 로컬 모드로 동작 중입니다. (비서 키 설정 후 스마트 생성 활성화!)
                      </span>
                    )}
                    <span className="font-extrabold uppercase block mt-1">AI 융합 교육론</span>
                    천종현수학원리 원리셈 교육과정의 '원리와 응용 가르기' 방식과 초장밀 스토리텔링 모형을 학습시켜, 아이들이 단순 반복 인쇄물 지면을 대할 때보다 최대 지적 호기심을 발산시킵니다.
                  </div>
                </div>

              </div>
            )}

            {activeTab === "drill" && (
              <DailyDrill 
                profile={profile}
                studentId={studentId}
                onBackToHome={() => setActiveTab("map")}
                onUpdateProfile={(updated) => setProfile(updated)}
                appsScriptUrl={appsScriptUrl}
              />
            )}

            {activeTab === "drill-five" && (
              <DailyFiveQuiz 
                profile={profile}
                studentId={studentId}
                onBackToHome={() => setActiveTab("map")}
                onUpdateProfile={(updated) => setProfile(updated)}
                appsScriptUrl={appsScriptUrl}
              />
            )}

            {activeTab === "mom" && (
              <MomsDashboard 
                profile={profile}
                studentId={studentId}
                onBackToHome={() => setActiveTab("map")}
                appsScriptUrl={appsScriptUrl}
                onResetAllProgress={handleResetApp}
                onUpdateAppsScriptUrl={(url) => {
                  setAppsScriptUrl(url);
                  localStorage.setItem("wonri_apps_script_url", url);
                }}
              />
            )}

          </main>

          {/* BOTTOM COPYRIGHT / FOOTER FOOTER */}
          <footer className="mt-12 mb-6 border-t border-slate-200/60 pt-6 flex flex-col md:flex-row items-center justify-between text-[10.5px] text-slate-400 gap-4">
            <span className="font-medium">원리셈 수학 원정대 © 2026. Designed with Chun Jong-Hyun Math Principles.</span>
            <div className="flex gap-4 font-bold">
              <span>연산 자동 분석 눈높이</span>
              <span>•</span>
              <span>스토리 마법 RPG 진화 수련</span>
            </div>
          </footer>

        </div>
      )}

    </div>
  );
}
