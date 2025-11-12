import bcrypt from 'bcrypt'
import type { FastifyRequest } from 'fastify'
import { IUserRepository } from '../../domain/interfaces/user-repository.interface'
import { IUserDocument } from '../../domain/models/user.model'
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors/AppError'
import { JWTUtils, TokenPair } from '../../shared/utils/jwt.utils'
import { Logger } from '../../shared/utils/logger.utils'

export interface AuthResponse {
  user: {
    id: string
    username: string
    email: string
    balance: number
    xp: number
    level: number
  }
  tokens: TokenPair
}

export class AuthService {
  private readonly BCRYPT_ROUNDS = 12

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenBlacklistService?: any // Optional para não quebrar código existente
  ) {}

  async register(data: {
    username: string
    email: string
    password: string
  }): Promise<IUserDocument> {
    const { username, email, password } = data

    const [emailExists, usernameExists] = await Promise.all([
      this.userRepository.existsByEmail(email),
      this.userRepository.existsByUsername(username)
    ])

    if (emailExists) {
      throw new ConflictError('Email já está em uso', 'email')
    }

    if (usernameExists) {
      throw new ConflictError('Username já está em uso', 'username')
    }

    const hashedPassword = await bcrypt.hash(password, this.BCRYPT_ROUNDS)

    const user = await this.userRepository.create({
      username,
      email,
      password: hashedPassword
    })

    return user
  }

  async login(
    credentials: {
      login: string // email ou username
      password: string
    },
    request?: FastifyRequest
  ): Promise<AuthResponse> {
    const { login, password } = credentials

    // Busca por email ou username
    const user = login.includes('@')
      ? await this.userRepository.findByEmail(login)
      : await this.userRepository.findByUsername(login)

    // Unifica mensagens para prevenir enumeration attack
    if (!user || !user.isActive) {
      // Log interno detalhado (não exposto ao cliente)
      Logger.warn('Login falhou - Usuário não encontrado ou inativo', {
        login,
        reason: !user ? 'user_not_found' : 'user_inactive'
      }, request)

      throw new UnauthorizedError('Credenciais inválidas')
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      // Log interno detalhado (não exposto ao cliente)
      Logger.warn('Login falhou - Senha incorreta', {
        userId: user._id.toString(),
        login
      }, request)

      throw new UnauthorizedError('Credenciais inválidas')
    }

    // Gera tokens
    const tokens = JWTUtils.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    })

    // Retorna dados do usuário sem a senha
    return {
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        balance: user.balance,
        xp: user.xp,
        level: user.level
      },
      tokens
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Verifica o refresh token (já retorna payload com iat e exp)
    const payload = JWTUtils.verifyRefreshToken(refreshToken)

    // Verifica se o usuário ainda existe e está ativo
    const user = await this.userRepository.findById(payload.userId)
    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Usuário desativado')
    }

    // Verifica se o token do usuário foi revogado
    if (this.tokenBlacklistService) {
      const isRevoked = await this.tokenBlacklistService.areUserTokensRevoked(
        payload.userId,
        payload.iat
      )
      if (isRevoked) {
        throw new UnauthorizedError('Token revogado')
      }

      // REFRESH TOKEN ROTATION: Invalida o refresh token atual
      // Isso garante que cada refresh token só pode ser usado uma vez
      await this.tokenBlacklistService.addToken(refreshToken)
    }

    // Verifica se a senha foi alterada após a emissão do token
    if (user.passwordChangedAt) {
      const tokenIssuedAt = payload.iat * 1000 // Converte para milliseconds

      if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
        throw new UnauthorizedError('Senha foi alterada. Por favor, faça login novamente')
      }
    }

    // Gera novo par de tokens
    return JWTUtils.generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      username: user.username
    })
  }

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    if (!this.tokenBlacklistService) {
      Logger.warn('Token blacklist service não disponível - logout não invalidará tokens')
      return
    }

    // Adiciona access token à blacklist
    await this.tokenBlacklistService.addToken(accessToken)

    // Adiciona refresh token à blacklist se fornecido
    if (refreshToken) {
      await this.tokenBlacklistService.addToken(refreshToken)
    }
  }

  async logoutAll(userId: string): Promise<void> {
    if (!this.tokenBlacklistService) {
      Logger.warn('Token blacklist service não disponível - logoutAll não invalidará tokens')
      return
    }

    // Revoga todos os tokens do usuário
    await this.tokenBlacklistService.revokeAllUserTokens(userId)
  }
}
