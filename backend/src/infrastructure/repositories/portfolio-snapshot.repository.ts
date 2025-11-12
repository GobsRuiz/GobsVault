import { IPortfolioSnapshotRepository } from '../../domain/interfaces/portfolio-snapshot-repository.interface';
import { PortfolioSnapshot } from '../../domain/types/portfolio.types';
import { PortfolioSnapshotModel } from '../database/schemas/portfolio-snapshot.schema';

/**
 * Portfolio Snapshot Repository Implementation
 * Handles portfolio snapshot data persistence
 */
export class PortfolioSnapshotRepository implements IPortfolioSnapshotRepository {
  /**
   * Create a new portfolio snapshot
   */
  async create(
    snapshot: Omit<PortfolioSnapshot, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PortfolioSnapshot> {
    const doc = await PortfolioSnapshotModel.create(snapshot);

    return {
      id: doc._id.toString(),
      userId: doc.userId,
      date: doc.date,
      totalValue: doc.totalValue,
      totalInvested: doc.totalInvested,
      profitLoss: doc.profitLoss,
      profitLossPercent: doc.profitLossPercent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Find snapshots by user ID within date range
   */
  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PortfolioSnapshot[]> {
    const docs = await PortfolioSnapshotModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: 1 })
      .lean()
      .exec();

    return docs.map(doc => ({
      id: doc._id.toString(),
      userId: doc.userId,
      date: doc.date,
      totalValue: doc.totalValue,
      totalInvested: doc.totalInvested,
      profitLoss: doc.profitLoss,
      profitLossPercent: doc.profitLossPercent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }));
  }

  /**
   * Find the most recent snapshot for a user
   */
  async findLatestByUserId(userId: string): Promise<PortfolioSnapshot | null> {
    const doc = await PortfolioSnapshotModel.findOne({ userId })
      .sort({ date: -1 })
      .lean()
      .exec();

    if (!doc) return null;

    return {
      id: doc._id.toString(),
      userId: doc.userId,
      date: doc.date,
      totalValue: doc.totalValue,
      totalInvested: doc.totalInvested,
      profitLoss: doc.profitLoss,
      profitLossPercent: doc.profitLossPercent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * Check if snapshot exists for user and date
   */
  async existsForDate(userId: string, date: Date): Promise<boolean> {
    // Check for same day (ignoring time)
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const count = await PortfolioSnapshotModel.countDocuments({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    return count > 0;
  }
}
