<template>
  <section class="overviewMarket">
    <div class="overviewMarket__top">
        <UISectionTitle>
            Market Overview
        </UISectionTitle>

        <NuxtLink class="overviewMarket__top__seeAll">
            Veja Todos
        </NuxtLink>
    </div>

    <UCarousel 
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
  </section>
</template>

<script lang="ts" setup>
const { prices, loading } = useCrypto()

console.log(prices, loading)
</script>

<style lang="scss" scoped>
.overviewMarket{
    max-width: max-content;

    &__top{
        display: flex;
        justify-content: space-between;

        &__seeAll{
            font-family: 'Britanica Expanded';
            color: #bdbdbd;
            font-size: 12px;
        }
    }
}
</style>