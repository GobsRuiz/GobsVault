import { Document } from 'mongoose';
import { PortfolioSnapshot } from '../types/portfolio.types';

/**
 * Portfolio Snapshot document interface extending Mongoose Document
 */
export interface IPortfolioSnapshotDocument extends Omit<PortfolioSnapshot, 'id'>, Document {
  _id: string;
}
