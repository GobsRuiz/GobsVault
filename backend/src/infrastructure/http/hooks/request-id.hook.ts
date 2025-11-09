import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'

export function registerRequestIdHook(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    const headerValue = request.headers['x-request-id']
    const requestId = Array.isArray(headerValue) ? headerValue[0] : (headerValue || randomUUID())
    request.id = requestId
    reply.header('x-request-id', requestId)
  })
}
