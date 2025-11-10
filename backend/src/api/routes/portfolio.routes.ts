import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PortfolioService } from '../../application/services/portfolio.service';
import { CryptoService } from '../../application/services/crypto.service';
import { PortfolioRepository } from '../../infrastructure/repositories/portfolio.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { BinanceClient } from '../../infrastructure/external/binance';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/AppError';

export async function portfolioRoutes(app: FastifyInstance) {
  // Initialize dependencies
  const portfolioRepository = new PortfolioRepository();
  const userRepository = new UserRepository();
  const binanceClient = new BinanceClient();
  const cryptoService = new CryptoService(binanceClient);
  const portfolioService = new PortfolioService(
    portfolioRepository,
    userRepository,
    cryptoService
  );

  /**
   * GET /api/portfolio
   * Get user portfolio with current market values
   */
  app.get(
    '/api/portfolio',
    {
      preHandler: [authMiddleware]
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
      preHandler: [authMiddleware]
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
}
