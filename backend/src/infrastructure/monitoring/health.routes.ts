import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { redis } from '../cache/redis.client'
import { rateLimitConfigs } from '../http/plugins/rate-limit.plugin'
import { env } from '../config/env.config'

interface HealthCheck {
  status: 'ok' | 'degraded'
  timestamp: string
  uptime: number
  environment: string
  checks: {
    redis: 'healthy' | 'unhealthy'
    binance: 'healthy' | 'degraded' | 'unhealthy'
  }
}

async function checkRedis(): Promise<'healthy' | 'unhealthy'> {
  try {
    await redis.ping()
    return 'healthy'
  } catch {
    return 'unhealthy'
  }
}

async function checkBinance(): Promise<'healthy' | 'degraded' | 'unhealthy'> {
  try {
    const start = Date.now()
    await axios.get('https://api.binance.com/api/v3/ping', { timeout: 3000 })
    const latency = Date.now() - start

    if (latency > 2000) return 'degraded'
    return 'healthy'
  } catch {
    return 'unhealthy'
  }
}

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', {
    config: { rateLimit: rateLimitConfigs.public }
  }, async (request, reply) => {
    const [redisStatus, binanceStatus] = await Promise.all([
      checkRedis(),
      checkBinance()
    ])

    const health: HealthCheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      checks: {
        redis: redisStatus,
        binance: binanceStatus
      }
    }

    if (redisStatus === 'unhealthy' || binanceStatus === 'unhealthy' || binanceStatus === 'degraded') {
      health.status = 'degraded'
    }

    const statusCode = health.status === 'ok' ? 200 : 503
    return reply.code(statusCode).send(health)
  })
}
