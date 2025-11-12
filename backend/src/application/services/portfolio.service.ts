import { IPortfolioRepository } from '../../domain/interfaces/portfolio-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { ITradeRepository } from '../../domain/interfaces/trade-repository.interface';
import { IPortfolioSnapshotRepository } from '../../domain/interfaces/portfolio-snapshot-repository.interface';
import { CryptoService } from './crypto.service';
import {
  PortfolioWithValues,
  HoldingWithValue,
  PortfolioSummary,
  PortfolioSnapshot,
  CryptoSymbol
} from '../../domain/types/portfolio.types';
import { BadRequestError } from '../../shared/errors/AppError';

export class PortfolioService {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository,
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: CryptoService,
    private readonly tradeRepository: ITradeRepository,
    private readonly snapshotRepository: IPortfolioSnapshotRepository
  ) {}

  /**
   * Get user portfolio with current market values
   * @param userId - User ID
   * @param priceMap - Optional price map to avoid redundant API calls
   */
  async getPortfolioWithValues(
    userId: string,
    priceMap?: Map<CryptoSymbol, number>
  ): Promise<PortfolioWithValues> {
    // Get portfolio from database
    const portfolio = await this.portfolioRepository.findByUserId(userId);

    if (!portfolio) {
      // Return empty portfolio if none exists
      return {
        id: '',
        userId,
        holdings: [],
        updatedAt: new Date(),
        totalPortfolioValue: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0
      };
    }

    // Get current crypto prices (use provided map or fetch)
    if (!priceMap) {
      const prices = await this.cryptoService.getPrices();
      priceMap = new Map(prices.map(p => [p.symbol, p.price]));
    }

    // Calculate values for each holding
    const holdingsWithValues: HoldingWithValue[] = portfolio.holdings.map(holding => {
      const currentPrice = priceMap.get(holding.symbol) || 0;
      const currentValue = holding.amount * currentPrice;
      const profitLoss = currentValue - holding.totalInvested;
      const profitLossPercent =
        holding.totalInvested > 0 ? (profitLoss / holding.totalInvested) * 100 : 0;

      return {
        symbol: holding.symbol,
        amount: holding.amount,
        averageBuyPrice: holding.averageBuyPrice,
        totalInvested: holding.totalInvested,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercent
      };
    });

    // Calculate totals
    const totalPortfolioValue = holdingsWithValues.reduce(
      (sum, h) => sum + h.currentValue,
      0
    );
    const totalInvested = holdingsWithValues.reduce(
      (sum, h) => sum + h.totalInvested,
      0
    );
    const totalProfitLoss = totalPortfolioValue - totalInvested;
    const totalProfitLossPercent =
      totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return {
      id: portfolio._id.toString(),
      userId: portfolio.userId,
      holdings: holdingsWithValues,
      updatedAt: portfolio.updatedAt,
      totalPortfolioValue,
      totalInvested,
      totalProfitLoss,
      totalProfitLossPercent
    };
  }

  /**
   * Calculate today's profit/loss from trades made today
   * @param userId - User ID
   * @param priceMap - Optional price map to avoid redundant API calls
   */
  async getTodayProfitLoss(
    userId: string,
    priceMap?: Map<CryptoSymbol, number>
  ): Promise<{ profitLoss: number; percent: number }> {
    // Get start and end of today in São Paulo timezone (UTC-3)
    const now = new Date();
    const saoPauloTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const year = saoPauloTime.getUTCFullYear();
    const month = saoPauloTime.getUTCMonth();
    const day = saoPauloTime.getUTCDate();

    // 00:00:00 São Paulo = 03:00:00 UTC
    const todayStart = new Date(Date.UTC(year, month, day, 3, 0, 0, 0));
    // 23:59:59.999 São Paulo = 02:59:59.999 UTC (next day)
    const todayEnd = new Date(Date.UTC(year, month, day + 1, 2, 59, 59, 999));

    // Get today's trades
    const todayTrades = await this.tradeRepository.findByUserId(userId, {
      startDate: todayStart,
      endDate: todayEnd
    });

    if (!todayTrades || todayTrades.length === 0) {
      return { profitLoss: 0, percent: 0 };
    }

    // Get current prices (use provided map or fetch)
    if (!priceMap) {
      const prices = await this.cryptoService.getPrices();
      priceMap = new Map(prices.map(p => [p.symbol, p.price]));
    }

    // Calculate P/L for today's trades
    let totalInvestedToday = 0;
    let currentValueToday = 0;

    // Group trades by symbol
    const tradesBySymbol = new Map<CryptoSymbol, { buyAmount: number; buyTotal: number }>();

    for (const trade of todayTrades) {
      if (trade.type === 'BUY') {
        const existing = tradesBySymbol.get(trade.symbol) || { buyAmount: 0, buyTotal: 0 };
        existing.buyAmount += trade.amount;
        existing.buyTotal += trade.total;
        tradesBySymbol.set(trade.symbol, existing);
      }
      // SELL trades already realized, don't count in "current value"
    }

    // Calculate current value of today's BUYs
    for (const [symbol, data] of tradesBySymbol) {
      const currentPrice = priceMap.get(symbol) || 0;
      totalInvestedToday += data.buyTotal;
      currentValueToday += data.buyAmount * currentPrice;
    }

    const profitLoss = currentValueToday - totalInvestedToday;
    const percent = totalInvestedToday > 0 ? (profitLoss / totalInvestedToday) * 100 : 0;

    return { profitLoss, percent };
  }

  /**
   * Get portfolio summary including balance
   */
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    // Get user balance
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('Usuário não encontrado');
    }

    // Fetch crypto prices once (shared between portfolio and today's P/L)
    const prices = await this.cryptoService.getPrices();
    const priceMap = new Map(prices.map(p => [p.symbol, p.price]));

    // Get portfolio with values (passing price map - no redundant API call)
    const portfolio = await this.getPortfolioWithValues(userId, priceMap);

    // Get today's profit/loss (passing price map - no redundant API call)
    const today = await this.getTodayProfitLoss(userId, priceMap);

    // Calculate net worth
    const netWorth = user.balance + portfolio.totalPortfolioValue;

    return {
      balance: user.balance,
      portfolioValue: portfolio.totalPortfolioValue,
      netWorth,
      totalInvested: portfolio.totalInvested,
      totalProfitLoss: portfolio.totalProfitLoss,
      totalProfitLossPercent: portfolio.totalProfitLossPercent,
      todayProfitLoss: today.profitLoss,
      todayProfitLossPercent: today.percent
    };
  }

  /**
   * Get portfolio history for a date range
   * @param userId - User ID
   * @param days - Number of days to look back (default: 30)
   */
  async getPortfolioHistory(userId: string, days: number = 30): Promise<PortfolioSnapshot[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.snapshotRepository.findByUserIdAndDateRange(userId, startDate, endDate);
  }

  /**
   * Create a snapshot of current portfolio value
   * Should be called daily by a cron job
   * @param userId - User ID
   */
  async createPortfolioSnapshot(userId: string): Promise<PortfolioSnapshot> {
    // Check if snapshot already exists for today
    const today = new Date();
    const exists = await this.snapshotRepository.existsForDate(userId, today);

    if (exists) {
      throw new BadRequestError('Snapshot já existe para hoje');
    }

    // Get current portfolio values
    const portfolio = await this.getPortfolioWithValues(userId);

    // Create snapshot
    return this.snapshotRepository.create({
      userId,
      date: today,
      totalValue: portfolio.totalPortfolioValue,
      totalInvested: portfolio.totalInvested,
      profitLoss: portfolio.totalProfitLoss,
      profitLossPercent: portfolio.totalProfitLossPercent
    });
  }
}
