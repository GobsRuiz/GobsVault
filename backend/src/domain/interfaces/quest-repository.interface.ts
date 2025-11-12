import { IQuestDocument } from '../models/quest.model';
import { Quest } from '../types/quest.types';

/**
 * Quest repository interface defining data access operations
 */
export interface IQuestRepository {
  /**
   * Find all quests
   */
  findAll(): Promise<IQuestDocument[]>;

  /**
   * Find quest by ID
   */
  findById(id: string): Promise<IQuestDocument | null>;

  /**
   * Create a new quest (used by seeder)
   */
  create(data: Omit<Quest, 'id'>): Promise<IQuestDocument>;

  /**
   * Count total quests
   */
  count(): Promise<number>;
}
