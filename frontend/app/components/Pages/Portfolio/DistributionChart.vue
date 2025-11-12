<template>
  <UCard class="distribution-chart">
    <h3 class="distribution-chart__title">Distribuição de Ativos</h3>

    <!-- Empty state -->
    <div v-if="!portfolio || portfolio.holdings.length === 0" class="distribution-chart__empty">
      <UIcon name="i-lucide-pie-chart" size="48" class="distribution-chart__empty-icon" />
      <p class="distribution-chart__empty-text">Sem ativos no portfolio</p>
    </div>

    <!-- Chart -->
    <div v-else class="distribution-chart__container">
      <Doughnut :data="chartData" :options="chartOptions" />

      <!-- Legend -->
      <div class="distribution-chart__legend">
        <div class="distribution-chart__legend-title">Legenda</div>
        <div
          v-for="holding in portfolio.holdings"
          :key="holding.symbol"
          class="distribution-chart__legend-item"
        >
          <div
            class="distribution-chart__legend-color"
            :style="{ backgroundColor: getCryptoColor(holding.symbol) }"
          />
          <div class="distribution-chart__legend-details">
            <div class="distribution-chart__legend-row">
              <span class="distribution-chart__legend-symbol">{{ getCryptoName(holding.symbol) }}</span>
              <span class="distribution-chart__legend-percent">
                {{ formatPercent(getPercentage(holding.currentValue)) }}
              </span>
            </div>
            <div class="distribution-chart__legend-value">
              {{ formatCurrency(holding.currentValue) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js'
import type { Portfolio } from '~/shared/types/portfolio.types'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  portfolio: Portfolio | null
}

const props = defineProps<Props>()

const { getCryptoColor, getCryptoName } = useCryptoMetadata()
const { formatPercent, formatCurrency } = useFormatters()

// Calculate percentage of total portfolio value
const getPercentage = (value: number): number => {
  if (!props.portfolio || props.portfolio.totalPortfolioValue === 0) return 0
  return (value / props.portfolio.totalPortfolioValue) * 100
}

// Chart data
const chartData = computed(() => {
  if (!props.portfolio || props.portfolio.holdings.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  return {
    labels: props.portfolio.holdings.map(h => getCryptoName(h.symbol)),
    datasets: [
      {
        data: props.portfolio.holdings.map(h => h.currentValue),
        backgroundColor: props.portfolio.holdings.map(h => getCryptoColor(h.symbol)),
        borderColor: '#1e1e1e',
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  }
})

// Chart options
const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: false // Using custom legend
    },
    tooltip: {
      backgroundColor: '#1e1e1e',
      titleColor: '#ffffff',
      bodyColor: '#a0a0a0',
      borderColor: '#333333',
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (context) => {
          const value = context.parsed
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${formatCurrency(value)} (${percentage}%)`
        }
      }
    }
  },
  cutout: '65%'
}
</script>

<style lang="scss" scoped>
.distribution-chart {
  min-height: 400px;
  display: flex;
  flex-direction: column;

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 24px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    flex: 1;
  }

  &__empty-icon {
    color: var(--color-text-muted);
    margin-bottom: 16px;
  }

  &__empty-text {
    font-size: 14px;
    color: var(--color-text-muted);
  }

  &__container {
    display: flex;
    gap: 32px;
    align-items: center;
  }

  &__legend {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 220px;
  }

  &__legend-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--color-border-default);
  }

  &__legend-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  &__legend-color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &__legend-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  &__legend-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__legend-symbol {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  &__legend-percent {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-brand-500);
    font-family: 'Britanica Expanded';
  }

  &__legend-value {
    font-size: 12px;
    color: var(--color-text-muted);
  }
}
</style>
