<template>
  <div class="trading-page">
    <UISectionTitle>
      Trading
    </UISectionTitle>

    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <PagesTradingChart v-else :prices="prices" :loading="loading" />
  </div>
</template>

<script lang="ts" setup>
const { prices, loading, error } = useCrypto()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>

<style lang="scss" scoped>
</style>