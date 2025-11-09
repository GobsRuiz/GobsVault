import { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'
import { redis } from '../../cache/redis.client'
import { rateLimitConfigs } from '../../config/rate-limit.config'

export async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    ...rateLimitConfigs.authenticated,
    redis
  })
}

// Export das configs para uso nas rotas
export { rateLimitConfigs }