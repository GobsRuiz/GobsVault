import { Schema, model } from 'mongoose'
import { IUserDocument } from '../../../domain/models/user.model'

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    balance: {
      type: Number,
      default: 10000,
      min: 0
    },

    xp: {
      type: Number,
      default: 0,
      min: 0
    },

    level: {
      type: Number,
      default: 1,
      min: 1
    },

    rank: {
      type: String,
      enum: ['INICIANTE', 'BRONZE', 'PRATA', 'OURO', 'DIAMANTE'],
      default: 'INICIANTE'
    },

    totalTrades: {
      type: Number,
      default: 0,
      min: 0
    },

    questProgress: [
      {
        questId: {
          type: String,
          required: true
        },
        progress: {
          type: Number,
          default: 0,
          min: 0
        },
        completed: {
          type: Boolean,
          default: false
        },
        claimed: {
          type: Boolean,
          default: false
        },
        completedAt: {
          type: Date
        },
        claimedAt: {
          type: Date
        }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'users'
  }
)

// Índices únicos para email e username
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ username: 1 }, { unique: true })

export const UserModel = model<IUserDocument>('User', userSchema)
