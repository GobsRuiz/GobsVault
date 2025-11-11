<template>
  <div>
    <UCard>
      <!-- Crypto Header -->
      <div class="flex items-center justify-between mb-3">
        <div class="text-lg font-semibold">
          {{ selectedSymbol }}
        </div>

        <div>
          <p style="font-family: 'Britanica Expanded';" class="text-xl font-bold">
            ${{ currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <p class="text-right text-xs font-light text-gray-400">
            current price
          </p>
        </div>
      </div>

      <!-- Trade Mode Tabs -->
      <UITabsNoContent
        v-model="tradeMode"
        :items="[
          {key: 'buy', label: 'Comprar'},
          {key: 'sell', label: 'Vender'},
        ]"
      />

      <!-- Order Summary -->
      <div class="bg-gray-200 p-2 rounded-md my-3">
        <div class="flex items-center justify-between">
          <p class="text-gray-400 text-xs">
            {{ tradeMode === 'buy' ? 'Saldo Disponível:' : 'Holdings:' }}
          </p>

          <p class="text-black text-xs">
            {{ tradeMode === 'buy'
              ? `$${user?.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${currentHolding?.amount.toFixed(8) || '0.00000000'} ${selectedSymbol}`
            }}
          </p>
        </div>

        <p class="text-black text-sm my-1 font-semibold">
          Resumo da ordem
        </p>

        <div class="flex items-center justify-between">
          <p class="text-gray-400 text-xs">
            Quantidade:
          </p>

          <p class="text-black text-xs">
            {{ calculatedCryptoAmount }} {{ selectedSymbol }}
          </p>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-gray-400 text-xs">
            Preço:
          </p>

          <p class="text-black text-xs">
            ${{ currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
        </div>

        <div class="flex items-center justify-between">
          <p class="text-gray-400 text-xs">
            Valor:
          </p>

          <p class="text-black text-xs">
            ${{ amountDisplayValue }}
          </p>
        </div>
      </div>

      <!-- Trade Form -->
      <UForm @submit="onSubmit">
        <UFormField
          label="Valor em USD"
          name="amountUSD"
          :error="amountError"
          class="mb-4"
        >
          <UInput
            v-model="amountUSDValue"
            type="text"
            inputmode="decimal"
            placeholder="Mínimo: 10.00"
            maxlength="10"
            @input="handleInputChange"
          />
        </UFormField>

        <UButton
          type="submit"
          :color="tradeMode === 'buy' ? 'success' : 'error'"
          :loading="loading"
          :disabled="!canTrade || loading"
          class="block w-full"
        >
          {{ buttonText }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { ApiErrorHandler } from '~/utils/ApiErrorHandler'

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  sparkline: number[]
}

interface Props {
  selectedSymbol?: string
  prices: CryptoPrice[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedSymbol: 'BTC'
})

const emit = defineEmits<{
  'trade-completed': []
}>()

// Composables
const { user, fetchUser } = useUser()
const { executeBuy, executeSell, loading } = useTrade()
const { portfolio, fetchPortfolio, getHolding } = usePortfolio()

// State
const tradeMode = ref<'buy' | 'sell'>('buy')

// Computed: Current crypto price
const currentPrice = computed(() => {
  const crypto = props.prices.find(p => p.symbol === props.selectedSymbol)
  return crypto?.price || 0
})

// Computed: Current holding for selected symbol
const currentHolding = computed(() => {
  return getHolding(props.selectedSymbol)
})

// Computed: Max amount based on trade mode
const maxAmount = computed(() => {
  if (tradeMode.value === 'buy') {
    return user.value?.balance || 0
  } else {
    // For sell: max is holdings value in USD
    const holding = currentHolding.value
    if (!holding || !holding.amount) return 0
    return holding.amount * currentPrice.value
  }
})

// Validation Schema com Zod
const validationSchema = computed(() => {
  const max = maxAmount.value

  return toTypedSchema(
    z.object({
      amountUSD: z
        .string({
          required_error: 'Digite um valor'
        })
        .min(1, 'Digite um valor')
        .refine(
          (val) => /^\d+(\.\d{0,2})?$/.test(val),
          'Valor inválido. Use apenas números e até 2 casas decimais'
        )
        .transform((val) => parseFloat(val))
        .pipe(
          z
            .number({
              invalid_type_error: 'Valor deve ser um número válido'
            })
            .positive('Digite um valor maior que zero')
            .min(10, 'Valor mínimo: $10.00')
            .max(
              max,
              `Saldo insuficiente. Máximo: $${max.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            )
            .finite('Valor inválido')
        )
    })
  )
})

// Form setup
const { meta, handleSubmit, resetForm } = useForm({
  validationSchema
})

const { value: amountUSDValue, errorMessage: amountError } = useField<string>('amountUSD')

// Input handlers for USD format
const handleInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value

  // Remove tudo exceto números e ponto
  value = value.replace(/[^\d.]/g, '')

  // Permite apenas um ponto decimal
  const parts = value.split('.')
  if (parts.length > 2) {
    value = (parts[0] || '') + '.' + parts.slice(1).join('')
  }

  // Limita a 2 casas decimais em tempo real
  if (parts.length === 2 && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].substring(0, 2)
  }

  // Limita o valor total (máximo $999,999.99)
  if (parts[0].length > 6) {
    value = parts[0].substring(0, 6) + (parts[1] !== undefined ? '.' + parts[1] : '')
  }

  // Valida contra o máximo disponível em tempo real
  const numValue = parseFloat(value)
  if (!isNaN(numValue) && numValue > maxAmount.value && maxAmount.value > 0) {
    const maxValue = Math.floor(maxAmount.value * 100) / 100
    value = maxValue.toString()
  }

  amountUSDValue.value = value
}

// Computed: Convert string to number
const amountAsNumber = computed(() => {
  if (!amountUSDValue.value) return 0
  const num = parseFloat(amountUSDValue.value)
  return isNaN(num) ? 0 : num
})

// Computed: Display value formatado
const amountDisplayValue = computed(() => {
  if (!amountAsNumber.value) return '0.00'
  return amountAsNumber.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

// Computed: Calculate crypto amount
const calculatedCryptoAmount = computed(() => {
  if (!amountAsNumber.value || amountAsNumber.value <= 0 || currentPrice.value <= 0) {
    return '0.00000000'
  }
  return (amountAsNumber.value / currentPrice.value).toFixed(8)
})

// Computed: Can execute trade
const canTrade = computed(() => {
  if (!amountAsNumber.value || amountAsNumber.value < 10) return false
  if (!meta.value.valid) return false

  if (tradeMode.value === 'buy') {
    return user.value && user.value.balance >= amountAsNumber.value
  } else {
    const holding = currentHolding.value
    if (!holding || !holding.amount) return false
    const neededAmount = amountAsNumber.value / currentPrice.value
    return holding.amount >= neededAmount
  }
})

// Computed: Button text
const buttonText = computed(() => {
  if (loading.value) {
    return tradeMode.value === 'buy' ? 'Comprando...' : 'Vendendo...'
  }
  return tradeMode.value === 'buy' ? 'Comprar' : 'Vender'
})

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  if (!meta.value.valid || !canTrade.value) return

  // CRITICAL: Capture price at the moment of click
  const priceAtClick = currentPrice.value

  if (priceAtClick <= 0) {
    ApiErrorHandler.show({
      data: { error: { message: 'Preço da criptomoeda não disponível' } }
    }, 'Erro')
    return
  }

  try {
    if (tradeMode.value === 'buy') {
      const result = await executeBuy({
        symbol: props.selectedSymbol,
        amountUSD: values.amountUSD
      })

      if (result) {
        // Success feedback
        console.log('Compra realizada:', result)

        // Reset form
        resetForm()

        // Force refresh user session to update balance
        await fetchUser()

        // Update portfolio
        await fetchPortfolio()

        // Emit event to parent
        emit('trade-completed')
      }
    } else {
      const result = await executeSell({
        symbol: props.selectedSymbol,
        amountUSD: values.amountUSD
      })

      if (result) {
        // Success feedback
        console.log('Venda realizada:', result)

        // Reset form
        resetForm()

        // Force refresh user session to update balance
        await fetchUser()

        // Update portfolio
        await fetchPortfolio()

        // Emit event to parent
        emit('trade-completed')
      }
    }
  } catch (err: any) {
    ApiErrorHandler.show(err, tradeMode.value === 'buy' ? 'Erro na Compra' : 'Erro na Venda')
  }
})

// Watch trade mode changes to reset form
watch(tradeMode, () => {
  resetForm()
})

// Watch selected symbol changes to reset form
watch(() => props.selectedSymbol, () => {
  resetForm()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>
