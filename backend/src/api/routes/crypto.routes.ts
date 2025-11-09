import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { CryptoService } from '../../application/services/crypto.service'
import { BinanceClient } from '../../infrastructure/external/binance'
import { AppError } from '../../shared/errors/AppError'

export async function cryptoRoutes(app: FastifyInstance) {
  const binanceClient = new BinanceClient()
  const cryptoService = new CryptoService(binanceClient)

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

        req.log.error({ error }, 'Unexpected error in crypto prices endpoint')
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
