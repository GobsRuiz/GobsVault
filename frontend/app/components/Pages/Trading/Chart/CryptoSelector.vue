<template>
  <div class="crypto-selector">
    <button
      v-for="crypto in cryptos"
      :key="crypto.symbol"
      class="crypto-button"
      :class="{ active: selectedSymbol === crypto.symbol }"
      @click="handleSelect(crypto.symbol)"
    >
      <span class="crypto-symbol">{{ crypto.symbol }}</span>
      <span
        class="crypto-change"
        :class="{ positive: crypto.change24h >= 0, negative: crypto.change24h < 0 }"
      >
        {{ crypto.change24h >= 0 ? '+' : '' }}{{ crypto.change24h.toFixed(2) }}%
      </span>
    </button>
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
  cryptos: CryptoPrice[]
  selectedSymbol: string
}

interface Emits {
  (e: 'update:selectedSymbol', symbol: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleSelect(symbol: string): void {
  emit('update:selectedSymbol', symbol)
}
</script>

<style lang="scss" scoped>
.crypto-selector {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.crypto-button {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &.active {
    background: rgba(0, 220, 130, 0.1);
    border-color: #00dc82;
  }
}

.crypto-symbol {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.crypto-change {
  font-size: 0.75rem;
  font-weight: 600;

  &.positive {
    color: #00dc82;
  }

  &.negative {
    color: #ff4d4d;
  }
}
</style>
