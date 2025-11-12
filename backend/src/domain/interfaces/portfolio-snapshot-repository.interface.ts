import { PortfolioSnapshot } from '../types/portfolio.types';

/**
 * Portfolio Snapshot Repository Interface
 * Defines contract for portfolio snapshot data access
 */
export interface IPortfolioSnapshotRepository {
  /**
   * Create a new portfolio snapshot
   */
  create(snapshot: Omit<PortfolioSnapshot, 'id' | 'createdAt' | 'updatedAt'>): Promise<PortfolioSnapshot>;

  /**
   * Find snapshots by user ID within date range
   */
  findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PortfolioSnapshot[]>;

  /**
   * Find the most recent snapshot for a user
   */
  findLatestByUserId(userId: string): Promise<PortfolioSnapshot | null>;

  /**
   * Check if snapshot exists for user and date
   */
  existsForDate(userId: string, date: Date): Promise<boolean>;
}
