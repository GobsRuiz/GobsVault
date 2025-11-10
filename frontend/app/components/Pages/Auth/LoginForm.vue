<template>
  <UForm @submit="onSubmit" class="w-full mx-auto mb-6">
    <UFormField label="Email ou Username" name="login" :error="loginError" class="mb-4">
      <UInput
        v-model="loginValue"
        type="text"
        placeholder="seu@email.com ou username"
      />
    </UFormField>

    <UFormField label="Password" name="password" :error="passwordError" class="mb-4">
      <UInput
        v-model="passwordValue"
        type="password"
        placeholder="Sua senha"
      />
    </UFormField>

    <UButton
      type="submit"
      color="primary"
      :loading="isLoggingIn"
      :disabled="!meta.valid || isLoggingIn"
    >
      {{ buttonText }}
    </UButton>
  </UForm>
</template>

<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '~/../../shared/schemas/auth.schema'
import { ApiErrorHandler } from '~/utils/ApiErrorHandler'
import { z } from 'zod'

type LoginSchema = z.infer<typeof loginSchema>

const { login } = useAuth()

const validationSchema = toTypedSchema(loginSchema)

const { meta } = useForm({
  validationSchema
})

const { value: loginValue, errorMessage: loginError } = useField<string>('login')
const { value: passwordValue, errorMessage: passwordError } = useField<string>('password')

const isLoggingIn = ref(false)

const buttonText = computed(() => {
  if (isLoggingIn.value) return 'Logando...'
  return 'Login'
})

async function onSubmit() {
  if (!meta.value.valid) return

  isLoggingIn.value = true

  try {
    const values = {
      login: loginValue.value,
      password: passwordValue.value
    }
    await login(values as LoginSchema)
  }
  catch (err: any) {
    isLoggingIn.value = false
    ApiErrorHandler.show(err, 'Erro no Login')
  }
}
</script>

<style lang="scss" scoped>
</style>
