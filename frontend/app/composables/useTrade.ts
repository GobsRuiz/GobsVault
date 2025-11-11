/**
 * Trading composable
 * Handles buy/sell operations and trade history
 */

interface BuyTradeRequest {
  symbol: string
  amountUSD: number
}

interface SellTradeRequest {
  symbol: string
  amountUSD: number
}

interface TradeResult {
  tradeId: string
  type: 'BUY' | 'SELL'
  symbol: string
  cryptoAmount: number
  pricePerUnit: number
  totalUSD: number
  newBalance: number
}

interface Trade {
  _id: string
  userId: string
  type: 'BUY' | 'SELL'
  symbol: string
  amount: number
  price: number
  total: number
  status: 'COMPLETED' | 'FAILED'
  timestamp: Date
  errorMessage?: string
}

interface TradeStats {
  totalTrades: number
  totalBuys: number
  totalSells: number
  totalVolume: number
}

export const useTrade = () => {
  const config = useRuntimeConfig()
  const { fetch: fetchUser } = useUserSession()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const tradeHistory = ref<Trade[]>([])
  const stats = ref<TradeStats | null>(null)

  /**
   * Execute a buy trade
   */
  const executeBuy = async (data: BuyTradeRequest): Promise<TradeResult | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: TradeResult }>(
        `${config.public.apiBase}/api/trades/buy`,
        {
          method: 'POST',
          body: data,
          credentials: 'include'
        }
      )

      if (response.success) {
        // Update user session to reflect new balance
        await fetchUser()
        return response.data
      }

      return null
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Erro ao executar compra'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Execute a sell trade
   */
  const executeSell = async (data: SellTradeRequest): Promise<TradeResult | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: TradeResult }>(
        `${config.public.apiBase}/api/trades/sell`,
        {
          method: 'POST',
          body: data,
          credentials: 'include'
        }
      )

      if (response.success) {
        // Update user session to reflect new balance
        await fetchUser()
        return response.data
      }

      return null
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Erro ao executar venda'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch trade history
   */
  const fetchHistory = async (params?: {
    limit?: number
    offset?: number
    symbol?: string
    type?: 'BUY' | 'SELL'
  }) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: Trade[] }>(
        `${config.public.apiBase}/api/trades/history`,
        {
          method: 'GET',
          query: params,
          credentials: 'include'
        }
      )

      if (response.success) {
        tradeHistory.value = response.data
      }
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Erro ao buscar histórico'
      console.error('Trade history error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch trade statistics
   */
  const fetchStats = async () => {
    try {
      const response = await $fetch<{ success: boolean; data: TradeStats }>(
        `${config.public.apiBase}/api/trades/stats`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      if (response.success) {
        stats.value = response.data
      }
    } catch (err: any) {
      console.error('Trade stats error:', err)
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    tradeHistory: readonly(tradeHistory),
    stats: readonly(stats),
    executeBuy,
    executeSell,
    fetchHistory,
    fetchStats
  }
}
