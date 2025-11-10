import { ClientSession } from 'mongoose';
import { IPortfolioDocument } from '../models/portfolio.model';
import { CryptoSymbol, Holding } from '../types/portfolio.types';

/**
 * Portfolio repository interface defining data access operations
 */
export interface IPortfolioRepository {
  /**
   * Find portfolio by user ID
   */
  findByUserId(userId: string): Promise<IPortfolioDocument | null>;

  /**
   * Create a new portfolio for a user
   */
  create(userId: string, session?: ClientSession): Promise<IPortfolioDocument>;

  /**
   * Get or create portfolio for a user
   */
  getOrCreate(userId: string, session?: ClientSession): Promise<IPortfolioDocument>;

  /**
   * Add or update a holding in the portfolio
   */
  upsertHolding(
    userId: string,
    symbol: CryptoSymbol,
    amount: number,
    averageBuyPrice: number,
    totalInvested: number,
    session?: ClientSession
  ): Promise<IPortfolioDocument>;

  /**
   * Update holding amount (for sells)
   */
  updateHoldingAmount(
    userId: string,
    symbol: CryptoSymbol,
    newAmount: number,
    session?: ClientSession
  ): Promise<IPortfolioDocument | null>;

  /**
   * Get specific holding for a user
   */
  getHolding(userId: string, symbol: CryptoSymbol): Promise<Holding | null>;

  /**
   * Remove a holding from portfolio (when amount reaches 0)
   */
  removeHolding(
    userId: string,
    symbol: CryptoSymbol,
    session?: ClientSession
  ): Promise<IPortfolioDocument | null>;
}
