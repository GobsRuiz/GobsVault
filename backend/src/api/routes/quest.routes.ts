import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { QuestService } from '../../application/services/quest.service';
import { QuestRepository } from '../../infrastructure/repositories/quest.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { PortfolioRepository } from '../../infrastructure/repositories/portfolio.repository';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';

export async function questRoutes(app: FastifyInstance) {
  // Initialize dependencies
  const questRepository = new QuestRepository();
  const userRepository = new UserRepository();
  const portfolioRepository = new PortfolioRepository();
  const questService = new QuestService(
    questRepository,
    userRepository,
    portfolioRepository
  );

  /**
   * GET /api/quests
   * Get all quests ALWAYS with user progress
   */
  app.get(
    '/api/quests',
    {
      preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const questsWithProgress = await questService.getQuestsWithProgress(
          request.user!.userId
        );

        return reply.code(200).send({
          success: true,
          data: questsWithProgress
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

        request.log.error({ error }, 'Unexpected error in get quests endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar quests'
          }
        });
      }
    }
  );

  /**
   * GET /api/quests/completed
   * Get only quests that user has already claimed
   */
  app.get(
    '/api/quests/completed',
    {
      preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const completedQuests = await questService.getCompletedQuests(
          request.user!.userId
        );

        return reply.code(200).send({
          success: true,
          data: completedQuests
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

        request.log.error(
          { error },
          'Unexpected error in get completed quests endpoint'
        );
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar quests completadas'
          }
        });
      }
    }
  );

  /**
   * GET /api/quests/available
   * Get quests that can be claimed (completed but not yet claimed)
   */
  app.get(
    '/api/quests/available',
    {
      preHandler: [authMiddleware]
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const availableQuests = await questService.getAvailableQuests(
          request.user!.userId
        );

        return reply.code(200).send({
          success: true,
          data: availableQuests
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

        request.log.error(
          { error },
          'Unexpected error in get available quests endpoint'
        );
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao buscar quests disponíveis'
          }
        });
      }
    }
  );

  /**
   * POST /api/quests/:id/claim
   * Claim quest reward
   */
  app.post<{ Params: { id: string } }>(
    '/api/quests/:id/claim',
    {
      preHandler: [authMiddleware],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute'
        }
      }
    },
    async (request, reply) => {
      try {
        const questId = request.params.id;

        const result = await questService.claimQuestReward(
          request.user!.userId,
          questId
        );

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

        request.log.error({ error }, 'Unexpected error in claim quest endpoint');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro ao reivindicar recompensa'
          }
        });
      }
    }
  );
}
