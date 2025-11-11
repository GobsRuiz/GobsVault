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
      unique: true
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

export const PortfolioModel = model<IPortfolioDocument>('Portfolio', portfolioSchema);
