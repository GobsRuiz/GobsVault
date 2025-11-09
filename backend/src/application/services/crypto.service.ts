// backend/src/application/services/crypto.service.ts
import axios, { AxiosError } from 'axios'
import { cacheService } from '../../infrastructure/cache/cache.service'
import { ExternalAPIError } from '../../shared/errors/AppError'

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  sparkline: number[]
}

export class CryptoService {
  private readonly CACHE_KEY = 'crypto:prices'
  private readonly CACHE_TTL = 60
  private readonly BINANCE_BASE_URL = 'https://api.binance.com/api/v3'
  private readonly SYMBOLS = [
    'BTCUSDT',
    'ETHUSDT', 
    'BNBUSDT',
    'SOLUSDT',
    'ADAUSDT'
  ]
  
  private readonly CRYPTO_NAMES: Record<string, string> = {
    BTCUSDT: 'Bitcoin',
    ETHUSDT: 'Ethereum',
    BNBUSDT: 'Binance Coin',
    SOLUSDT: 'Solana',
    ADAUSDT: 'Cardano'
  }

  async getPrices(): Promise<CryptoPrice[]> {
    // Tenta cache primeiro
    const cached = await cacheService.get<CryptoPrice[]>(this.CACHE_KEY)
    if (cached) {
      return cached
    }

    // Busca da Binance
    try {
      const prices = await Promise.all(
        this.SYMBOLS.map(symbol => this.fetchPrice(symbol))
      )

      // Salva no cache
      await cacheService.set(this.CACHE_KEY, prices, this.CACHE_TTL)

      return prices
    } catch (error) {
      // Se houver cache antigo, retorna mesmo expirado
      const staleCache = await cacheService.get<CryptoPrice[]>(this.CACHE_KEY)
      if (staleCache) {
        return staleCache
      }
      
      throw error
    }
  }

  private async fetchPrice(symbol: string): Promise<CryptoPrice> {
    try {
      // Busca dados em paralelo
      const [ticker, klines] = await Promise.all([
        this.fetchTicker(symbol),
        this.fetchKlines(symbol)
      ])

      return {
        symbol: symbol.replace('USDT', ''),
        name: this.CRYPTO_NAMES[symbol] || symbol,
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        sparkline: klines.map((k: any) => parseFloat(k[4]))
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError
        throw new ExternalAPIError(
          `Binance API error: ${axiosError.response?.status || 'Network error'}`
        )
      }
      throw error
    }
  }

  private async fetchTicker(symbol: string) {
    const { data } = await axios.get(
      `${this.BINANCE_BASE_URL}/ticker/24hr`,
      { 
        params: { symbol },
        timeout: 5000 
      }
    )
    return data
  }

  private async fetchKlines(symbol: string) {
    const { data } = await axios.get(
      `${this.BINANCE_BASE_URL}/klines`,
      { 
        params: { 
          symbol, 
          interval: '1h', 
          limit: 7 
        },
        timeout: 5000
      }
    )
    return data
  }
}