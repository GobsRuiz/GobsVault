// backend/src/api/routes/crypto.routes.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { CryptoService } from '../../application/services/crypto.service'
import { AppError } from '../../shared/errors/AppError'

export async function cryptoRoutes(app: FastifyInstance) {
  const cryptoService = new CryptoService()

  app.get(
    '/api/crypto/prices',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '1 minute'
        }
      }
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const prices = await cryptoService.getPrices()
        
        return reply.send({ 
          success: true, 
          data: prices 
        })
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message
            }
          })
        }

        // Erro inesperado
        console.error('Unexpected error:', error)
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
          }
        })
      }
    }
  )
}