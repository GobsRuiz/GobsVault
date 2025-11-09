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