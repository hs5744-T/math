/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AgeGroup {
  K7 = "7세 (예비초)",
  G1 = "8세 (초1)",
  G2 = "9세 (초2)",
  G3 = "10세 (초3)"
}

export interface Equipment {
  id: string;
  name: string;
  type: "weapon" | "helmet" | "armor" | "accessory";
  grade: "NORMAL" | "RARE" | "EPIC" | "LEGENDARY";
  statDescription: string;
  goldPrice: number;
  expBonus: number; // Experience multiplier or direct boost
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  equipped: boolean;
}

export interface CharacterState {
  id: string;
  name: string;
  type: "fire" | "water" | "leaf";
  level: number;
  exp: number;
  nextLevelExp: number;
  evolutionStage: number; // 1, 2, or 3
  avatarName: string; // Current name of character
  description: string;
}

export interface UserStats {
  correctStreak: number;
  totalSolved: number;
  totalCorrect: number;
  stageHighScores: { [key: string]: number };
  dailyQuizzesSolved: number;
  lastPlayedDate: string;
}

export interface UserProfile {
  name: string;
  ageGroup: AgeGroup;
  gold: number;
  character: CharacterState;
  inventory: Equipment[];
  equippedWeapon: Equipment | null;
  equippedHelmet: Equipment | null;
  equippedArmor: Equipment | null;
  equippedAccessory: Equipment | null;
  currentStageId: string;
  difficultyRank: "쉬움" | "보통" | "어려움" | "지옥";
  stats: UserStats;
}

export interface StageConfig {
  id: string;
  title: string;
  ageGroup: AgeGroup;
  theme: string;
  description: string;
  concepts: string[];
  color: string;
  bgGradient: string;
}

export interface QuizQuestion {
  question: string;
  choices: string[];
  correctIndex: number;
  visualInstruction: string;
  explanation: string;
  isAiGenerated?: boolean;
}

export interface GameQuest {
  id: string;
  title: string;
  rewardExp: number;
  rewardGold: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}
