<template>
  <div class="trade-history">
    <!-- Filters -->
    <div class="trade-history__filters">
      <USelect
        v-model="selectedType"
        :items="typeOptions"
        placeholder="Tipo"
        size="sm"
        class="trade-history__filter"
      />

      <USelect
        v-model="selectedSymbol"
        :items="symbolOptions"
        placeholder="Criptomoeda"
        size="sm"
        class="trade-history__filter"
      />

      <UButton
        icon="i-lucide-refresh-cw"
        size="sm"
        color="neutral"
        variant="soft"
        @click="handleRefresh"
        :loading="loading"
      >
        Atualizar
      </UButton>
    </div>

    <!-- Loading state -->
    <div v-if="loading && trades.length === 0" class="trade-history__loading">
      <USkeleton class="h-12 w-full mb-2" v-for="i in 5" :key="i" />
    </div>

    <!-- Empty state -->
    <div v-else-if="trades.length === 0" class="trade-history__empty">
      <UIcon name="i-lucide-history" size="48" class="trade-history__empty-icon" />
      <p class="trade-history__empty-text">Nenhum trade realizado</p>
      <p class="trade-history__empty-hint">
        Suas transações aparecerão aqui
      </p>
    </div>

    <!-- Table -->
    <div v-else class="trade-history__table-wrapper">
      <table class="trade-history__table">
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Tipo</th>
            <th>Cripto</th>
            <th>Quantidade</th>
            <th>Preço</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="trade in trades" :key="trade.id">
            <td>
              <span class="trade-history__date">
                {{ formatDateTime(trade.timestamp) }}
              </span>
            </td>
            <td>
              <UBadge
                :color="trade.type === 'BUY' ? 'success' : 'error'"
                variant="soft"
                size="xs"
              >
                {{ trade.type === 'BUY' ? 'COMPRA' : 'VENDA' }}
              </UBadge>
            </td>
            <td>
              <div class="trade-history__crypto">
                <UIcon :name="getCryptoIcon(trade.symbol)" size="20" />
                <span>{{ trade.symbol }}</span>
              </div>
            </td>
            <td>{{ formatCryptoAmount(trade.amount) }}</td>
            <td>{{ formatCurrency(trade.price) }}</td>
            <td class="trade-history__total">
              {{ formatCurrency(trade.total) }}
            </td>
            <td>
              <UBadge
                :color="trade.status === 'COMPLETED' ? 'primary' : 'neutral'"
                variant="soft"
                size="xs"
              >
                {{ trade.status === 'COMPLETED' ? 'CONCLUÍDO' : 'FALHOU' }}
              </UBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Load more -->
    <div v-if="trades.length >= limit" class="trade-history__load-more">
      <UButton
        variant="soft"
        color="neutral"
        @click="loadMore"
        :loading="loading"
      >
        Carregar mais
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CryptoSymbol } from '~/shared/types/portfolio.types'
import type { TradeHistoryQuery } from '~/composables/useTradeHistory'

const { trades, loading, fetchTradeHistory } = useTradeHistory()
const { getCryptoIcon, cryptoData } = useCryptoMetadata()
const { formatCurrency, formatCryptoAmount, formatDateTime } = useFormatters()

// Filters
const selectedType = ref<'ALL' | 'BUY' | 'SELL'>('ALL')
const selectedSymbol = ref<'ALL' | CryptoSymbol>('ALL')
const limit = ref(20)
const offset = ref(0)

const typeOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Compra', value: 'BUY' },
  { label: 'Venda', value: 'SELL' }
]

// Generate symbol options dynamically from cryptoData
const symbolOptions = computed(() => [
  { label: 'Todas', value: 'ALL' },
  ...Object.entries(cryptoData).map(([symbol, info]) => ({
    label: `${info.name} (${symbol})`,
    value: symbol
  }))
])

// Fetch trades with filters
const fetchWithFilters = async (append = false) => {
  const query: Partial<TradeHistoryQuery> = {
    limit: limit.value,
    offset: offset.value
  }

  if (selectedType.value !== 'ALL') {
    query.type = selectedType.value
  }

  if (selectedSymbol.value !== 'ALL') {
    query.symbol = selectedSymbol.value as CryptoSymbol
  }

  await fetchTradeHistory(query, append)
}

// Handle refresh
const handleRefresh = () => {
  offset.value = 0
  fetchWithFilters(false)
}

// Load more trades
const loadMore = () => {
  offset.value += limit.value
  fetchWithFilters(true) // Append mode
}

// Watch filters
watch([selectedType, selectedSymbol], () => {
  offset.value = 0
  fetchWithFilters(false)
})

// Initial fetch
onMounted(() => {
  fetchWithFilters(false)
})
</script>

<style lang="scss" scoped>
.trade-history {
  &__filters {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  &__filter {
    min-width: 150px;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  &__empty-icon {
    color: var(--color-text-muted);
    margin-bottom: 16px;
  }

  &__empty-text {
    font-size: 16px;
    color: var(--color-text-primary);
    margin-bottom: 8px;
  }

  &__empty-hint {
    font-size: 14px;
    color: var(--color-text-muted);
  }

  &__table-wrapper {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid var(--color-border-default);
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    thead {
      background-color: var(--color-dark-elevated);

      th {
        padding: 12px 16px;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    tbody {
      tr {
        border-top: 1px solid var(--color-border-default);
        transition: background-color 0.2s;

        &:hover {
          background-color: var(--color-dark-hover);
        }

        td {
          padding: 14px 16px;
          font-size: 14px;
          color: var(--color-text-primary);
        }
      }
    }
  }

  &__date {
    font-size: 13px;
    color: var(--color-text-muted);
  }

  &__crypto {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-brand-500);
  }

  &__total {
    font-family: 'Britanica Expanded';
    font-weight: 600;
  }

  &__load-more {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
}
</style>
