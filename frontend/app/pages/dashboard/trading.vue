<template>
  <div class="trading-page">
    <UISectionTitle>
      Trading
    </UISectionTitle>

    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <div v-else class="grid grid-cols-[1fr_400px] gap-4">
      <PagesTradingChart
        :prices="prices"
        :loading="loading"
        @update:selected-symbol="selectedSymbol = $event"
      />
      <PagesTradingTrade
        :selected-symbol="selectedSymbol"
        :prices="prices"
        @trade-completed="handleTradeCompleted"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
const { prices, loading, error } = useCrypto()
const { fetchPortfolio, fetchSummary, loading: portfolioLoading } = usePortfolio()
const { fetchUser } = useUser()

// Manage selected crypto symbol
const selectedSymbol = ref('BTC')

// Handle trade completed event
const handleTradeCompleted = async () => {
  await fetchUser()
  await fetchPortfolio()
  await fetchSummary()
}

// Fetch all data on mount
onMounted(async () => {
  await fetchUser()
  await fetchPortfolio()
  await fetchSummary()
})

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>

<style lang="scss" scoped>
</style>
