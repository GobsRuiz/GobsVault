import axios, { AxiosError } from 'axios'
import type { Logger } from 'pino'
import { ICryptoProvider, CryptoTicker } from '../../../domain/interfaces/crypto-provider.interface'
import { ExternalAPIError } from '../../../shared/errors/AppError'
import { BinanceTicker, BinanceKline } from './binance.types'

export class BinanceClient implements ICryptoProvider {
  private readonly BINANCE_BASE_URL = 'https://api.binance.com/api/v3'
  private readonly REQUEST_TIMEOUT = 5000

  constructor(private readonly logger?: Logger) {}

  async getTicker(symbol: string): Promise<CryptoTicker> {
    try {
      const ticker = await this.binanceRequest<BinanceTicker>('/ticker/24hr', { symbol })

      return {
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent)
      }
    } catch (error) {
      this.handleBinanceError(error, symbol, 'getTicker')
      throw error
    }
  }

  async getKlines(symbol: string, interval: string, limit: number): Promise<number[]> {
    try {
      const klines = await this.binanceRequest<BinanceKline[]>('/klines', { symbol, interval, limit })
      return klines.map((k) => parseFloat(k[4]))
    } catch (error) {
      this.handleBinanceError(error, symbol, 'getKlines')
      throw error
    }
  }

  private async binanceRequest<T>(endpoint: string, params: Record<string, string | number>): Promise<T> {
    try {
      const { data } = await axios.get<T>(`${this.BINANCE_BASE_URL}${endpoint}`, {
        params,
        timeout: this.REQUEST_TIMEOUT,
        headers: {
          'Accept': 'application/json'
        }
      })

      return data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError

        if (axiosError.code === 'ECONNABORTED') {
          throw new ExternalAPIError(`Binance API timeout for ${endpoint}`)
        }

        if (!axiosError.response) {
          throw new ExternalAPIError(`Binance API network error for ${endpoint}`)
        }

        const status = axiosError.response.status
        if (status === 429) {
          throw new ExternalAPIError(`Binance API rate limit exceeded for ${endpoint}`)
        }

        if (status >= 500) {
          throw new ExternalAPIError(`Binance API server error (${status}) for ${endpoint}`)
        }

        throw new ExternalAPIError(`Binance API error (${status}) for ${endpoint}`)
      }

      throw error
    }
  }

  private handleBinanceError(error: unknown, symbol: string, operation: string): void {
    if (error instanceof ExternalAPIError) {
      this.logger?.error({ symbol, operation, error: error.message }, 'Binance API error')
    } else {
      this.logger?.error({ symbol, operation, error }, 'Unexpected error calling Binance')
    }
  }
}
