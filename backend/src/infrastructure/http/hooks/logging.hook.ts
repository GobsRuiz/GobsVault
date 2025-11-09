import { FastifyInstance } from 'fastify'

const CRITICAL_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/buy',
  '/sell',
  '/trade',
  '/withdraw',
  '/deposit',
  '/transfer'
]

export function registerLoggingHook(app: FastifyInstance) {
  app.addHook('onResponse', async (request, reply) => {
    const isCriticalRoute = CRITICAL_ROUTES.some(route =>
      request.url.includes(route)
    )
    const isError = reply.statusCode >= 400

    if (isError || isCriticalRoute) {
      request.log.info({
        requestId: request.id,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: reply.getResponseTime(),
        ip: request.ip,
        userAgent: request.headers['user-agent']
      }, isError ? 'Request error' : 'Critical route accessed')
    }
  })
}
