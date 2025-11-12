/**
 * Crypto Metadata composable
 * Centralized source for cryptocurrency information (names, icons, colors)
 */

import type { CryptoSymbol } from '~/shared/types/portfolio.types'

interface CryptoInfo {
  name: string
  icon: string
  color: string
}

export const useCryptoMetadata = () => {
  /**
   * Complete crypto metadata
   * Single source of truth for all crypto information
   */
  const cryptoData: Record<CryptoSymbol, CryptoInfo> = {
    BTC: {
      name: 'Bitcoin',
      icon: 'cryptocurrency:btc',
      color: '#f7931a'
    },
    ETH: {
      name: 'Ethereum',
      icon: 'cryptocurrency:eth',
      color: '#627eea'
    },
    BNB: {
      name: 'Binance Coin',
      icon: 'cryptocurrency:bnb',
      color: '#f3ba2f'
    },
    SOL: {
      name: 'Solana',
      icon: 'cryptocurrency:sol',
      color: '#14f195'
    },
    ADA: {
      name: 'Cardano',
      icon: 'cryptocurrency:ada',
      color: '#0033ad'
    }
  }

  /**
   * Get crypto name by symbol
   */
  const getCryptoName = (symbol: CryptoSymbol): string => {
    return cryptoData[symbol]?.name || symbol
  }

  /**
   * Get crypto icon by symbol
   */
  const getCryptoIcon = (symbol: CryptoSymbol): string => {
    return cryptoData[symbol]?.icon || 'cryptocurrency:btc'
  }

  /**
   * Get crypto color by symbol
   */
  const getCryptoColor = (symbol: CryptoSymbol): string => {
    return cryptoData[symbol]?.color || '#00dc82'
  }

  /**
   * Get complete crypto info by symbol
   */
  const getCryptoInfo = (symbol: CryptoSymbol): CryptoInfo => {
    return cryptoData[symbol] || {
      name: symbol,
      icon: 'cryptocurrency:btc',
      color: '#00dc82'
    }
  }

  return {
    cryptoData,
    getCryptoName,
    getCryptoIcon,
    getCryptoColor,
    getCryptoInfo
  }
}
