/**
 * Portfolio History Composable
 * Handles fetching portfolio historical data for charts
 */

import type { PortfolioSnapshot } from '~/shared/types/portfolio.types'

interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    code: string
    message: string
  }
}

export const usePortfolioHistory = () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // State
  const history = ref<PortfolioSnapshot[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch portfolio history
   * @param days - Number of days to look back (default: 30)
   */
  const fetchHistory = async (days: number = 30) => {
    loading.value = true
    error.value = null

    console.log('[usePortfolioHistory] Fetching history for', days, 'days...')

    try {
      const response = await $fetch<ApiResponse<PortfolioSnapshot[]>>(
        `${apiBase}/api/portfolio/history?days=${days}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      )

      console.log('[usePortfolioHistory] History response:', response)

      if (response.success) {
        history.value = response.data.map(snapshot => ({
          ...snapshot,
          date: new Date(snapshot.date)
        }))
        console.log('[usePortfolioHistory] History updated:', history.value.length, 'snapshots')
      } else {
        error.value = response.error?.message || 'Erro ao buscar histórico'
      }
    } catch (err: any) {
      error.value = err.data?.error?.message || 'Erro ao buscar histórico'
      console.error('[usePortfolioHistory] Error fetching history:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear history data
   */
  const clearHistory = () => {
    history.value = []
    error.value = null
  }

  return {
    history: readonly(history),
    loading: readonly(loading),
    error: readonly(error),
    fetchHistory,
    clearHistory
  }
}
