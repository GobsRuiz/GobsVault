import { Schema, model } from 'mongoose';
import { IPortfolioDocument } from '../../../domain/models/portfolio.model';

const holdingSchema = new Schema(
  {
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

    averageBuyPrice: {
      type: Number,
      required: true,
      min: 0
    },

    totalInvested: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const portfolioSchema = new Schema<IPortfolioDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    holdings: {
      type: [holdingSchema],
      default: []
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    collection: 'portfolios'
  }
);

// Ensure userId is unique
portfolioSchema.index({ userId: 1 }, { unique: true });

export const PortfolioModel = model<IPortfolioDocument>('Portfolio', portfolioSchema);
