/**
 * Shared Trade Types
 * Used by both frontend and backend
 */

import type { CryptoSymbol } from './portfolio.types'

export type TradeType = 'BUY' | 'SELL'
export type TradeStatus = 'COMPLETED' | 'FAILED'

export interface Trade {
  id: string
  userId: string
  type: TradeType
  symbol: CryptoSymbol
  amount: number
  price: number
  total: number
  status: TradeStatus
  timestamp: Date
  errorMessage?: string
}

export interface TradeHistoryOptions {
  limit?: number
  offset?: number
  symbol?: CryptoSymbol
  type?: TradeType
  startDate?: Date
  endDate?: Date
}
