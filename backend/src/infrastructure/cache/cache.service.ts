import { Redis } from 'ioredis'
import type { Logger } from 'pino'
import { ICacheService, CacheStats } from '../../domain/interfaces/cache.interface'
import { CacheError, CacheConnectionError, CacheSerializationError } from '../../shared/errors/AppError'
import { env } from '../config/env.config'

class CacheService implements ICacheService {
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    errors: 0,
    sets: 0,
    deletes: 0
  }

  constructor(
    private readonly redisClient: Redis,
    private readonly logger?: Logger,
    private readonly defaultTTL: number = env.CACHE_TTL_DEFAULT
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key)

      if (data === null) {
        this.stats.misses++
        this.logger?.debug({ key }, 'Cache miss')
        return null
      }

      try {
        const parsed = JSON.parse(data) as T
        this.stats.hits++
        this.logger?.debug({ key }, 'Cache hit')
        return parsed
      } catch (parseError) {
        this.stats.errors++
        this.logger?.warn({ key, error: parseError }, 'Cache deserialization failed, returning null')
        return null
      }
    } catch (error) {
      this.stats.errors++

      if (this.isConnectionError(error)) {
        this.logger?.warn({ key, error }, 'Cache unavailable, continuing without cache')
        return null
      }

      this.logger?.error({ key, error }, 'Cache get operation failed')
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTTL

    try {
      const serialized = JSON.stringify(value)
      await this.redisClient.setex(key, ttl, serialized)

      this.stats.sets++
      this.logger?.debug({ key, ttl }, 'Cache set')
    } catch (error) {
      this.stats.errors++

      if (this.isConnectionError(error)) {
        this.logger?.warn({ key, error }, 'Cache unavailable, skipping cache set')
        return
      }

      this.logger?.error({ key, ttl, error }, 'Cache set operation failed')
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key)
      this.stats.deletes++
      this.logger?.debug({ key }, 'Cache delete')
    } catch (error) {
      this.stats.errors++

      if (this.isConnectionError(error)) {
        this.logger?.warn({ key, error }, 'Cache unavailable, skipping cache delete')
        return
      }

      this.logger?.error({ key, error }, 'Cache delete operation failed')
    }
  }

  /**
   * CRITICAL: Uses SCAN instead of KEYS to avoid blocking Redis in production.
   * SCAN iterates incrementally - safe for large datasets.
   */
  async invalidatePattern(pattern: string): Promise<number> {
    let deletedCount = 0
    let cursor = '0'
    const batchSize = 100

    try {
      do {
        const [newCursor, keys] = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize)
        cursor = newCursor

        if (keys.length > 0) {
          const pipeline = this.redisClient.pipeline()
          keys.forEach(key => pipeline.del(key))
          await pipeline.exec()

          deletedCount += keys.length
          this.stats.deletes += keys.length
        }
      } while (cursor !== '0')

      this.logger?.info({ pattern, deletedCount }, 'Cache pattern invalidated')
      return deletedCount
    } catch (error) {
      this.stats.errors++

      if (this.isConnectionError(error)) {
        this.logger?.warn({ pattern, error }, 'Cache unavailable, pattern invalidation skipped')
        return 0
      }

      this.logger?.error({ pattern, error }, 'Cache pattern invalidation failed')
      throw new CacheError(`Cache invalidation failed for pattern "${pattern}"`, 'invalidate', pattern)
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.redisClient.ping()
      return result === 'PONG'
    } catch (error) {
      this.logger?.error({ error }, 'Cache health check failed')
      return false
    }
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      sets: 0,
      deletes: 0
    }
    this.logger?.info('Cache stats reset')
  }

  async disconnect(): Promise<void> {
    try {
      await this.redisClient.quit()
      this.logger?.info('Cache disconnected gracefully')
    } catch (error) {
      this.logger?.error({ error }, 'Error during cache disconnect')
      throw new CacheError('Failed to disconnect from cache')
    }
  }

  private isConnectionError(error: unknown): boolean {
    if (!(error instanceof Error)) return false

    const connectionErrorMessages = [
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'Connection is closed',
      'Socket closed unexpectedly'
    ]

    return connectionErrorMessages.some(msg => error.message.includes(msg))
  }
}

export { CacheService }
