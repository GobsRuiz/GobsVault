import { useIntervalFn } from "@vueuse/core"

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  sparkline: number[]
}

interface ApiResponse {
  success: boolean
  data: CryptoPrice[]
  error?: {
    code: string
    message: string
  }
}

export const useCrypto = () => {
  const config = useRuntimeConfig()
  
  const prices = ref<CryptoPrice[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPrices = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<ApiResponse>(
        `${config.public.apiBase}/api/crypto/prices`,
        {
          retry: 2,
          retryDelay: 1000,
          timeout: 10000
        }
      )

      if (response.success && response.data) {
        prices.value = response.data
      } 
      else {
        throw new Error(response.error?.message || 'Failed to fetch prices')
      }
    } catch (err: any) {
      const errorMessage = 
        err.data?.error?.message || 
        err.message || 
        'Failed to fetch crypto prices'
      
      error.value = errorMessage
      console.error('Crypto fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  const { pause, resume, isActive } = useIntervalFn(
    fetchPrices, 
    10000,
    { immediate: true } 
  )

  onMounted(() => {
    fetchPrices()
    resume()
  })

  onUnmounted(() => {
    pause()
  })

  const cryptoColors: Record<string, string> = {
    BTC: '#f7931a',
    ETH: '#627eea',
    BNB: '#f3ba2f',
    SOL: '#14f195',
    ADA: '#0033ad'
  }

  function getCryptoColor(symbol: string): string {
    return cryptoColors[symbol] || '#00dc82'
  }

  return {
    prices,
    loading,
    error,
    fetchPrices,
    pause,
    resume,
    isActive,
    getCryptoColor,
    cryptoColors
  }
}