/**
 * Shared Portfolio Types
 * Used by both frontend and backend
 */

export type CryptoSymbol = 'BTC' | 'ETH' | 'BNB' | 'SOL' | 'ADA'

export interface Holding {
  symbol: CryptoSymbol
  amount: number
  averageBuyPrice: number
  totalInvested: number
}

export interface HoldingWithValue extends Holding {
  currentPrice: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
}

export interface Portfolio {
  id: string
  userId: string
  holdings: HoldingWithValue[]
  updatedAt: Date
  totalPortfolioValue: number
  totalInvested: number
  totalProfitLoss: number
  totalProfitLossPercent: number
}

export interface PortfolioSummary {
  balance: number
  portfolioValue: number
  netWorth: number
  totalInvested: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  todayProfitLoss: number
  todayProfitLossPercent: number
}

export interface PortfolioSnapshot {
  id: string
  userId: string
  date: Date
  totalValue: number
  totalInvested: number
  profitLoss: number
  profitLossPercent: number
  createdAt: Date
  updatedAt: Date
}
