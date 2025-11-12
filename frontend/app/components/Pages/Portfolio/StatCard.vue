<template>
  <UCard class="stat-card">
    <div class="stat-card__header">
      <div class="stat-card__header-content">
        <UIcon v-if="icon" :name="icon" size="20" class="stat-card__icon" />
        <p class="stat-card__label">{{ label }}</p>
      </div>
    </div>

    <div class="stat-card__value-container">
      <p class="stat-card__value">
        {{ formattedValue }}
      </p>

      <VariationBadge v-if="variation !== undefined" :change="variation" />
    </div>
  </UCard>
</template>

<script lang="ts" setup>
interface Props {
  label: string
  value: number
  icon?: string
  variation?: number
  format?: 'currency' | 'number' | 'percent'
}

const props = withDefaults(defineProps<Props>(), {
  format: 'currency'
})

const { formatCurrency, formatNumber, formatPercent } = useFormatters()

const formattedValue = computed(() => {
  if (props.format === 'currency') {
    return formatCurrency(props.value)
  }

  if (props.format === 'percent') {
    return formatPercent(props.value)
  }

  return formatNumber(props.value)
})
</script>

<style lang="scss" scoped>
.stat-card {
  min-width: 200px;

  &__header {
    margin-bottom: 12px;
  }

  &__header-content {
    display: flex;
    align-items: center;
  }

  &__icon {
    margin-right: 8px;
    color: var(--color-brand-500);
  }

  &__label {
    font-size: 14px;
    color: var(--color-text-muted);
  }

  &__value-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__value {
    font-family: 'Britanica Expanded';
    font-size: 24px;
    font-weight: bold;
    color: var(--color-text-primary);
  }
}
</style>
