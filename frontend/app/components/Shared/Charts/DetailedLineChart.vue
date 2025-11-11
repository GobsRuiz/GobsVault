<template>
  <div class="detailed-chart">
    <div class="chart-header">
      <div class="chart-info">
        <h3 class="chart-title">{{ title }}</h3>
        <div class="chart-metrics">
          <span class="current-price">${{ currentPrice.toLocaleString() }}</span>
          <span
            class="price-change"
            :class="{ positive: change24h >= 0, negative: change24h < 0 }"
          >
            {{ change24h >= 0 ? '+' : '' }}{{ change24h.toFixed(2) }}%
          </span>
        </div>
      </div>
      <div class="chart-period">
        <span>24h</span>
      </div>
    </div>

    <div class="chart-container">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  Filler,
  PointElement,
  Tooltip,
  Title,
  Legend
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Filler,
  PointElement,
  Tooltip,
  Title,
  Legend
)

interface Props {
  data: number[]
  labels?: string[]
  title?: string
  currentPrice?: number
  change24h?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  labels: () => [],
  title: 'Price Chart',
  currentPrice: 0,
  change24h: 0,
  color: '#00dc82'
})

const chartData = computed(() => ({
  labels: props.labels.length > 0 ? props.labels : props.data.map((_, i) => i.toString()),
  datasets: [{
    label: props.title,
    data: props.data,
    borderColor: props.color,
    borderWidth: 2,
    tension: 0.4,
    fill: true,
    backgroundColor: (context: any) => {
      const chart = context.chart
      const { ctx, chartArea } = chart
      if (!chartArea) return null

      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
      const rgbColor = hexToRgb(props.color)
      gradient.addColorStop(0, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.3)`)
      gradient.addColorStop(1, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0)`)

      return gradient
    },
    pointRadius: 0,
    pointHoverRadius: 6,
    pointHoverBackgroundColor: props.color,
    pointHoverBorderColor: '#fff',
    pointHoverBorderWidth: 2,
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  animation: {
    duration: 1000,
  },
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      enabled: true,
      padding: 12,
      displayColors: false,
      callbacks: {
        title: (context: any) => {
          const label = context[0].label
          return label || ''
        },
        label: (context: any) => {
          const value = context.parsed.y
          return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      },
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderWidth: 1,
      borderColor: props.color,
      cornerRadius: 8,
      bodyFont: {
        family: 'Britanica Expanded',
        size: 12,
      },
      titleFont: {
        family: 'Britanica Expanded',
        size: 10,
      },
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.5)',
        font: {
          family: 'Britanica Expanded',
          size: 10,
        },
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
      }
    },
    y: {
      display: true,
      position: 'right' as const,
      grid: {
        display: true,
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.5)',
        font: {
          family: 'Britanica Expanded',
          size: 10,
        },
        callback: function(value: any) {
          return '$' + value.toLocaleString()
        }
      }
    }
  }
}

function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 220, b: 130 }
}
</script>

<style lang="scss" scoped>
.detailed-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.chart-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.chart-metrics {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
}

.price-change {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;

  &.positive {
    color: #00dc82;
    background: rgba(0, 220, 130, 0.1);
  }

  &.negative {
    color: #ff4d4d;
    background: rgba(255, 77, 77, 0.1);
  }
}

.chart-period {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
}

.chart-container {
  flex: 1;
  min-height: 300px;
  position: relative;
}
</style>
