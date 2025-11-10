import { CacheService } from './cache.service'
import { JWTUtils } from '../../shared/utils/jwt.utils'

export class TokenBlacklistService {
  private static readonly BLACKLIST_PREFIX = 'blacklist:token:'
  private static readonly BLACKLIST_USER_PREFIX = 'blacklist:user:'

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Adiciona um token à blacklist
   * O TTL é o tempo restante até o token expirar naturalmente
   */
  async addToken(token: string): Promise<void> {
    try {
      const decoded = JWTUtils.decode(token)
      if (!decoded) return

      // Calcula TTL baseado na expiração do token (exp está em segundos)
      const now = Math.floor(Date.now() / 1000)
      const exp = (decoded as any).exp
      const ttl = exp ? exp - now : 900 // 15min default se não tiver exp

      if (ttl > 0) {
        const key = `${TokenBlacklistService.BLACKLIST_PREFIX}${token}`
        await this.cacheService.set(key, 'revoked', ttl)
      }
    } catch (error) {
      console.error('Erro ao adicionar token à blacklist:', error)
    }
  }

  /**
   * Verifica se um token está na blacklist
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `${TokenBlacklistService.BLACKLIST_PREFIX}${token}`
      const value = await this.cacheService.get(key)
      return value === 'revoked'
    } catch (error) {
      console.error('Erro ao verificar blacklist:', error)
      return false // Fail-safe: se Redis falhar, permite o token
    }
  }

  /**
   * Revoga todos os tokens de um usuário
   * Útil para logout global ou quando a senha é alterada
   */
  async revokeAllUserTokens(userId: string, ttl: number = 604800): Promise<void> {
    try {
      // Marca o usuário como revogado por 7 dias (tempo máximo do refresh token)
      const key = `${TokenBlacklistService.BLACKLIST_USER_PREFIX}${userId}`
      const timestamp = Date.now()
      await this.cacheService.set(key, timestamp.toString(), ttl)
    } catch (error) {
      console.error('Erro ao revogar todos os tokens do usuário:', error)
    }
  }

  /**
   * Verifica se todos os tokens do usuário foram revogados
   */
  async areUserTokensRevoked(userId: string, tokenIssuedAt: number): Promise<boolean> {
    try {
      const key = `${TokenBlacklistService.BLACKLIST_USER_PREFIX}${userId}`
      const revokedAt = await this.cacheService.get(key)

      if (!revokedAt) return false

      // Compara timestamp de revogação com timestamp de emissão do token
      const revokedTimestamp = parseInt(revokedAt, 10)
      const tokenTimestamp = tokenIssuedAt * 1000 // JWT iat está em segundos

      return revokedTimestamp > tokenTimestamp
    } catch (error) {
      console.error('Erro ao verificar revogação de tokens do usuário:', error)
      return false
    }
  }

  /**
   * Remove um usuário da blacklist (usado quando os tokens expiram naturalmente)
   */
  async removeUserRevocation(userId: string): Promise<void> {
    try {
      const key = `${TokenBlacklistService.BLACKLIST_USER_PREFIX}${userId}`
      await this.cacheService.delete(key)
    } catch (error) {
      console.error('Erro ao remover revogação do usuário:', error)
    }
  }
}
