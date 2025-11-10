import { Document } from 'mongoose';
import { Portfolio } from '../types/portfolio.types';

/**
 * Portfolio document interface extending Mongoose Document
 */
export interface IPortfolioDocument extends Omit<Portfolio, 'id'>, Document {
  _id: string;
}
