<template>
  <section class="max-w-max">
    <div class="flex justify-between">
        <UISectionTitle>
            Market Overview
        </UISectionTitle>

        <NuxtLink class="font-[Britanica_Expanded] text-[#bdbdbd] text-xs">
            Veja Todos
        </NuxtLink>
    </div>

    <UCarousel
      v-if="!loading"
      v-slot="{ item }"
      :items="prices"
      :ui="{ item: 'max-w-max' }"
      :watchDrag="false"
    >
      <SharedSimpleCryptoCard
        :key="item.symbol"
        :symbol="item.symbol"
        :name="item.name"
        :price="item.price"
        :change="item.change24h"
        :sparkline="item.sparkline"
      />
    </UCarousel>

    <div v-else class="flex gap-4 overflow-x-hidden">
      <SharedSimpleCryptoCardSkeleton v-for="i in 5" :key="i" />
    </div>
  </section>
</template>

<script lang="ts" setup>
const { prices, loading } = useCrypto()
</script>