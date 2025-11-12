import { z } from 'zod';

/**
 * Schema for claiming a quest reward
 */
export const claimQuestSchema = z.object({
  questId: z.string().min(1, 'Quest ID é obrigatório')
});

export type ClaimQuestInput = z.infer<typeof claimQuestSchema>;
