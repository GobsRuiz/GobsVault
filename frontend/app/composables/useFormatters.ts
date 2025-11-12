/**
 * Formatters composable
 * Provides reusable formatting utilities
 */

export const useFormatters = () => {
  /**
   * Format number as USD currency
   */
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  /**
   * Format number with locale
   */
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  /**
   * Format number as percentage
   */
  const formatPercent = (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`
  }

  /**
   * Format crypto amount (2-8 decimals depending on value)
   */
  const formatCryptoAmount = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value)
  }

  /**
   * Format profit/loss with + or - prefix
   */
  const formatProfitLoss = (value: number): string => {
    const prefix = value > 0 ? '+' : ''
    return prefix + formatCurrency(value)
  }

  /**
   * Format date and time (pt-BR)
   */
  const formatDateTime = (timestamp: Date | string): string => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return {
    formatCurrency,
    formatNumber,
    formatPercent,
    formatCryptoAmount,
    formatProfitLoss,
    formatDateTime
  }
}
