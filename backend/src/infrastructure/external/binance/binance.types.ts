export interface BinanceTicker {
  lastPrice: string
  priceChangePercent: string
}

export interface BinanceKline {
  [index: number]: string
}
