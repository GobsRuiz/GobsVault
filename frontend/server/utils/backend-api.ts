import type { H3Event } from 'h3'

interface BackendOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
}

export async function callBackendAPI<T>(
  event: H3Event,
  endpoint: string,
  options: BackendOptions
): Promise<T> {
  const config = useRuntimeConfig()
  const cookies = getRequestHeader(event, 'cookie')

  try {
    const response = await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
      method: options.method,
      body: options.body,
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { Cookie: cookies })
      },
      credentials: 'include',
      onResponse({ response }) {
        const setCookie = response.headers.get('set-cookie')
        if (setCookie) {
          setResponseHeader(event, 'set-cookie', setCookie)
        }
      }
    })

    return response
  } catch (error: any) {
    const isProd = process.env.NODE_ENV === 'production'

    // Sanitiza mensagem em produção para não vazar detalhes técnicos
    const sanitizedMessage = isProd
      ? (error.statusCode >= 400 && error.statusCode < 500
          ? error.data?.error?.message || 'Erro na requisição'
          : 'Erro interno do servidor')
      : error.data?.error?.message || error.message || 'Backend API error'

    throw createError({
      statusCode: error.statusCode || 500,
      message: sanitizedMessage
    })
  }
}
