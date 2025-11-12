<template>
  <UCard class="asset-card">
    <!-- Header with crypto icon and name -->
    <div class="asset-card__header">
      <div class="asset-card__icon-wrapper">
        <UIcon :name="cryptoIcon" size="32" />
      </div>

      <div class="asset-card__title">
        <p class="asset-card__name">{{ cryptoName }}</p>
        <p class="asset-card__symbol">{{ holding.symbol }}</p>
      </div>
    </div>

    <!-- Asset details -->
    <div class="asset-card__details">
      <div class="asset-card__row">
        <span class="asset-card__label">Quantidade</span>
        <span class="asset-card__value">{{ formattedAmount }} {{ holding.symbol }}</span>
      </div>

      <div class="asset-card__row">
        <span class="asset-card__label">Valor Atual</span>
        <span class="asset-card__value asset-card__value--highlight">
          {{ formattedCurrentValue }}
        </span>
      </div>

      <div class="asset-card__row">
        <span class="asset-card__label">Preço Médio de Compra</span>
        <span class="asset-card__value">{{ formattedAverageBuyPrice }}</span>
      </div>

      <div class="asset-card__row">
        <span class="asset-card__label">Preço Atual</span>
        <span class="asset-card__value">{{ formattedCurrentPrice }}</span>
      </div>

      <div class="asset-card__row">
        <span class="asset-card__label">Lucro/Prejuízo</span>
        <div class="asset-card__profit">
          <span
            class="asset-card__value"
            :class="{
              'asset-card__value--positive': holding.profitLoss > 0,
              'asset-card__value--negative': holding.profitLoss < 0
            }"
          >
            {{ formattedProfitLoss }}
          </span>
          <VariationBadge :change="holding.profitLossPercent" />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type { HoldingWithValue } from '~/shared/types/portfolio.types'

interface Props {
  holding: HoldingWithValue
}

const props = defineProps<Props>()

// Crypto metadata
const { getCryptoName, getCryptoIcon } = useCryptoMetadata()

const cryptoName = computed(() => getCryptoName(props.holding.symbol))
const cryptoIcon = computed(() => getCryptoIcon(props.holding.symbol))

// Formatters
const { formatCurrency, formatCryptoAmount, formatProfitLoss } = useFormatters()

const formattedAmount = computed(() => formatCryptoAmount(props.holding.amount))
const formattedCurrentValue = computed(() => formatCurrency(props.holding.currentValue))
const formattedAverageBuyPrice = computed(() => formatCurrency(props.holding.averageBuyPrice))
const formattedCurrentPrice = computed(() => formatCurrency(props.holding.currentPrice))
const formattedProfitLoss = computed(() => formatProfitLoss(props.holding.profitLoss))
</script>

<style lang="scss" scoped>
.asset-card {
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  &__icon-wrapper {
    margin-right: 12px;
    color: var(--color-brand-500);
  }

  &__title {
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 2px;
  }

  &__symbol {
    font-size: 12px;
    color: var(--color-text-muted);
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    font-size: 14px;
    color: var(--color-text-muted);
  }

  &__value {
    font-size: 14px;
    color: var(--color-text-primary);
    font-weight: 500;

    &--highlight {
      font-family: 'Britanica Expanded';
      font-size: 16px;
      font-weight: bold;
      color: var(--color-brand-500);
    }

    &--positive {
      color: #00dc82;
    }

    &--negative {
      color: #ef4444;
    }
  }

  &__profit {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
