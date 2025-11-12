/**
 * Quest Service
 * Handles quest progress tracking, completion checking, and reward claiming
 */

import { IQuestRepository } from '../../domain/interfaces/quest-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { IPortfolioRepository } from '../../domain/interfaces/portfolio-repository.interface';
import { GamificationService } from './gamification.service';
import {
  Quest,
  QuestWithProgress,
  UserQuestProgress,
  QuestRequirementType
} from '../../domain/types/quest.types';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';

export class QuestService {
  private readonly gamificationService: GamificationService;

  constructor(
    private readonly questRepository: IQuestRepository,
    private readonly userRepository: IUserRepository,
    private readonly portfolioRepository: IPortfolioRepository
  ) {
    this.gamificationService = new GamificationService();
  }

  /**
   * Get all available quests
   */
  async getAllQuests(): Promise<Quest[]> {
    const questDocs = await this.questRepository.findAll();

    return questDocs.map(doc => ({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      requirement: doc.requirement,
      reward: doc.reward
    }));
  }

  /**
   * Get all quests with user progress
   * This is the main endpoint - ALWAYS returns with user progress
   * OPTIMIZED: Fetches user and portfolio ONCE, then calculates all progress
   */
  async getQuestsWithProgress(userId: string): Promise<QuestWithProgress[]> {
    // Fetch all data in parallel (3 queries total instead of N queries)
    const [user, portfolio, quests] = await Promise.all([
      this.userRepository.findById(userId),
      this.portfolioRepository.findByUserId(userId),
      this.getAllQuests()
    ]);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Pre-calculate common values
    const totalTrades = user.totalTrades || 0;
    const portfolioDiversity = portfolio?.holdings.length || 0;
    const portfolioValue = portfolio?.holdings.reduce(
      (sum, holding) => sum + holding.totalInvested,
      0
    ) || 0;
    const netWorth = user.balance + portfolioValue;

    // Map quests with calculated progress (no additional queries)
    const questsWithProgress = quests.map(quest => {
      const existingProgress = user.questProgress?.find(
        p => p.questId === quest.id
      );

      // If already completed, return stored progress including claimed status
      if (existingProgress?.completed) {
        return {
          ...quest,
          userProgress: {
            progress: existingProgress.progress,
            completed: true,
            claimed: existingProgress.claimed || false,
            completedAt: existingProgress.completedAt,
            claimedAt: existingProgress.claimedAt
          }
        };
      }

      // Calculate current progress based on requirement type
      let currentProgress = 0;
      switch (quest.requirement.type) {
        case 'TOTAL_TRADES':
          currentProgress = totalTrades;
          break;
        case 'PORTFOLIO_DIVERSITY':
          currentProgress = portfolioDiversity;
          break;
        case 'NET_WORTH':
          currentProgress = netWorth;
          break;
        case 'PROFIT_PERCENTAGE':
          currentProgress = 0; // TODO: Implement when crypto price integration is ready
          break;
      }

      return {
        ...quest,
        userProgress: {
          progress: currentProgress,
          completed: currentProgress >= quest.requirement.value,
          claimed: false,
          completedAt: existingProgress?.completedAt
        }
      };
    });

    return questsWithProgress;
  }

  /**
   * Get only quests that user has already claimed
   * New endpoint: GET /api/quests/completed
   */
  async getCompletedQuests(userId: string): Promise<QuestWithProgress[]> {
    const allQuests = await this.getQuestsWithProgress(userId);
    return allQuests.filter(q => q.userProgress.claimed === true);
  }

  /**
   * Get quests that can be claimed (completed but not yet claimed)
   * New endpoint: GET /api/quests/available
   */
  async getAvailableQuests(userId: string): Promise<QuestWithProgress[]> {
    const allQuests = await this.getQuestsWithProgress(userId);
    return allQuests.filter(
      q => q.userProgress.completed === true && q.userProgress.claimed === false
    );
  }

  /**
   * Claim quest reward (award XP)
   * OPTIMIZED: Fetches data in parallel, calculates progress inline
   */
  async claimQuestReward(
    userId: string,
    questId: string
  ): Promise<{
    xpGained: number;
    leveledUp: boolean;
    newLevel: number;
  }> {
    // Fetch quest, user, and portfolio in parallel
    const [quest, user, portfolio] = await Promise.all([
      this.questRepository.findById(questId),
      this.userRepository.findById(userId),
      this.portfolioRepository.findByUserId(userId)
    ]);

    if (!quest) {
      throw new NotFoundError('Quest não encontrada');
    }

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Check if already claimed
    const existingProgress = user.questProgress?.find(
      p => p.questId === questId
    );

    if (existingProgress?.claimed) {
      throw new BadRequestError('Quest já foi reivindicada');
    }

    // Calculate current progress based on requirement type
    let currentProgress = 0;
    switch (quest.requirement.type) {
      case 'TOTAL_TRADES':
        currentProgress = user.totalTrades || 0;
        break;
      case 'PORTFOLIO_DIVERSITY':
        currentProgress = portfolio?.holdings.length || 0;
        break;
      case 'NET_WORTH': {
        const portfolioValue = portfolio?.holdings.reduce(
          (sum, holding) => sum + holding.totalInvested,
          0
        ) || 0;
        currentProgress = user.balance + portfolioValue;
        break;
      }
      case 'PROFIT_PERCENTAGE':
        currentProgress = 0; // TODO: Implement when crypto price integration is ready
        break;
    }

    // Check if quest is completed
    if (currentProgress < quest.requirement.value) {
      throw new BadRequestError(
        `Quest ainda não completada. Progresso: ${currentProgress}/${quest.requirement.value}`
      );
    }

    // Update user quest progress
    const questProgressIndex = user.questProgress?.findIndex(
      p => p.questId === questId
    );

    const now = new Date();

    if (questProgressIndex !== undefined && questProgressIndex >= 0) {
      user.questProgress[questProgressIndex].progress = currentProgress;
      user.questProgress[questProgressIndex].completed = true;
      user.questProgress[questProgressIndex].claimed = true;
      user.questProgress[questProgressIndex].completedAt = user.questProgress[questProgressIndex].completedAt || now;
      user.questProgress[questProgressIndex].claimedAt = now;
    } else {
      if (!user.questProgress) {
        user.questProgress = [];
      }
      user.questProgress.push({
        questId,
        progress: currentProgress,
        completed: true,
        claimed: true,
        completedAt: now,
        claimedAt: now
      });
    }

    await user.save();

    // Award XP
    const levelUpResult = await this.gamificationService.awardXP(
      userId,
      quest.reward.xp
    );

    return {
      xpGained: quest.reward.xp,
      leveledUp: levelUpResult.leveledUp,
      newLevel: levelUpResult.newLevel
    };
  }

  /**
   * Get user's quest progress only
   */
  async getUserQuestProgress(userId: string): Promise<UserQuestProgress[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user.questProgress || [];
  }
}
