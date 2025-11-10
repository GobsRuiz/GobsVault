import { FastifyInstance } from 'fastify'
import { AuthController } from '../controllers/auth.controller'
import { AuthService } from '../../application/services/auth.service'
import { UserRepository } from '../../infrastructure/repositories/user.repository'
import { rateLimitConfigs } from '../../infrastructure/http/plugins/rate-limit.plugin'

export async function authRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository()
  const authService = new AuthService(userRepository)
  const authController = new AuthController(authService)

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
}
