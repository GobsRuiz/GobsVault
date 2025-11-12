import { FastifyRequest, FastifyReply } from 'fastify'
import { JWTUtils, JWTPayload } from '../../shared/utils/jwt.utils'
import { UnauthorizedError } from '../../shared/errors/AppError'
import { TokenBlacklistService } from '../../infrastructure/cache/token-blacklist.service'

// Estende o FastifyRequest para incluir o user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
  }
}

/**
 * Middleware que verifica o JWT e anexa os dados do usuário ao request
 * Aceita TokenBlacklistService opcional para verificar tokens revogados
 */
export function authMiddleware(
  tokenBlacklistService?: TokenBlacklistService
) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    // Tenta obter o token do header Authorization ou do cookie
    const authHeader = request.headers.authorization
    const cookieToken = request.cookies.accessToken

    let token: string | undefined

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }

    if (!token) {
      throw new UnauthorizedError('Token não fornecido')
    }

    // Verifica o token (já retorna payload com iat e exp)
    const payload = JWTUtils.verifyAccessToken(token)

    // Verifica se o token está na blacklist
    if (tokenBlacklistService) {
      const isBlacklisted = await tokenBlacklistService.isBlacklisted(token)
      if (isBlacklisted) {
        throw new UnauthorizedError('Token revogado')
      }

      // Verifica se todos os tokens do usuário foram revogados
      const areUserTokensRevoked = await tokenBlacklistService.areUserTokensRevoked(
        payload.userId,
        payload.iat
      )
      if (areUserTokensRevoked) {
        throw new UnauthorizedError('Sessão expirada. Por favor, faça login novamente')
      }
    }

    // Anexa os dados do usuário ao request (apenas campos base, sem iat/exp)
    request.user = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username
    }
  }
}

/**
 * Middleware opcional que verifica o JWT se fornecido, mas permite prosseguir sem ele
 */
export async function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization
  const cookieToken = request.cookies.accessToken

  let token: string | undefined

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  } else if (cookieToken) {
    token = cookieToken
  }

  // Se não houver token, prossegue sem autenticação
  if (!token) {
    return
  }

  try {
    const payload = JWTUtils.verifyAccessToken(token)
    request.user = payload
  } catch {
    // Ignora erros de token inválido no modo opcional
    // O request.user ficará undefined
  }
}
