import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from '../../application/services/auth.service'
import { registerSchema, loginSchema, refreshTokenSchema } from '../../../../shared/schemas/auth.schema'
import { ValidationError } from '../../shared/errors/AppError'
import { Logger } from '../../shared/utils/logger.utils'
import { ZodError } from 'zod'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as any
    const email = body?.email
    const username = body?.username

    try {
      const validatedData = registerSchema.parse(request.body)

      const user = await this.authService.register(validatedData)

      Logger.registerAttempt(true, {
        userId: user._id.toString(),
        username: user.username,
        email: user.email
      }, request)

      const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance,
        xp: user.xp,
        level: user.level,
        totalTrades: user.totalTrades,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }

      reply.code(201).send({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: { user: userResponse }
      })
    } catch (error) {
      Logger.registerAttempt(false, {
        email,
        username,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, request)

      if (error instanceof ZodError) {
        throw new ValidationError('Dados inválidos', error.errors)
      }
      throw error
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = request.body as any
    const login = body?.login

    try {
      const validatedData = loginSchema.parse(request.body)

      const authResponse = await this.authService.login(validatedData, request)

      Logger.loginAttempt(true, {
        userId: authResponse.user.id,
        username: authResponse.user.username,
        email: authResponse.user.email,
        login: validatedData.login
      }, request)

      // Define os cookies com os tokens
      reply.cookie('accessToken', authResponse.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 15 * 60 // 15 minutos em segundos
      })

      reply.cookie('refreshToken', authResponse.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 // 7 dias em segundos
      })

      reply.code(200).send({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: authResponse.user
        }
      })
    } catch (error) {
      Logger.loginAttempt(false, {
        login,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, request)

      if (error instanceof ZodError) {
        throw new ValidationError('Dados inválidos', error.errors)
      }
      throw error
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Tenta pegar o refresh token do cookie ou do body
      const cookieToken = request.cookies.refreshToken
      const bodyData = refreshTokenSchema.safeParse(request.body)

      const refreshToken = cookieToken || (bodyData.success ? bodyData.data.refreshToken : null)

      if (!refreshToken) {
        throw new ValidationError('Refresh token não fornecido')
      }

      const tokens = await this.authService.refreshToken(refreshToken)

      Logger.refreshTokenAttempt(true, undefined, request)

      // Atualiza os cookies
      reply.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 15 * 60
      })

      reply.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60
      })

      reply.code(200).send({
        success: true,
        message: 'Tokens renovados com sucesso'
      })
    } catch (error) {
      Logger.refreshTokenAttempt(false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, request)

      if (error instanceof ZodError) {
        throw new ValidationError('Dados inválidos', error.errors)
      }
      throw error
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Obtém os tokens dos cookies
      const accessToken = request.cookies.accessToken
      const refreshToken = request.cookies.refreshToken

      if (accessToken || refreshToken) {
        // Adiciona os tokens à blacklist
        await this.authService.logout(
          accessToken || '',
          refreshToken
        )
      }

      // Remove os cookies
      reply.clearCookie('accessToken', { path: '/' })
      reply.clearCookie('refreshToken', { path: '/' })

      reply.code(200).send({
        success: true,
        message: 'Logout realizado com sucesso'
      })
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Dados inválidos', error.errors)
      }
      throw error
    }
  }

  async logoutAll(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Precisa estar autenticado para fazer logout-all
      if (!request.user) {
        throw new ValidationError('Usuário não autenticado')
      }

      // Revoga todos os tokens do usuário
      await this.authService.logoutAll(request.user.userId)

      // Remove os cookies do dispositivo atual
      reply.clearCookie('accessToken', { path: '/' })
      reply.clearCookie('refreshToken', { path: '/' })

      reply.code(200).send({
        success: true,
        message: 'Logout de todos os dispositivos realizado com sucesso'
      })
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Dados inválidos', error.errors)
      }
      throw error
    }
  }
}
