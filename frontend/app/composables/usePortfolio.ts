/**
 * Portfolio composable
 * Handles portfolio data and calculations
 */

interface Holding {
  symbol: string
  amount: number
  averageBuyPrice: number
  totalInvested: number
  currentPrice: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
}

interface Portfolio {
  id: string
  userId: string
  holdings: Holding[]
  updatedAt: Date
  totalPortfolioValue: number
  totalInvested: number
  totalProfitLoss: number
  totalProfitLossPercent: number
}

interface PortfolioSummary {
  balance: number
  portfolioValue: number
  netWorth: number
  totalInvested: number
  totalProfitLoss: number
  totalProfitLossPercent: number
}

export const usePortfolio = () => {
  const config = useRuntimeConfig()

  const portfolio = ref<Portfolio | null>(null)
  const summary = ref<PortfolioSummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch user portfolio with current market values
   */
  const fetchPortfolio = async () => {
    loading.value = true
    error.value = null

    console.log('[usePortfolio] Fetching portfolio...')

    try {
      const response = await $fetch<{ success: boolean; data: Portfolio }>(
        `${config.public.apiBase}/api/portfolio`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      console.log('[usePortfolio] Portfolio response:', response)

      if (response.success) {
        portfolio.value = response.data
        console.log('[usePortfolio] Portfolio updated:', portfolio.value)
      }
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Erro ao buscar portfolio'
      console.error('[usePortfolio] Portfolio fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch portfolio summary (balance + net worth)
   */
  const fetchSummary = async () => {
    console.log('[usePortfolio] Fetching summary...')

    try {
      const response = await $fetch<{ success: boolean; data: PortfolioSummary }>(
        `${config.public.apiBase}/api/portfolio/summary`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      console.log('[usePortfolio] Summary response:', response)

      if (response.success) {
        summary.value = response.data
        console.log('[usePortfolio] Summary updated:', summary.value)
      }
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Erro ao buscar resumo'
      console.error('[usePortfolio] Portfolio summary error:', err)
    }
  }

  /**
   * Get specific holding by symbol
   */
  const getHolding = (symbol: string): Holding | undefined => {
    return portfolio.value?.holdings.find(h => h.symbol === symbol)
  }

  return {
    portfolio: readonly(portfolio),
    summary: readonly(summary),
    loading: readonly(loading),
    error: readonly(error),
    fetchPortfolio,
    fetchSummary,
    getHolding
  }
}
