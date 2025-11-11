<template>
  <div class="chart-wrapper">
    <PagesTradingChartSkeleton v-if="loading" />

    <template v-else>
      <PagesTradingChartLineChart
        v-if="selectedCrypto"
        :crypto="selectedCrypto"
        :color="getCryptoColor(selectedCrypto.symbol)"
      />

      <PagesTradingChartCryptoSelector
        :cryptos="prices"
        :selected-symbol="selectedSymbol"
        @update:selected-symbol="selectedSymbol = $event"
      />
    </template>
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
  prices: CryptoPrice[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:selectedSymbol': [symbol: string]
}>()

const { getCryptoColor } = useCrypto()

const selectedSymbol = ref('BTC')

const selectedCrypto = computed(() => {
  return props.prices.find(c => c.symbol === selectedSymbol.value)
})

// Emit selected symbol changes to parent
watch(selectedSymbol, (newSymbol) => {
  emit('update:selectedSymbol', newSymbol)
})
</script>

<style lang="scss" scoped>
.chart-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
