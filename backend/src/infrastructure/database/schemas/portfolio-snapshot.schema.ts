import { Schema, model } from 'mongoose';
import { IPortfolioSnapshotDocument } from '../../../domain/models/portfolio-snapshot.model';

/**
 * Portfolio Snapshot Schema
 * Stores daily snapshots of portfolio value for historical charts
 */
const portfolioSnapshotSchema = new Schema<IPortfolioSnapshotDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    date: {
      type: Date,
      required: true
    },

    totalValue: {
      type: Number,
      required: true,
      min: 0
    },

    totalInvested: {
      type: Number,
      required: true,
      min: 0
    },

    profitLoss: {
      type: Number,
      required: true
    },

    profitLossPercent: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'portfolio_snapshots'
  }
);

// Compound index for efficient queries
portfolioSnapshotSchema.index({ userId: 1, date: -1 });

export const PortfolioSnapshotModel = model<IPortfolioSnapshotDocument>(
  'PortfolioSnapshot',
  portfolioSnapshotSchema
);
