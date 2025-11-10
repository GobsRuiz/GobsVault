import { ClientSession } from 'mongoose';
import { ITradeDocument } from '../models/trade.model';
import { TradeType, CryptoSymbol, TradeStatus } from '../types/trade.types';

/**
 * Trade repository interface defining data access operations
 */
export interface ITradeRepository {
  /**
   * Create a new trade record
   */
  create(
    data: {
      userId: string;
      type: TradeType;
      symbol: CryptoSymbol;
      amount: number;
      price: number;
      total: number;
      status: TradeStatus;
      errorMessage?: string;
    },
    session?: ClientSession
  ): Promise<ITradeDocument>;

  /**
   * Find trade by ID
   */
  findById(id: string): Promise<ITradeDocument | null>;

  /**
   * Find all trades for a user with pagination
   */
  findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      symbol?: CryptoSymbol;
      type?: TradeType;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ITradeDocument[]>;

  /**
   * Count total trades for a user
   */
  countByUserId(userId: string): Promise<number>;

  /**
   * Get user's trade statistics
   */
  getTradeStats(userId: string): Promise<{
    totalTrades: number;
    totalBuys: number;
    totalSells: number;
    totalVolume: number;
  }>;
}
