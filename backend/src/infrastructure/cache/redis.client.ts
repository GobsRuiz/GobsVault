import Redis from 'ioredis'
import { env } from '../config/env.config'

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,

  connectTimeout: env.REDIS_CONNECT_TIMEOUT,
  commandTimeout: env.REDIS_COMMAND_TIMEOUT,
  keepAlive: 30000,

  retryStrategy: (times: number) => {
    if (times > env.REDIS_MAX_RETRIES) {
      return null
    }
    return Math.min(times * 50, 2000)
  },

  maxRetriesPerRequest: env.REDIS_MAX_RETRIES,

  reconnectOnError: (err) => {
    const targetError = 'READONLY'
    if (err.message.includes(targetError)) {
      return true
    }
    return false
  },

  enableOfflineQueue: true,
  showFriendlyErrorStack: env.NODE_ENV !== 'production'
})

export { redis }
