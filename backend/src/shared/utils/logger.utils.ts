import type { FastifyRequest } from 'fastify'
import { env } from '../../infrastructure/config/env.config'

enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface BaseLogData {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  requestId?: string
}

/**
 * Logger centralizado que integra com Fastify logger quando disponível
 *
 * Uso:
 * - Em controllers: Logger.info('msg', { data }, request) -> usa Fastify logger com requestId
 * - Em services: Logger.info('msg', { data }) -> usa console log
 */
export class Logger {
  private static formatConsoleLog(data: BaseLogData): string {
    return JSON.stringify({
      ...data,
      env: env.NODE_ENV
    })
  }

  /**
   * Log de informação
   */
  static info(message: string, context?: Record<string, any>, request?: FastifyRequest): void {
    if (request?.log) {
      request.log.info({ ...context, requestId: request.id }, message)
    } else {
      const logData: BaseLogData = {
        level: LogLevel.INFO,
        message,
        timestamp: new Date().toISOString(),
        context
      }
      console.log(this.formatConsoleLog(logData))
    }
  }

  /**
   * Log de aviso
   */
  static warn(message: string, context?: Record<string, any>, request?: FastifyRequest): void {
    if (request?.log) {
      request.log.warn({ ...context, requestId: request.id }, message)
    } else {
      const logData: BaseLogData = {
        level: LogLevel.WARN,
        message,
        timestamp: new Date().toISOString(),
        context
      }
      console.warn(this.formatConsoleLog(logData))
    }
  }

  /**
   * Log de erro
   */
  static error(message: string, context?: Record<string, any>, request?: FastifyRequest): void {
    if (request?.log) {
      request.log.error({ ...context, requestId: request.id }, message)
    } else {
      const logData: BaseLogData = {
        level: LogLevel.ERROR,
        message,
        timestamp: new Date().toISOString(),
        context
      }
      console.error(this.formatConsoleLog(logData))
    }
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  static debug(message: string, context?: Record<string, any>, request?: FastifyRequest): void {
    if (env.NODE_ENV !== 'development') return

    if (request?.log) {
      request.log.debug({ ...context, requestId: request.id }, message)
    } else {
      const logData: BaseLogData = {
        level: LogLevel.DEBUG,
        message,
        timestamp: new Date().toISOString(),
        context
      }
      console.log(this.formatConsoleLog(logData))
    }
  }

  /**
   * Log de evento de segurança
   */
  static security(message: string, context?: Record<string, any>, request?: FastifyRequest): void {
    const securityContext = {
      ...context,
      ...(request && {
        ip: request.ip,
        userAgent: request.headers['user-agent']
      })
    }

    this.warn(`[SECURITY] ${message}`, securityContext, request)
  }

  /**
   * Log específico para tentativas de login
   */
  static loginAttempt(
    success: boolean,
    context: Record<string, any>,
    request?: FastifyRequest
  ): void {
    const message = success ? 'Login bem-sucedido' : 'Tentativa de login falhou'
    const eventContext = {
      event: success ? 'login_success' : 'login_failed',
      ...context,
      success
    }

    this.security(message, eventContext, request)
  }

  /**
   * Log específico para tentativas de registro
   */
  static registerAttempt(
    success: boolean,
    context: Record<string, any>,
    request?: FastifyRequest
  ): void {
    const message = success ? 'Novo usuário registrado' : 'Tentativa de registro falhou'
    const eventContext = {
      event: success ? 'register_success' : 'register_failed',
      ...context,
      success
    }

    this.security(message, eventContext, request)
  }

  /**
   * Log específico para refresh token
   */
  static refreshTokenAttempt(
    success: boolean,
    context?: Record<string, any>,
    request?: FastifyRequest
  ): void {
    const message = success ? 'Tokens renovados com sucesso' : 'Tentativa de renovação de token falhou'
    const eventContext = {
      event: success ? 'refresh_token_success' : 'refresh_token_failed',
      ...context,
      success
    }

    this.security(message, eventContext, request)
  }
}
