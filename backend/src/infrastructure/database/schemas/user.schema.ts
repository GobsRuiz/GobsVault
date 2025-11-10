import { Schema, model } from 'mongoose'
import { IUserDocument } from '../../../domain/models/user.model'

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/
    },

    email: {
      type: String,
      required: true,
      unique: true,
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

    totalTrades: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
)

userSchema.index({ email: 1 })
userSchema.index({ username: 1 })

export const UserModel = model<IUserDocument>('User', userSchema)
