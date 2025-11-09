import type { Logger } from 'pino'
import { cacheService } from '../../infrastructure/cache'
import { CryptoPrice } from '../../domain/types/crypto.types'
import { ICryptoProvider } from '../../domain/interfaces/crypto-provider.interface'

export class CryptoService {
  private readonly CACHE_KEY = 'crypto:prices'
  private readonly CACHE_TTL = 60
  private readonly SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'] as const

  private readonly CRYPTO_NAMES: Record<string, string> = {
    BTCUSDT: 'Bitcoin',
    ETHUSDT: 'Ethereum',
    BNBUSDT: 'Binance Coin',
    SOLUSDT: 'Solana',
    ADAUSDT: 'Cardano'
  }

  constructor(
    private readonly cryptoProvider: ICryptoProvider,
    private readonly logger?: Logger
  ) {}

  async getPrices(): Promise<CryptoPrice[]> {
    const cached = await cacheService.get<CryptoPrice[]>(this.CACHE_KEY)
    if (cached) {
      this.logger?.debug({ source: 'cache' }, 'Crypto prices served from cache')
      return cached
    }

    try {
      const prices = await Promise.all(
        this.SYMBOLS.map(symbol => this.fetchPrice(symbol))
      )

      await cacheService.set(this.CACHE_KEY, prices, this.CACHE_TTL)
      this.logger?.debug({ source: 'provider', count: prices.length }, 'Crypto prices fetched from provider')

      return prices
    } catch (error) {
      this.logger?.warn({ error }, 'Failed to fetch crypto prices from provider')

      const staleCache = await cacheService.get<CryptoPrice[]>(this.CACHE_KEY)
      if (staleCache) {
        this.logger?.info('Serving stale cache due to provider failure')
        return staleCache
      }

      throw error
    }
  }

  private async fetchPrice(symbol: string): Promise<CryptoPrice> {
    const [ticker, sparkline] = await Promise.all([
      this.cryptoProvider.getTicker(symbol),
      this.cryptoProvider.getKlines(symbol, '1h', 7)
    ])

    return {
      symbol: symbol.replace('USDT', ''),
      name: this.CRYPTO_NAMES[symbol] || symbol,
      price: ticker.price,
      change24h: ticker.change24h,
      sparkline
    }
  }
}
