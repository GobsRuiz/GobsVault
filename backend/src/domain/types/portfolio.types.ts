/**
 * Domain types for portfolio management
 * Defines portfolio structure and holdings
 */

import type { CryptoSymbol } from './trade.types';

// Re-export CryptoSymbol for convenience
export type { CryptoSymbol };

/**
 * Individual crypto holding in a portfolio
 */
export interface Holding {
  symbol: CryptoSymbol;
  amount: number;
  averageBuyPrice: number;
  totalInvested: number;
}

/**
 * Portfolio entity containing all user holdings
 */
export interface Portfolio {
  id: string;
  userId: string;
  holdings: Holding[];
  updatedAt: Date;
}

/**
 * Portfolio with current market values
 */
export interface PortfolioWithValues extends Portfolio {
  holdings: HoldingWithValue[];
  totalPortfolioValue: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
}

/**
 * Holding with real-time market value
 */
export interface HoldingWithValue extends Holding {
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

/**
 * Portfolio summary with balance
 */
export interface PortfolioSummary {
  balance: number;
  portfolioValue: number;
  netWorth: number;
  totalInvested: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  todayProfitLoss: number;
  todayProfitLossPercent: number;
}

/**
 * Portfolio snapshot for historical tracking
 */
export interface PortfolioSnapshot {
  id: string;
  userId: string;
  date: Date;
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
  createdAt: Date;
  updatedAt: Date;
}
