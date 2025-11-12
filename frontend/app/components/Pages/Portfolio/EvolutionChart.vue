<template>
  <div class="evolution-chart">
    <div class="evolution-chart__header">
      <h3 class="evolution-chart__title">Evolução do Portfolio</h3>
      <div class="evolution-chart__period-selector">
        <UButton
          v-for="period in periods"
          :key="period.value"
          :label="period.label"
          size="xs"
          :variant="selectedPeriod === period.value ? 'solid' : 'ghost'"
          :color="selectedPeriod === period.value ? 'primary' : 'neutral'"
          @click="selectedPeriod = period.value"
        />
      </div>
    </div>

    <div v-if="loading" class="evolution-chart__loading">
      <p>Carregando histórico...</p>
    </div>

    <div v-else-if="error" class="evolution-chart__error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="chartData" class="evolution-chart__canvas-wrapper">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div v-else class="evolution-chart__empty">
      <p>Sem dados históricos disponíveis</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const { formatCurrency, formatPercent } = useFormatters()
const { history, loading, error, fetchHistory } = usePortfolioHistory()

// Period selector
const periods = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
  { label: '1A', value: 365 }
]

const selectedPeriod = ref(30)

// Watch period changes
watch(selectedPeriod, (newPeriod) => {
  fetchHistory(newPeriod)
})

// Fetch initial data
onMounted(() => {
  fetchHistory(selectedPeriod.value)
})

// Prepare chart data
const chartData = computed<ChartData<'line'> | null>(() => {
  if (!history.value || history.value.length === 0) return null

  const labels = history.value.map(snapshot => {
    const date = new Date(snapshot.date)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }).format(date)
  })

  const values = history.value.map(snapshot => snapshot.totalValue)

  return {
    labels,
    datasets: [
      {
        label: 'Valor do Portfolio',
        data: values,
        borderColor: 'rgb(0, 220, 130)',
        backgroundColor: 'rgba(0, 220, 130, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgb(0, 220, 130)',
        pointBorderColor: 'rgb(17, 24, 39)',
        pointBorderWidth: 2
      }
    ]
  }
})

// Chart options
const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgb(17, 24, 39)',
      titleColor: 'rgb(229, 231, 235)',
      bodyColor: 'rgb(229, 231, 235)',
      borderColor: 'rgb(55, 65, 81)',
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        title: (context) => {
          const index = context[0].dataIndex
          const snapshot = history.value[index]
          const date = new Date(snapshot.date)
          return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }).format(date)
        },
        label: (context) => {
          const index = context.dataIndex
          const snapshot = history.value[index]
          return [
            `Valor: ${formatCurrency(snapshot.totalValue)}`,
            `Investido: ${formatCurrency(snapshot.totalInvested)}`,
            `P&L: ${formatCurrency(snapshot.profitLoss)} (${formatPercent(snapshot.profitLossPercent)})`
          ]
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        color: 'rgb(156, 163, 175)',
        font: {
          size: 11
        },
        callback: (value) => {
          return formatCurrency(value as number)
        }
      },
      grid: {
        color: 'rgba(55, 65, 81, 0.3)',
        drawBorder: false
      }
    },
    x: {
      ticks: {
        color: 'rgb(156, 163, 175)',
        font: {
          size: 11
        },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8
      },
      grid: {
        display: false
      }
    }
  }
}))
</script>

<style lang="scss" scoped>
.evolution-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
  }

  &__period-selector {
    display: flex;
    gap: 4px;
  }

  &__canvas-wrapper {
    flex: 1;
    min-height: 300px;
    position: relative;
  }

  &__loading,
  &__error,
  &__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    color: var(--color-text-secondary);
    font-size: 14px;
  }

  &__error {
    color: var(--color-error-500);
  }
}
</style>
