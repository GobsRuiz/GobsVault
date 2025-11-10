import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { TradeService } from '../../application/services/trade.service';
import { CryptoService } from '../../application/services/crypto.service';
import { TradeRepository } from '../../infrastructure/repositories/trade.repository';
import { PortfolioRepository } from '../../infrastructure/repositories/portfolio.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { BinanceClient } from '../../infrastructure/external/binance';
import { authMiddleware } from '../middlewares/auth.middleware';
import { buyTradeSchema, sellTradeSchema, tradeHistoryQuerySchema } from '../../../../shared/schemas/trade.schema';
import { AppError, ValidationError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';

export async function tradeRoutes(app: FastifyInstance) {
  // Initialize dependencies
  const tradeRepository = new TradeRepository();
  const portfolioRepository = new PortfolioRepository();
  const userRepository = new UserRepository();
  const binanceClient = new BinanceClient();
  const cryptoService = new CryptoService(binanceClient);
  const tradeService = new TradeService(
    tradeRepository,
    portfolioRepository,
    userRepository,
    cryptoService
  );

  /**
   * POST /api/trades/buy
   * Execute a buy trade
   */
  app.post(
    '/api/trades/buy',
    {
      preHandler: [authMiddleware],
      config: {
        rateLimit: {
          max: 4,
          timeWindow: '1 minute'
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Validate request body
        const data = buyTradeSchema.parse(request.body);

        // Execute buy trade
        const result = await tradeService.executeBuy({
          userId: request.user!.userId,
          symbol: data.symbol,
          amountUSD: data.amountUSD
        });

        return reply.code(200).send({
          success: true,
          data: result
        });
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Dados inválidos',
              details: error.errors
            }
          });
        }

        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message
            }
          });
        }

        request.log.error({ error }, 'Unexpected error in buy trade endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao processar trade'
          }
        });
      }
    }
  );

  /**
   * POST /api/trades/sell
   * Execute a sell trade
   */
  app.post(
    '/api/trades/sell',
    {
      preHandler: [authMiddleware],
      config: {
        rateLimit: {
          max: 4,
          timeWindow: '1 minute'
        }
      }
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Validate request body
        const data = sellTradeSchema.parse(request.body);

        // Execute sell trade
        const result = await tradeService.executeSell({
          userId: request.user!.userId,
          symbol: data.symbol,
          amountUSD: data.amountUSD
        });

        return reply.code(200).send({
          success: true,
          data: result
        });
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Dados inválidos',
              details: error.errors
            }
          });
        }

        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message
            }
          });
        }

        request.log.error({ error }, 'Unexpected error in sell trade endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao processar trade'
          }
        });
      }
    }
  );

  /**
   * GET /api/trades/history
   * Get user trade history with pagination
   */
  app.get(
    '/api/trades/history',
    {
      preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Validate query parameters
        const query = tradeHistoryQuerySchema.parse(request.query);

        // Get trade history
        const trades = await tradeService.getTradeHistory(
          request.user!.userId,
          query
        );

        return reply.code(200).send({
          success: true,
          data: trades
        });
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.code(400).send({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Parâmetros de query inválidos',
              details: error.errors
            }
          });
        }

        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message
            }
          });
        }

        request.log.error({ error }, 'Unexpected error in trade history endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar histórico de trades'
          }
        });
      }
    }
  );

  /**
   * GET /api/trades/stats
   * Get user trade statistics
   */
  app.get(
    '/api/trades/stats',
    {
      preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = await tradeService.getTradeStats(request.user!.userId);

        return reply.code(200).send({
          success: true,
          data: stats
        });
      } catch (error) {
        if (error instanceof AppError) {
          return reply.code(error.statusCode).send({
            success: false,
            error: {
              code: error.code,
              message: error.message
            }
          });
        }

        request.log.error({ error }, 'Unexpected error in trade stats endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar estatísticas de trades'
          }
        });
      }
    }
  );
}
