import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { AuthService } from '../../application/services/auth.service'
import { UserRepository } from '../../infrastructure/repositories/user.repository'
import { CacheService } from '../../infrastructure/cache/cache.service'
import { TokenBlacklistService } from '../../infrastructure/cache/token-blacklist.service'
import { redis } from '../../infrastructure/cache/redis.client'
import { authMiddleware } from '../middlewares/auth.middleware'
import { rateLimitConfigs } from '../../infrastructure/http/plugins/rate-limit.plugin'

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository()
  const cacheService = new CacheService(redis)
  const tokenBlacklistService = new TokenBlacklistService(cacheService)
  const authService = new AuthService(userRepository, tokenBlacklistService)
  const authController = new AuthController(authService)
  const authHandler = authMiddleware(tokenBlacklistService)

  // Registro de usuário
  app.post('/api/auth/register', {
    config: { rateLimit: rateLimitConfigs.public }
  }, async (request, reply) => {
    return authController.register(request, reply)
  })

  // Login
  app.post('/api/auth/login', {
    config: { rateLimit: rateLimitConfigs.public }
  }, async (request, reply) => {
    return authController.login(request, reply)
  })

  // Refresh token
  app.post('/api/auth/refresh', {
    config: { rateLimit: rateLimitConfigs.public }
  }, async (request, reply) => {
    return authController.refreshToken(request, reply)
  })

  // Logout (dispositivo atual)
  app.post('/api/auth/logout', {
    config: { rateLimit: rateLimitConfigs.public }
  }, async (request, reply) => {
    return authController.logout(request, reply)
  })

  // Logout de todos os dispositivos (requer autenticação)
  app.post('/api/auth/logout-all', {
    preHandler: [authHandler],
    config: { rateLimit: rateLimitConfigs.public }
  }, async (request, reply) => {
    return authController.logoutAll(request, reply)
  })
}
