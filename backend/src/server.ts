import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'

import { cryptoRoutes } from './api/routes/crypto.routes'
import { redis } from './infrastructure/cache/redis.client'



function validateEnvVars() {
  const requiredVars = ['COOKIE_SECRET']
  const missingVars: string[] = []

  if (process.env.NODE_ENV === 'production') {
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName)
      }
    })

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missingVars.join(', ')}`
      )
    }
  }


  if (process.env.NODE_ENV !== 'production') {
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        console.warn(`⚠️  ${varName} not set, using fallback (DEV ONLY)`)
      }
    })
  }
}



const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
})



await app.register(helmet, {
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  crossOriginOpenerPolicy: process.env.NODE_ENV === 'production',
  crossOriginResourcePolicy: process.env.NODE_ENV === 'production',
  hsts: process.env.NODE_ENV === 'production' 
    ? { maxAge: 31536000, includeSubDomains: true }
    : false
})

await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH']
})

await app.register(cookie, {
  secret: process.env.COOKIE_SECRET
})

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  redis: redis,
  // allowList: (req) => req.ip === '127.0.0.1',
  
  errorResponseBuilder: () => ({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  })
})




await app.register(cryptoRoutes)



// Health check
app.get('/health', async (request, reply) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      redis: 'unknown'
    }
  }

  try {
    // Verifica conexão Redis (ioredis)
    await redis.ping()
    health.checks.redis = 'healthy'
  } 
  catch (error) {
    health.checks.redis = 'unhealthy'
    health.status = 'degraded'
    app.log.error({ error }, 'Redis health check failed')
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  return reply.code(statusCode).send(health)
})

// Error handler global
app.setErrorHandler((error, request, reply) => {
  app.log.error({
    err: error,
    req: {
      method: request.method,
      url: request.url,
      headers: request.headers
    }
  }, 'Request error')
  
  const statusCode = error.statusCode || 500
  const isDev = process.env.NODE_ENV !== 'production'
  
  reply.code(statusCode).send({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: isDev ? error.message : 'Internal server error',
        ...(isDev && error.stack ? { stack: error.stack } : {})
    }
  })
})




const start = async () => {
  try {
    validateEnvVars()

    const port = Number(process.env.PORT) || 4000
    const host = process.env.HOST || '0.0.0.0'
    
    await app.listen({ port, host })
    
    console.log(`
      🚀 Server running!
      📍 URL: http://localhost:${port}
      🏥 Health: http://localhost:${port}/health
      🌍 Environment: ${process.env.NODE_ENV || 'development'}
      ⚡ Redis: Connected
    `)
  } 
  catch (err) {
    app.log.error(err, 'Failed to start server')
    process.exit(1)
  }
}



// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n${signal} received, closing server gracefully...`)

  try {
    await app.close()
    app.log.info('✅ Fastify server closed')

    await redis.quit()
    app.log.info('✅ Redis disconnected')

    console.log('✅ Graceful shutdown completed')
    process.exit(0)
  } 
  catch (error) {
    app.log.error(error, 'Error during graceful shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('unhandledRejection', (reason, promise) => {
  app.log.error({ reason, promise }, 'Unhandled Promise Rejection')
  gracefulShutdown('unhandledRejection')
})

process.on('uncaughtException', (error) => {
  app.log.error({ error }, 'Uncaught Exception')
  gracefulShutdown('uncaughtException')
})



start()