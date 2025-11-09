export interface ICryptoProvider {
  getTicker(symbol: string): Promise<CryptoTicker>
  getKlines(symbol: string, interval: string, limit: number): Promise<number[]>
}

export interface CryptoTicker {
  price: number
  change24h: number
}
