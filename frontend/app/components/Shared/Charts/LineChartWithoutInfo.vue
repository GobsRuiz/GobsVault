<template>
  <Line :data="chartData" :options="chartOptions" />
</template>

<script lang="ts" setup>
import { Line } from 'vue-chartjs'
import { Chart, CategoryScale, LinearScale, LineElement, Filler, PointElement, Tooltip } from 'chart.js'

Chart.register(CategoryScale, LinearScale, LineElement, Filler, PointElement, Tooltip)

interface Props {
  data: number[],
  color?: string,
}

const props = withDefaults(defineProps<Props>(), {
  color: '#00dc82'
})

const chartData = computed(() => ({
  labels: props.data.map(() => ''),

  datasets: [{
    data: props.data,
    borderColor: '#00dc82',
    borderWidth: 1,
    tension: .4,
    fill: true,

    backgroundColor: (context: any) => {
      const chart = context.chart
      const {ctx, chartArea} = chart
      if (!chartArea) return null
      
      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
      gradient.addColorStop(0, 'rgba(0, 220, 130, 0.2)')
      gradient.addColorStop(1, 'rgba(0, 220, 130, 0)')

      return gradient
    },

    pointRadius: 0,
    pointHoverRadius: 4,
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    mode: 'index' as const,
    intersect: false
  },

  plugins: {
    legend: { display: false },

    tooltip: { 
      enabled: true,
      padding: 4,
      displayColors: false,
      callbacks: {
        title: () => '',
        label: (context: any) => `$${context.parsed.y.toLocaleString()}`
      },

      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderWidth: 1,
      borderColor: 'rgba(0, 220, 130, 0.4)',
      cornerRadius: 8,
      bodyFont: {
        family: "Britanica Expanded",
        size: 7,
      },
    }
  },
  
  scales: {
    x: { display: false },
    y: { display: false }
  }
}
</script>