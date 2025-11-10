import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify'
import { JWTUtils, JWTPayload } from '../../shared/utils/jwt.utils'
import { UnauthorizedError } from '../../shared/errors/AppError'

// Estende o FastifyRequest para incluir o user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload
  }
}

/**
 * Middleware que verifica o JWT e anexa os dados do usuário ao request
 */
export function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  try {
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

    // Verifica o token
    const payload = JWTUtils.verifyAccessToken(token)

    // Anexa os dados do usuário ao request
    request.user = payload

    done()
  } catch (error) {
    done(error as Error)
  }
}

/**
 * Middleware opcional que verifica o JWT se fornecido, mas permite prosseguir sem ele
 */
export function optionalAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) {
  try {
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
      done()
      return
    }

    try {
      const payload = JWTUtils.verifyAccessToken(token)
      request.user = payload
    } catch {
      // Ignora erros de token inválido no modo opcional
      // O request.user ficará undefined
    }

    done()
  } catch (error) {
    done(error as Error)
  }
}
