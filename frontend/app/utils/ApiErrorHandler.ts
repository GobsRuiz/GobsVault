interface ApiError {
  statusCode?: number
  message?: string
  data?: {
    error?: {
      message?: string
      statusCode?: number
      field?: string
    }
  }
}

interface ErrorResponse {
  message: string
  field?: string
  code: string
}

export class ApiErrorHandler {
  private static readonly DEFAULT_ERROR_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.'

  /**
   * Extrai mensagem de erro tratada de uma resposta de API
   */
  static extract(error: any): ErrorResponse {
    const apiError = error as ApiError

    const statusCode = apiError.statusCode || apiError.data?.error?.statusCode || 500
    const message = this.getMessage(apiError)
    const field = apiError.data?.error?.field

    return {
      message,
      field,
      code: this.getErrorCode(statusCode)
    }
  }

  /**
   * Obtém mensagem amigável baseada no erro
   */
  private static getMessage(error: ApiError): string {
    // Mensagem do backend
    if (error.data?.error?.message) {
      return error.data.error.message
    }

    if (error.message) {
      return error.message
    }

    // Mensagem genérica baseada no status code
    const statusCode = error.statusCode || error.data?.error?.statusCode || 500

    switch (statusCode) {
      case 400:
        return 'Dados inválidos. Verifique as informações e tente novamente.'
      case 401:
        return 'Credenciais inválidas. Verifique seu usuário e senha.'
      case 403:
        return 'Você não tem permissão para acessar este recurso.'
      case 404:
        return 'Recurso não encontrado.'
      case 409:
        return 'Este recurso já existe.'
      case 422:
        return 'Dados inválidos. Verifique os campos e tente novamente.'
      case 429:
        return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.'
      case 503:
        return 'Serviço temporariamente indisponível. Tente novamente em instantes.'
      default:
        return this.DEFAULT_ERROR_MESSAGE
    }
  }

  /**
   * Obtém código de erro baseado no status HTTP
   */
  private static getErrorCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST'
      case 401:
        return 'UNAUTHORIZED'
      case 403:
        return 'FORBIDDEN'
      case 404:
        return 'NOT_FOUND'
      case 409:
        return 'CONFLICT'
      case 422:
        return 'VALIDATION_ERROR'
      case 429:
        return 'TOO_MANY_REQUESTS'
      case 500:
        return 'INTERNAL_SERVER_ERROR'
      case 503:
        return 'SERVICE_UNAVAILABLE'
      default:
        return 'UNKNOWN_ERROR'
    }
  }

  /**
   * Verifica se é um erro de validação
   */
  static isValidationError(error: any): boolean {
    const statusCode = error.statusCode || error.data?.error?.statusCode
    return statusCode === 400 || statusCode === 422
  }

  /**
   * Verifica se é um erro de autenticação
   */
  static isAuthError(error: any): boolean {
    const statusCode = error.statusCode || error.data?.error?.statusCode
    return statusCode === 401 || statusCode === 403
  }

  /**
   * Verifica se é um erro de rate limit
   */
  static isRateLimitError(error: any): boolean {
    const statusCode = error.statusCode || error.data?.error?.statusCode
    return statusCode === 429
  }

  /**
   * Verifica se é um erro de servidor
   */
  static isServerError(error: any): boolean {
    const statusCode = error.statusCode || error.data?.error?.statusCode
    return statusCode >= 500
  }

  /**
   * Formata erro para exibição em toast/notification
   */
  static toastMessage(error: any): string {
    const { message } = this.extract(error)
    return message
  }

  /**
   * Exibe erro via toast do Nuxt UI
   */
  static show(error: any, title?: string): void {
    const { message } = this.extract(error)

    // Importa dinamicamente para evitar problemas de SSR
    const toast = useAppToast()

    toast.error(
      title || 'Erro',
      message
    )

    // Log em desenvolvimento
    this.log(error)
  }

  /**
   * Log de erro no console (apenas development)
   */
  static log(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ApiError${context ? ` - ${context}` : ''}]`, error)
    }
  }
}
