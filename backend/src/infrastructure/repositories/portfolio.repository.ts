import { ClientSession } from 'mongoose';
import { IPortfolioRepository } from '../../domain/interfaces/portfolio-repository.interface';
import { IPortfolioDocument } from '../../domain/models/portfolio.model';
import { CryptoSymbol, Holding } from '../../domain/types/portfolio.types';
import { PortfolioModel } from '../database/schemas/portfolio.schema';

export class PortfolioRepository implements IPortfolioRepository {
  async findByUserId(userId: string): Promise<IPortfolioDocument | null> {
    return await PortfolioModel.findOne({ userId });
  }

  async create(userId: string, session?: ClientSession): Promise<IPortfolioDocument> {
    const [portfolio] = await PortfolioModel.create(
      [{ userId, holdings: [] }],
      { session }
    );
    return portfolio;
  }

  async getOrCreate(userId: string, session?: ClientSession): Promise<IPortfolioDocument> {
    let portfolio = await this.findByUserId(userId);

    if (!portfolio) {
      portfolio = await this.create(userId, session);
    }

    return portfolio;
  }

  async upsertHolding(
    userId: string,
    symbol: CryptoSymbol,
    amount: number,
    averageBuyPrice: number,
    totalInvested: number,
    session?: ClientSession
  ): Promise<IPortfolioDocument> {
    const portfolio = await PortfolioModel.findOneAndUpdate(
      { userId, 'holdings.symbol': symbol },
      {
        $set: {
          'holdings.$.amount': amount,
          'holdings.$.averageBuyPrice': averageBuyPrice,
          'holdings.$.totalInvested': totalInvested
        }
      },
      { new: true, session }
    );

    if (portfolio) {
      return portfolio;
    }

    // If holding doesn't exist, add it
    const updatedPortfolio = await PortfolioModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          holdings: {
            symbol,
            amount,
            averageBuyPrice,
            totalInvested
          }
        }
      },
      { new: true, upsert: true, session }
    );

    return updatedPortfolio!;
  }

  async updateHoldingAmount(
    userId: string,
    symbol: CryptoSymbol,
    newAmount: number,
    session?: ClientSession
  ): Promise<IPortfolioDocument | null> {
    if (newAmount <= 0) {
      return await this.removeHolding(userId, symbol, session);
    }

    return await PortfolioModel.findOneAndUpdate(
      { userId, 'holdings.symbol': symbol },
      {
        $set: {
          'holdings.$.amount': newAmount
        }
      },
      { new: true, session }
    );
  }

  async getHolding(userId: string, symbol: CryptoSymbol): Promise<Holding | null> {
    const portfolio = await PortfolioModel.findOne(
      { userId, 'holdings.symbol': symbol },
      { 'holdings.$': 1 }
    );

    if (!portfolio || portfolio.holdings.length === 0) {
      return null;
    }

    return portfolio.holdings[0];
  }

  async removeHolding(
    userId: string,
    symbol: CryptoSymbol,
    session?: ClientSession
  ): Promise<IPortfolioDocument | null> {
    return await PortfolioModel.findOneAndUpdate(
      { userId },
      {
        $pull: {
          holdings: { symbol }
        }
      },
      { new: true, session }
    );
  }
}
