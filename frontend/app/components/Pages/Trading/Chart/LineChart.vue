<template>
  <div class="trading-chart">
    <SharedChartsDetailedLineChart
      v-if="crypto"
      :data="crypto.sparkline"
      :labels="timeLabels"
      :title="crypto.name"
      :current-price="crypto.price"
      :change24h="crypto.change24h"
      :color="color"
    />
  </div>
</template>

<script lang="ts" setup>
interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  sparkline: number[]
}

interface Props {
  crypto: CryptoPrice
  color: string
}

const props = defineProps<Props>()

const timeLabels = computed(() => {
  return generateTimeLabels(props.crypto.sparkline.length)
})

function generateTimeLabels(count: number): string[] {
  const labels: string[] = []
  const now = new Date()
  const intervalMinutes = Math.floor((24 * 60) / count)

  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - (count - i) * intervalMinutes * 60 * 1000)
    labels.push(time.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
      hour12: false
    }))
  }

  return labels
}
</script>

<style lang="scss" scoped>
.trading-chart {
  flex: 1;
  min-height: 400px;
}
</style>
