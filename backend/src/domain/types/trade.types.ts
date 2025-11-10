/**
 * Domain types for trading operations
 * Defines core trading concepts and structures
 */

/**
 * Supported cryptocurrency symbols
 */
export type CryptoSymbol = 'BTC' | 'ETH' | 'BNB' | 'SOL' | 'ADA';

/**
 * Trade operation types
 */
export type TradeType = 'BUY' | 'SELL';

/**
 * Trade execution status
 */
export type TradeStatus = 'COMPLETED' | 'FAILED';

/**
 * Trade entity representing a single trading operation
 */
export interface Trade {
  id: string;
  userId: string;
  type: TradeType;
  symbol: CryptoSymbol;
  amount: number;
  price: number;
  total: number;
  status: TradeStatus;
  timestamp: Date;
  errorMessage?: string;
}

/**
 * Parameters for executing a buy trade
 */
export interface BuyTradeParams {
  userId: string;
  symbol: CryptoSymbol;
  amount: number;
}

/**
 * Parameters for executing a sell trade
 */
export interface SellTradeParams {
  userId: string;
  symbol: CryptoSymbol;
  amount: number;
}

/**
 * Result of a trade execution
 */
export interface TradeResult {
  success: boolean;
  trade?: Trade;
  error?: string;
}

/**
 * Trade history query options
 */
export interface TradeHistoryOptions {
  limit?: number;
  offset?: number;
  symbol?: CryptoSymbol;
  type?: TradeType;
  startDate?: Date;
  endDate?: Date;
}
