import Fastify, { FastifyInstance } from 'fastify'
import { env } from '../config/env.config'
import { securityPlugin } from './plugins/security.plugin'
import { corsPlugin } from './plugins/cors.plugin'
import { cookiePlugin } from './plugins/cookie.plugin'
import { rateLimitPlugin } from './plugins/rate-limit.plugin'
import { registerRequestIdHook } from './hooks/request-id.hook'
import { registerLoggingHook } from './hooks/logging.hook'
import { registerErrorHandler } from './handlers/error.handler'
import { healthRoutes } from '../monitoring/health.routes'
import { cryptoRoutes } from '../../api/routes/crypto.routes'
import { authRoutes } from '../../api/routes/auth.routes'

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: { level: env.LOG_LEVEL },
    connectionTimeout: 60000,
    keepAliveTimeout: 65000,
    requestTimeout: 30000
  })

  // Plugins (CORS must be registered before security/helmet)
  app.register(corsPlugin)
  app.register(securityPlugin)
  app.register(cookiePlugin)
  app.register(rateLimitPlugin)

  // Hooks
  registerRequestIdHook(app)
  registerLoggingHook(app)

  // Error Handler
  registerErrorHandler(app)

  // Routes
  app.register(healthRoutes)
  app.register(cryptoRoutes)
  app.register(authRoutes)

  return app
}