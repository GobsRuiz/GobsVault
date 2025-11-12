import { Document } from 'mongoose';
import { Quest } from '../types/quest.types';

/**
 * Quest document interface extending Mongoose Document
 */
export interface IQuestDocument extends Omit<Quest, 'id'>, Document {
  _id: string;
}
