import { IPortfolioRepository } from '../../domain/interfaces/portfolio-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { CryptoService } from './crypto.service';
import {
  PortfolioWithValues,
  HoldingWithValue,
  PortfolioSummary
} from '../../domain/types/portfolio.types';
import { BadRequestError } from '../../shared/errors/AppError';

export class PortfolioService {
  constructor(
    private readonly portfolioRepository: IPortfolioRepository,
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: CryptoService
  ) {}

  /**
   * Get user portfolio with current market values
   */
  async getPortfolioWithValues(userId: string): Promise<PortfolioWithValues> {
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

    // Get current crypto prices
    const prices = await this.cryptoService.getPrices();
    const priceMap = new Map(prices.map(p => [p.symbol, p.price]));

    // Calculate values for each holding
    const holdingsWithValues: HoldingWithValue[] = portfolio.holdings.map(holding => {
      const currentPrice = priceMap.get(holding.symbol) || 0;
      const currentValue = holding.amount * currentPrice;
      const profitLoss = currentValue - holding.totalInvested;
      const profitLossPercent =
        holding.totalInvested > 0 ? (profitLoss / holding.totalInvested) * 100 : 0;

      return {
        ...holding,
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
   * Get portfolio summary including balance
   */
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    // Get user balance
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestError('Usuário não encontrado');
    }

    // Get portfolio with values
    const portfolio = await this.getPortfolioWithValues(userId);

    // Calculate net worth
    const netWorth = user.balance + portfolio.totalPortfolioValue;

    return {
      balance: user.balance,
      portfolioValue: portfolio.totalPortfolioValue,
      netWorth,
      totalInvested: portfolio.totalInvested,
      totalProfitLoss: portfolio.totalProfitLoss,
      totalProfitLossPercent: portfolio.totalProfitLossPercent
    };
  }
}
