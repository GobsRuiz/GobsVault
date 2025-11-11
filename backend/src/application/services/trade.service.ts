import mongoose from 'mongoose';
import { ITradeRepository } from '../../domain/interfaces/trade-repository.interface';
import { IPortfolioRepository } from '../../domain/interfaces/portfolio-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { CryptoService } from './crypto.service';
import { GamificationService } from './gamification.service';
import { CryptoSymbol, TradeType } from '../../domain/types/trade.types';
import { BadRequestError, InsufficientFundsError } from '../../shared/errors/AppError';

export interface ExecuteTradeParams {
  userId: string;
  symbol: CryptoSymbol;
  amountUSD: number;
}

export interface ExecuteTradeResult {
  tradeId: string;
  type: TradeType;
  symbol: CryptoSymbol;
  cryptoAmount: number;
  pricePerUnit: number;
  totalUSD: number;
  newBalance: number;
  xpGained?: number;
  leveledUp?: boolean;
  newLevel?: number;
}

export class TradeService {
  private readonly MIN_TRADE_VALUE = 10;
  private readonly gamificationService: GamificationService;

  constructor(
    private readonly tradeRepository: ITradeRepository,
    private readonly portfolioRepository: IPortfolioRepository,
    private readonly userRepository: IUserRepository,
    private readonly cryptoService: CryptoService
  ) {
    this.gamificationService = new GamificationService();
  }

  /**
   * Execute a BUY trade
   */
  async executeBuy(params: ExecuteTradeParams): Promise<ExecuteTradeResult> {
    const { userId, symbol, amountUSD } = params;

    // Validate minimum trade value
    if (amountUSD < this.MIN_TRADE_VALUE) {
      throw new BadRequestError(
        `Valor mínimo de trade é $${this.MIN_TRADE_VALUE}`
      );
    }

    // Get current crypto price
    const currentPrice = await this.getCurrentPrice(symbol);

    // Calculate crypto amount
    const cryptoAmount = amountUSD / currentPrice;

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get user and validate balance
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new BadRequestError('Usuário não encontrado');
      }

      if (user.balance < amountUSD) {
        throw new InsufficientFundsError(
          `Saldo insuficiente. Disponível: $${user.balance.toFixed(2)}, Necessário: $${amountUSD.toFixed(2)}`
        );
      }

      // Deduct from balance
      const newBalance = user.balance - amountUSD;
      user.balance = newBalance;
      await user.save({ session });

      // Update portfolio
      await this.updatePortfolioForBuy(
        userId,
        symbol,
        cryptoAmount,
        currentPrice,
        amountUSD,
        session
      );

      // Record trade
      const trade = await this.tradeRepository.create(
        {
          userId,
          type: 'BUY',
          symbol,
          amount: cryptoAmount,
          price: currentPrice,
          total: amountUSD,
          status: 'COMPLETED'
        },
        session
      );

      // Increment total trades counter
      user.totalTrades = (user.totalTrades || 0) + 1;
      await user.save({ session });

      await session.commitTransaction();

      // Award XP for the trade (outside transaction)
      const xpCalculation = this.gamificationService.calculateXPForTrade(user.level);
      const levelUpResult = await this.gamificationService.awardXP(userId, xpCalculation.totalXP);

      return {
        tradeId: trade._id.toString(),
        type: 'BUY',
        symbol,
        cryptoAmount,
        pricePerUnit: currentPrice,
        totalUSD: amountUSD,
        newBalance,
        xpGained: xpCalculation.totalXP,
        leveledUp: levelUpResult.leveledUp,
        newLevel: levelUpResult.newLevel
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Execute a SELL trade
   */
  async executeSell(params: ExecuteTradeParams): Promise<ExecuteTradeResult> {
    const { userId, symbol, amountUSD } = params;

    // Validate minimum trade value
    if (amountUSD < this.MIN_TRADE_VALUE) {
      throw new BadRequestError(
        `Valor mínimo de trade é $${this.MIN_TRADE_VALUE}`
      );
    }

    // Get current crypto price
    const currentPrice = await this.getCurrentPrice(symbol);

    // Calculate crypto amount needed to sell
    const cryptoAmount = amountUSD / currentPrice;

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get user
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new BadRequestError('Usuário não encontrado');
      }

      // Check if user has enough holdings
      const holding = await this.portfolioRepository.getHolding(userId, symbol);
      if (!holding || holding.amount < cryptoAmount) {
        const available = holding?.amount || 0;
        throw new InsufficientFundsError(
          `Holdings insuficientes. Disponível: ${available.toFixed(8)} ${symbol}, Necessário: ${cryptoAmount.toFixed(8)} ${symbol}`
        );
      }

      // Add to balance
      const newBalance = user.balance + amountUSD;
      user.balance = newBalance;
      await user.save({ session });

      // Update portfolio (reduce holdings)
      const newHoldingAmount = holding.amount - cryptoAmount;
      await this.portfolioRepository.updateHoldingAmount(
        userId,
        symbol,
        newHoldingAmount,
        session
      );

      // Record trade
      const trade = await this.tradeRepository.create(
        {
          userId,
          type: 'SELL',
          symbol,
          amount: cryptoAmount,
          price: currentPrice,
          total: amountUSD,
          status: 'COMPLETED'
        },
        session
      );

      // Increment total trades counter
      user.totalTrades = (user.totalTrades || 0) + 1;
      await user.save({ session });

      await session.commitTransaction();

      // Award XP for the trade (outside transaction)
      const xpCalculation = this.gamificationService.calculateXPForTrade(user.level);
      const levelUpResult = await this.gamificationService.awardXP(userId, xpCalculation.totalXP);

      return {
        tradeId: trade._id.toString(),
        type: 'SELL',
        symbol,
        cryptoAmount,
        pricePerUnit: currentPrice,
        totalUSD: amountUSD,
        newBalance,
        xpGained: xpCalculation.totalXP,
        leveledUp: levelUpResult.leveledUp,
        newLevel: levelUpResult.newLevel
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get trade history for a user
   */
  async getTradeHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      symbol?: CryptoSymbol;
      type?: TradeType;
    }
  ) {
    return await this.tradeRepository.findByUserId(userId, options);
  }

  /**
   * Get trade statistics for a user
   */
  async getTradeStats(userId: string) {
    return await this.tradeRepository.getTradeStats(userId);
  }

  /**
   * Update portfolio for a BUY trade (calculate weighted average)
   */
  private async updatePortfolioForBuy(
    userId: string,
    symbol: CryptoSymbol,
    cryptoAmount: number,
    currentPrice: number,
    totalUSD: number,
    session: mongoose.ClientSession
  ): Promise<void> {
    const existingHolding = await this.portfolioRepository.getHolding(userId, symbol);

    if (existingHolding) {
      // Calculate weighted average buy price
      const newAmount = existingHolding.amount + cryptoAmount;
      const newTotalInvested = existingHolding.totalInvested + totalUSD;
      const newAverageBuyPrice = newTotalInvested / newAmount;

      await this.portfolioRepository.upsertHolding(
        userId,
        symbol,
        newAmount,
        newAverageBuyPrice,
        newTotalInvested,
        session
      );
    } else {
      // First purchase of this crypto
      await this.portfolioRepository.upsertHolding(
        userId,
        symbol,
        cryptoAmount,
        currentPrice,
        totalUSD,
        session
      );
    }
  }

  /**
   * Get current price for a symbol
   */
  private async getCurrentPrice(symbol: CryptoSymbol): Promise<number> {
    const prices = await this.cryptoService.getPrices();
    const cryptoPrice = prices.find(p => p.symbol === symbol);

    if (!cryptoPrice) {
      throw new BadRequestError(`Preço não disponível para ${symbol}`);
    }

    return cryptoPrice.price;
  }
}
