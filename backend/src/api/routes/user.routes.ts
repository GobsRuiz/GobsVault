import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UserService } from '../../application/services/user.service';
import { GamificationService } from '../../application/services/gamification.service';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { TokenBlacklistService } from '../../infrastructure/cache/token-blacklist.service';
import { redis } from '../../infrastructure/cache/redis.client';
import { authMiddleware } from '../middlewares/auth.middleware';
import { changePasswordSchema } from '../../../../shared/schemas/auth.schema';
import { AppError, NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';

export async function userRoutes(app: FastifyInstance) {
  const userRepository = new UserRepository();
  const gamificationService = new GamificationService();
  const cacheService = new CacheService(redis);
  const tokenBlacklistService = new TokenBlacklistService(cacheService);
  const userService = new UserService(userRepository, tokenBlacklistService);
  const authHandler = authMiddleware(tokenBlacklistService);

  /**
   * GET /api/user/me
   * Get current authenticated user data
   */
  app.get(
    '/api/user/me',
    {
      preHandler: [authHandler]
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
      preHandler: [authHandler]
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

  /**
   * POST /api/user/change-password
   * Change user password (requires authentication, triggers logout-all)
   */
  app.post(
    '/api/user/change-password',
    {
      preHandler: [authHandler]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const validatedData = changePasswordSchema.parse(request.body);

        await userService.changePassword(
          request.user!.userId,
          validatedData.currentPassword,
          validatedData.newPassword
        );

        // Remove os cookies do dispositivo atual
        reply.clearCookie('accessToken', { path: '/' });
        reply.clearCookie('refreshToken', { path: '/' });

        return reply.code(200).send({
          success: true,
          message: 'Senha alterada com sucesso. Por favor, faça login novamente em todos os dispositivos'
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

        if (error instanceof ZodError) {
          throw new ValidationError('Dados inválidos', error.errors);
        }

        request.log.error({ error }, 'Unexpected error in user/change-password endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao alterar senha'
          }
        });
      }
    }
  );
}
