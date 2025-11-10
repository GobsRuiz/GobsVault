import { Schema, model } from 'mongoose';
import { ITradeDocument } from '../../../domain/models/trade.model';

const tradeSchema = new Schema<ITradeDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    type: {
      type: String,
      required: true,
      enum: ['BUY', 'SELL']
    },

    symbol: {
      type: String,
      required: true,
      enum: ['BTC', 'ETH', 'BNB', 'SOL', 'ADA']
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      required: true,
      enum: ['COMPLETED', 'FAILED'],
      default: 'COMPLETED'
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },

    errorMessage: {
      type: String,
      required: false
    }
  },
  {
    timestamps: false,
    collection: 'trades'
  }
);

// Compound indexes for efficient queries
tradeSchema.index({ userId: 1, timestamp: -1 });
tradeSchema.index({ userId: 1, symbol: 1 });
tradeSchema.index({ userId: 1, type: 1 });

export const TradeModel = model<ITradeDocument>('Trade', tradeSchema);
