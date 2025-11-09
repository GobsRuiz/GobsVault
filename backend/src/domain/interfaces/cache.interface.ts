/**
 * Interface for cache operations following Clean Architecture principles.
 * Infrastructure layer implements this interface, allowing domain/application
 * layers to depend on abstractions rather than concrete implementations.
 */
export interface ICacheService {
  /**
   * Retrieves a value from cache
   * @param key - Cache key
   * @returns Parsed value or null if not found
   * @throws CacheError if connection fails or parsing fails
   */
  get<T>(key: string): Promise<T | null>

  /**
   * Stores a value in cache with TTL
   * @param key - Cache key
   * @param value - Value to store (will be JSON stringified)
   * @param ttlSeconds - Time to live in seconds (optional, uses default if not provided)
   * @throws CacheError if connection fails or serialization fails
   */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>

  /**
   * Deletes a single key from cache
   * @param key - Cache key to delete
   * @throws CacheError if connection fails
   */
  del(key: string): Promise<void>

  /**
   * Deletes multiple keys matching a pattern using SCAN (non-blocking)
   * @param pattern - Redis pattern (e.g., "user:*", "session:123:*")
   * @throws CacheError if connection fails
   */
  invalidatePattern(pattern: string): Promise<number>

  /**
   * Checks if cache is healthy and responsive
   * @returns true if cache is operational, false otherwise
   */
  isHealthy(): Promise<boolean>

  /**
   * Gets cache statistics (hits, misses, errors)
   * @returns Cache metrics object
   */
  getStats(): CacheStats

  /**
   * Resets cache statistics
   */
  resetStats(): void

  /**
   * Disconnects from cache gracefully
   */
  disconnect(): Promise<void>
}

export interface CacheStats {
  hits: number
  misses: number
  errors: number
  sets: number
  deletes: number
}
