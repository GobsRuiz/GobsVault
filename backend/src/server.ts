import { buildApp } from './infrastructure/http/server'
import { redis } from './infrastructure/cache'
import { env } from './infrastructure/config/env.config'
import { FastifyInstance } from 'fastify'

async function checkRedisConnection(): Promise<void> {
  try {
    await redis.ping()
  } catch (error) {
    throw new Error('Failed to connect to Redis', { cause: error })
  }
}

async function start() {
  const app = buildApp()

  try {
    await checkRedisConnection()
    app.log.info('Redis connection verified')

    await app.listen({ port: env.PORT, host: env.HOST })
    
    console.log(`
      🚀 Server running!
      📍 URL: http://localhost:${env.PORT}
      🏥 Health: http://localhost:${env.PORT}/health
      🌍 Environment: ${env.NODE_ENV}
      ⚡ Redis: Connected
    `)
  } catch (err) {
    app.log.error(err, 'Failed to start server')
    process.exit(1)
  }

  setupGracefulShutdown(app)
}

function setupGracefulShutdown(app: FastifyInstance) {
  async function gracefulShutdown(signal: string) {
    console.log(`\n${signal} received, closing server gracefully...`)

    try {
      await app.close()
      app.log.info('Fastify server closed')

      await redis.quit()
      app.log.info('Redis disconnected')

      console.log('Graceful shutdown completed')
      process.exit(0)
    } catch (error) {
      app.log.error(error, 'Error during graceful shutdown')
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('unhandledRejection', (reason, promise) => {
    app.log.error({ reason, promise }, 'Unhandled Promise Rejection')
  })
  process.on('uncaughtException', (error) => {
    app.log.error({ error }, 'Uncaught Exception')
    gracefulShutdown('uncaughtException')
  })
}

start()

export { buildApp, env }