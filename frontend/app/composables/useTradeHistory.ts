/**
 * Trade History composable
 * Handles fetching and managing trade history
 */

import type { Trade, CryptoSymbol } from '~/shared/types/trade.types'

export interface TradeHistoryQuery {
  limit?: number
  offset?: number
  symbol?: CryptoSymbol
  type?: 'BUY' | 'SELL'
}

export const useTradeHistory = () => {
  const config = useRuntimeConfig()

  const trades = ref<Trade[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch trade history with optional filters
   * @param query - Query parameters for filtering
   * @param append - If true, appends results to existing trades (for pagination)
   */
  const fetchTradeHistory = async (query: TradeHistoryQuery = {}, append = false) => {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      if (query.limit) queryParams.append('limit', query.limit.toString())
      if (query.offset) queryParams.append('offset', query.offset.toString())
      if (query.symbol) queryParams.append('symbol', query.symbol)
      if (query.type) queryParams.append('type', query.type)

      const response = await $fetch<{ success: boolean; data: Trade[] }>(
        `${config.public.apiBase}/api/trades/history?${queryParams.toString()}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (response.success) {
        trades.value = append ? [...trades.value, ...response.data] : response.data
      }
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Erro ao buscar histórico de trades'
      console.error('[useTradeHistory] Fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    trades: readonly(trades),
    loading: readonly(loading),
    error: readonly(error),
    fetchTradeHistory
  }
}
