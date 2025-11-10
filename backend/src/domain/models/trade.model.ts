import { Document } from 'mongoose';
import { Trade } from '../types/trade.types';

/**
 * Trade document interface extending Mongoose Document
 */
export interface ITradeDocument extends Omit<Trade, 'id'>, Document {
  _id: string;
}
