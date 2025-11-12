import { FastifyInstance } from 'fastify';
import { PortfolioSnapshotModel } from '../../infrastructure/database/schemas/portfolio-snapshot.schema';

/**
 * Development/Testing Routes
 * THESE ENDPOINTS ARE FOR DEVELOPMENT ONLY
 * TODO: Remove before production or protect with environment check
 */
export async function devRoutes(app: FastifyInstance) {
  /**
   * POST /api/dev/seed-snapshots/:userId
   * Seed historical snapshots for testing
   * Body: { days: number } - number of days to generate (default: 90)
   */
  app.post<{
    Params: { userId: string };
    Body: { days?: number };
  }>('/api/dev/seed-snapshots/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;
      const days = Math.min(request.body?.days || 90, 365);

      app.log.info(`Seeding ${days} days of snapshots for user ${userId}`);

      // Delete existing snapshots using Mongoose
      await PortfolioSnapshotModel.deleteMany({ userId });

      // Generate snapshots
      const now = new Date();
      const startValue = 40000;
      const endValue = 70000;
      const totalGrowth = endValue - startValue;
      const snapshots = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Simulate realistic growth with volatility
        const progressPercent = (days - 1 - i) / (days - 1);
        const baseValue = startValue + totalGrowth * progressPercent;
        const dailyVolatility = (Math.random() - 0.5) * 0.1 * baseValue;
        const weekCycle = Math.sin((days - 1 - i) * 0.2) * 1500;

        const totalValue = baseValue + dailyVolatility + weekCycle;
        const totalInvested = 54400;
        const profitLoss = totalValue - totalInvested;
        const profitLossPercent = (profitLoss / totalInvested) * 100;

        snapshots.push({
          userId,
          date,
          totalValue,
          totalInvested,
          profitLoss,
          profitLossPercent
        });
      }

      // Bulk insert using Mongoose
      await PortfolioSnapshotModel.insertMany(snapshots);

      return reply.code(201).send({
        success: true,
        data: {
          userId,
          snapshotsCreated: snapshots.length,
          dateRange: {
            start: snapshots[0].date,
            end: snapshots[snapshots.length - 1].date
          }
        },
        message: `${snapshots.length} snapshots criados com sucesso`
      });
    } catch (error) {
      app.log.error({ error }, 'Error seeding snapshots');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao criar snapshots'
        }
      });
    }
  });
}
