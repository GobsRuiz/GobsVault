import jwt from 'jsonwebtoken'
import { env } from '../../infrastructure/config/env.config'
import { UnauthorizedError } from '../errors/AppError'

export interface JWTPayload {
  userId: string
  email: string
  username: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export class JWTUtils {
  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    })
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN
    })
  }

  static generateTokenPair(payload: JWTPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    }
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JWTPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expirado')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Token inválido')
      }
      throw new UnauthorizedError('Falha ao verificar token')
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Refresh token expirado')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Refresh token inválido')
      }
      throw new UnauthorizedError('Falha ao verificar refresh token')
    }
  }

  static decode(token: string): JWTPayload | null {
    return jwt.decode(token) as JWTPayload | null
  }
}
