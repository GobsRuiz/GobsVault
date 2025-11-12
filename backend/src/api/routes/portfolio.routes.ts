import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PortfolioService } from '../../application/services/portfolio.service';
import { CryptoService } from '../../application/services/crypto.service';
import { PortfolioRepository } from '../../infrastructure/repositories/portfolio.repository';
import { PortfolioSnapshotRepository } from '../../infrastructure/repositories/portfolio-snapshot.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { TradeRepository } from '../../infrastructure/repositories/trade.repository';
import { BinanceClient } from '../../infrastructure/external/binance';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { TokenBlacklistService } from '../../infrastructure/cache/token-blacklist.service';
import { redis } from '../../infrastructure/cache/redis.client';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export async function portfolioRoutes(app: FastifyInstance) {
  // Initialize dependencies
  const portfolioRepository = new PortfolioRepository();
  const snapshotRepository = new PortfolioSnapshotRepository();
  const userRepository = new UserRepository();
  const tradeRepository = new TradeRepository();
  const binanceClient = new BinanceClient();
  const cryptoService = new CryptoService(binanceClient);
  const portfolioService = new PortfolioService(
    portfolioRepository,
    userRepository,
    cryptoService,
    tradeRepository,
    snapshotRepository
  );
  const cacheService = new CacheService(redis);
  const tokenBlacklistService = new TokenBlacklistService(cacheService);
  const authHandler = authMiddleware(tokenBlacklistService);

  /**
   * GET /api/portfolio
   * Get user portfolio with current market values
   */
  app.get(
    '/api/portfolio',
    {
      preHandler: [authHandler]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const portfolio = await portfolioService.getPortfolioWithValues(
          request.user!.userId
        );

        return reply.code(200).send({
          success: true,
          data: portfolio
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

        request.log.error({ error }, 'Unexpected error in portfolio endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar portfolio'
          }
        });
      }
    }
  );

  /**
   * GET /api/portfolio/summary
   * Get portfolio summary including balance and net worth
   */
  app.get(
    '/api/portfolio/summary',
    {
      preHandler: [authHandler]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const summary = await portfolioService.getPortfolioSummary(
          request.user!.userId
        );

        return reply.code(200).send({
          success: true,
          data: summary
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

        request.log.error({ error }, 'Unexpected error in portfolio summary endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar resumo do portfolio'
          }
        });
      }
    }
  );

  /**
   * GET /api/portfolio/history
   * Get portfolio value history for charts
   * Query params:
   *   - days: number of days to look back (default: 30, max: 365)
   */
  app.get<{ Querystring: { days?: string } }>(
    '/api/portfolio/history',
    {
      preHandler: [authHandler]
    },
    async (request, reply) => {
      try {
        const days = Math.min(parseInt(request.query.days || '30', 10), 365);

        const history = await portfolioService.getPortfolioHistory(
          request.user!.userId,
          days
        );

        return reply.code(200).send({
          success: true,
          data: history
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

        request.log.error({ error }, 'Unexpected error in portfolio history endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar histórico do portfolio'
          }
        });
      }
    }
  );

  /**
   * POST /api/portfolio/snapshot/:userId
   * Create a snapshot of current portfolio value
   * TEMPORARY ENDPOINT - NO AUTH (for testing only)
   * TODO: Remove before production
   */
  app.post<{ Params: { userId: string } }>(
    '/api/portfolio/snapshot/:userId',
    async (request, reply) => {
      try {
        const { userId } = request.params;

        const snapshot = await portfolioService.createPortfolioSnapshot(userId);

        return reply.code(201).send({
          success: true,
          data: snapshot,
          message: 'Snapshot criado com sucesso'
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

        request.log.error({ error }, 'Unexpected error creating snapshot');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao criar snapshot'
          }
        });
      }
    }
  );
}
