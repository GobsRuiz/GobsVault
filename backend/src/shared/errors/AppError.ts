export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ExternalAPIError extends AppError {
  constructor(message: string = 'External API error') {
    super(message, 502, 'EXTERNAL_API_ERROR')
  }
}

export class CacheError extends AppError {
  constructor(
    message: string = 'Cache operation failed',
    public readonly operation?: string,
    public readonly key?: string
  ) {
    super(message, 500, 'CACHE_ERROR')
  }
}

export class CacheConnectionError extends CacheError {
  constructor(message: string = 'Cache connection failed') {
    super(message)
    this.code = 'CACHE_CONNECTION_ERROR'
  }
}

export class CacheSerializationError extends CacheError {
  constructor(key: string, message: string = 'Failed to serialize/deserialize cache data') {
    super(message, 'serialization', key)
    this.code = 'CACHE_SERIALIZATION_ERROR'
  }
}