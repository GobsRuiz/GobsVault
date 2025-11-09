import mongoose from 'mongoose'
import { env } from '../config/env.config.js'

class MongoDBClient {
  private static instance: MongoDBClient
  private isConnected = false

  private constructor() {}

  static getInstance(): MongoDBClient {
    if (!MongoDBClient.instance) {
      MongoDBClient.instance = new MongoDBClient()
    }
    return MongoDBClient.instance
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      })

      this.isConnected = true

      mongoose.connection.on('error', (error) => {
        this.isConnected = false
        throw error
      })

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false
      })

      mongoose.connection.on('reconnected', () => {
        this.isConnected = true
      })
    } catch (error) {
      this.isConnected = false
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    await mongoose.disconnect()
    this.isConnected = false
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false
      }

      const state = mongoose.connection.readyState
      return state === 1
    } catch {
      return false
    }
  }

  getConnection() {
    return mongoose.connection
  }
}

export const mongoClient = MongoDBClient.getInstance()
