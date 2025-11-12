/**
 * Quest Domain Types
 * Defines types for the fixed quest system
 */

/**
 * Quest requirement types
 */
export type QuestRequirementType =
  | 'TOTAL_TRADES'
  | 'PORTFOLIO_DIVERSITY'
  | 'NET_WORTH'
  | 'PROFIT_PERCENTAGE';

/**
 * Quest requirement defining completion criteria
 */
export interface QuestRequirement {
  type: QuestRequirementType;
  value: number;
}

/**
 * Quest reward (currently only XP)
 */
export interface QuestReward {
  xp: number;
}

/**
 * Quest entity - fixed quests available to all users
 */
export interface Quest {
  id: string;
  title: string;
  description: string;
  requirement: QuestRequirement;
  reward: QuestReward;
}

/**
 * User's progress on a specific quest
 */
export interface UserQuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: Date;
  claimedAt?: Date;
}

/**
 * Quest with user progress information
 */
export interface QuestWithProgress extends Quest {
  userProgress: {
    progress: number;
    completed: boolean;
    claimed: boolean;
    completedAt?: Date;
    claimedAt?: Date;
  };
}
