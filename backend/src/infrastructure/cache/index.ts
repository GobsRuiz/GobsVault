import type { Logger } from 'pino'
import { redis } from './redis.client'
import { CacheService } from './cache.service'
import { ICacheService } from '../../domain/interfaces/cache.interface'

export function createCacheService(logger?: Logger): ICacheService {
  return new CacheService(redis, logger)
}

export const cacheService = new CacheService(redis)

export { CacheService } from './cache.service'
export { redis } from './redis.client'
export type { ICacheService } from '../../domain/interfaces/cache.interface'
