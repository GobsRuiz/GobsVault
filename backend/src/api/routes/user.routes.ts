import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GamificationService } from '../../application/services/gamification.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppError, NotFoundError } from '../../shared/errors/AppError';

export async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const gamificationService = new GamificationService();

  /**
   * GET /api/user/me
   * Get current authenticated user data
   */
  app.get(
    '/api/user/me',
    {
      preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await userRepository.findById(request.user!.userId);

        if (!user) {
          throw new NotFoundError('Usuário não encontrado');
        }

        return reply.code(200).send({
          success: true,
          data: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            balance: user.balance,
            xp: user.xp,
            level: user.level,
            rank: user.rank,
            totalTrades: user.totalTrades
          }
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

        request.log.error({ error }, 'Unexpected error in user/me endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar dados do usuário'
          }
        });
      }
    }
  );

  /**
   * GET /api/user/stats
   * Get gamification stats for current user
   */
  app.get(
    '/api/user/stats',
    {
      preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const stats = await gamificationService.getUserStats(request.user!.userId);

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

        request.log.error({ error }, 'Unexpected error in user/stats endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar estatísticas de gamificação'
          }
        });
      }
    }
  );
}
