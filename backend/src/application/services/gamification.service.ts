/**
 * Gamification Service
 * Handles XP calculation, level progression, and rank management
 */

import { UserModel } from '../../infrastructure/database/schemas/user.schema';
import {
  Rank,
  RankThresholds,
  XPCalculation,
  LevelUpResult,
  GamificationStats,
} from '../../domain/types/gamification.types';
import { NotFoundError } from '../../shared/errors/AppError';

/**
 * Constants for XP and rank calculations
 */
const BASE_XP = 10;
const XP_PER_LEVEL_MULTIPLIER = 100; // XP needed = level * 100

const RANK_THRESHOLDS: RankThresholds = {
  [Rank.INICIANTE]: { min: 1, max: 9 },
  [Rank.BRONZE]: { min: 10, max: 24 },
  [Rank.PRATA]: { min: 25, max: 49 },
  [Rank.OURO]: { min: 50, max: 99 },
  [Rank.DIAMANTE]: { min: 100, max: Infinity },
};

export class GamificationService {
  /**
   * Calculate XP reward for a trade
   * Formula: BASE_XP * (1 + level * 0.1)
   */
  calculateXPForTrade(userLevel: number): XPCalculation {
    const levelMultiplier = 1 + userLevel * 0.1;
    const totalXP = Math.floor(BASE_XP * levelMultiplier);

    return {
      baseXP: BASE_XP,
      levelMultiplier,
      totalXP,
    };
  }

  /**
   * Calculate XP required for next level
   * Formula: level * 100
   */
  calculateXPForNextLevel(currentLevel: number): number {
    return currentLevel * XP_PER_LEVEL_MULTIPLIER;
  }

  /**
   * Calculate user rank based on level
   */
  calculateRank(level: number): Rank {
    for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS)) {
      if (level >= threshold.min && level <= threshold.max) {
        return rank as Rank;
      }
    }
    return Rank.INICIANTE; // Fallback
  }

  /**
   * Check if user leveled up and return result
   */
  checkLevelUp(currentXP: number, currentLevel: number): LevelUpResult {
    const xpNeeded = this.calculateXPForNextLevel(currentLevel);
    let newLevel = currentLevel;
    let leveledUp = false;

    // Check for level ups (can level up multiple times if enough XP)
    while (currentXP >= this.calculateXPForNextLevel(newLevel)) {
      newLevel++;
      leveledUp = true;
    }

    const newRank = this.calculateRank(newLevel);
    const xpForNextLevel = this.calculateXPForNextLevel(newLevel);

    return {
      leveledUp,
      newLevel,
      newRank,
      xpForNextLevel,
    };
  }

  /**
   * Award XP to user and handle level ups
   * Returns updated user data
   */
  async awardXP(userId: string, xpAmount: number): Promise<LevelUpResult> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Add XP
    const newXP = user.xp + xpAmount;

    // Check for level up
    const levelUpResult = this.checkLevelUp(newXP, user.level);

    // Update user
    user.xp = newXP;
    user.level = levelUpResult.newLevel;
    user.rank = levelUpResult.newRank;

    await user.save();

    return levelUpResult;
  }

  /**
   * Process trade reward - calculates and awards XP for a completed trade
   */
  async processTradeReward(userId: string): Promise<LevelUpResult> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate XP for this trade
    const xpCalculation = this.calculateXPForTrade(user.level);

    // Award XP
    const levelUpResult = await this.awardXP(userId, xpCalculation.totalXP);

    return levelUpResult;
  }

  /**
   * Get user gamification stats
   */
  async getUserStats(userId: string): Promise<GamificationStats> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const xpForNextLevel = this.calculateXPForNextLevel(user.level);
    const xpInCurrentLevel = user.xp % xpForNextLevel;
    const progressToNextLevel = Math.floor((xpInCurrentLevel / xpForNextLevel) * 100);

    return {
      xp: user.xp,
      level: user.level,
      rank: user.rank as Rank,
      xpForNextLevel,
      progressToNextLevel,
    };
  }
}
