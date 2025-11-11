import { z } from 'zod';

/**
 * Supported crypto symbols
 */
const cryptoSymbolEnum = z.enum(['BTC', 'ETH', 'BNB', 'SOL', 'ADA'], {
  errorMap: () => ({ message: 'Criptomoeda inválida. Opções: BTC, ETH, BNB, SOL, ADA' })
});

/**
 * Buy trade schema
 * User specifies amount in USD to spend
 */
export const buyTradeSchema = z.object({
  symbol: cryptoSymbolEnum,

  amountUSD: z
    .number({
      required_error: 'Valor em USD é obrigatório',
      invalid_type_error: 'Valor deve ser um número'
    })
    .positive('Valor deve ser positivo')
    .min(10, 'Valor mínimo de trade é $10')
    .max(1000000, 'Valor máximo de trade é $1,000,000')
    .finite('Valor deve ser um número finito')
});

/**
 * Sell trade schema
 * User specifies amount in USD to receive
 */
export const sellTradeSchema = z.object({
  symbol: cryptoSymbolEnum,

  amountUSD: z
    .number({
      required_error: 'Valor em USD é obrigatório',
      invalid_type_error: 'Valor deve ser um número'
    })
    .positive('Valor deve ser positivo')
    .min(10, 'Valor mínimo de trade é $10')
    .max(1000000, 'Valor máximo de trade é $1,000,000')
    .finite('Valor deve ser um número finito')
});

/**
 * Trade history query schema
 */
export const tradeHistoryQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().min(1).max(100)),

  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().min(0)),

  symbol: cryptoSymbolEnum.optional(),

  type: z.enum(['BUY', 'SELL']).optional()
});

// Type exports
export type BuyTradeDTO = z.infer<typeof buyTradeSchema>;
export type SellTradeDTO = z.infer<typeof sellTradeSchema>;
export type TradeHistoryQueryDTO = z.infer<typeof tradeHistoryQuerySchema>;
