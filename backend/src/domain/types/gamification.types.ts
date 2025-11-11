/**
 * Gamification Types
 * Defines types and enums for the XP and ranking system
 */

/**
 * User rank levels based on player level
 */
export enum Rank {
  INICIANTE = 'INICIANTE',
  BRONZE = 'BRONZE',
  PRATA = 'PRATA',
  OURO = 'OURO',
  DIAMANTE = 'DIAMANTE',
}

/**
 * Rank thresholds based on user level
 */
export interface RankThresholds {
  [Rank.INICIANTE]: { min: number; max: number };
  [Rank.BRONZE]: { min: number; max: number };
  [Rank.PRATA]: { min: number; max: number };
  [Rank.OURO]: { min: number; max: number };
  [Rank.DIAMANTE]: { min: number; max: number };
}

/**
 * XP calculation result
 */
export interface XPCalculation {
  baseXP: number;
  levelMultiplier: number;
  totalXP: number;
}

/**
 * Level up result
 */
export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  newRank: Rank;
  xpForNextLevel: number;
}

/**
 * User gamification stats
 */
export interface GamificationStats {
  xp: number;
  level: number;
  rank: Rank;
  xpForNextLevel: number;
  progressToNextLevel: number; // percentage 0-100
}
