import { ClientSession } from 'mongoose';
import { ITradeRepository } from '../../domain/interfaces/trade-repository.interface';
import { ITradeDocument } from '../../domain/models/trade.model';
import { TradeType, CryptoSymbol, TradeStatus } from '../../domain/types/trade.types';
import { TradeModel } from '../database/schemas/trade.schema';

export class TradeRepository implements ITradeRepository {
  async create(
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
  ): Promise<ITradeDocument> {
    const [trade] = await TradeModel.create([data], { session });
    return trade;
  }

  async findById(id: string): Promise<ITradeDocument | null> {
    return await TradeModel.findById(id);
  }

  async findByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      symbol?: CryptoSymbol;
      type?: TradeType;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ITradeDocument[]> {
    const query: Record<string, unknown> = { userId };

    if (options?.symbol) {
      query.symbol = options.symbol;
    }

    if (options?.type) {
      query.type = options.type;
    }

    if (options?.startDate || options?.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        (query.timestamp as Record<string, unknown>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.timestamp as Record<string, unknown>).$lte = options.endDate;
      }
    }

    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    return await TradeModel.find(query)
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit);
  }

  async countByUserId(userId: string): Promise<number> {
    return await TradeModel.countDocuments({ userId });
  }

  async getTradeStats(userId: string): Promise<{
    totalTrades: number;
    totalBuys: number;
    totalSells: number;
    totalVolume: number;
  }> {
    const stats = await TradeModel.aggregate([
      { $match: { userId, status: 'COMPLETED' } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalBuys: {
            $sum: { $cond: [{ $eq: ['$type', 'BUY'] }, 1, 0] }
          },
          totalSells: {
            $sum: { $cond: [{ $eq: ['$type', 'SELL'] }, 1, 0] }
          },
          totalVolume: { $sum: '$total' }
        }
      }
    ]);

    if (stats.length === 0) {
      return {
        totalTrades: 0,
        totalBuys: 0,
        totalSells: 0,
        totalVolume: 0
      };
    }

    return stats[0];
  }
}
