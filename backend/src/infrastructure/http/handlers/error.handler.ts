import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import { env } from '../../config/env.config'
import { AppError } from '../../../shared/errors/AppError'

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
    const isAppError = error instanceof AppError

    const statusCode = isAppError
      ? error.statusCode
      : (error.statusCode || 500)

    const errorCode = isAppError
      ? error.code
      : (error.code || 'INTERNAL_ERROR')

    const errorMessage = isAppError
      ? error.message
      : (env.NODE_ENV === 'production'
          ? 'Internal server error'
          : error.message)

    if (isAppError) {
      request.log.warn({
        requestId: request.id,
        errorType: 'AppError',
        code: errorCode,
        message: errorMessage,
        statusCode,
        url: request.url,
        method: request.method
      }, 'Expected application error')
    } else {
      request.log.error({
        requestId: request.id,
        errorType: 'UnexpectedError',
        err: error,
        req: {
          method: request.method,
          url: request.url,
          body: request.body,
          params: request.params,
          query: request.query,
          headers: request.headers
        }
      }, 'Unexpected error - This is a BUG!')
    }

    reply.code(statusCode).send({
      success: false,
      requestId: request.id,
      error: {
        code: errorCode,
        message: errorMessage,
        ...(env.NODE_ENV !== 'production' && !isAppError && error.stack
          ? { stack: error.stack }
          : {})
      }
    })
  })
}
