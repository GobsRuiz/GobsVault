import { Schema, model } from 'mongoose';
import { IQuestDocument } from '../../../domain/models/quest.model';

const questSchema = new Schema<IQuestDocument>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    requirement: {
      type: {
        type: String,
        required: true,
        enum: ['TOTAL_TRADES', 'PORTFOLIO_DIVERSITY', 'NET_WORTH', 'PROFIT_PERCENTAGE']
      },
      value: {
        type: Number,
        required: true,
        min: 0
      }
    },

    reward: {
      xp: {
        type: Number,
        required: true,
        min: 0
      }
    }
  },
  {
    timestamps: true,
    collection: 'quests'
  }
);

// Note: title já tem índice único via { unique: true }
// Não é necessário criar índice explícito duplicado

export const QuestModel = model<IQuestDocument>('Quest', questSchema);
