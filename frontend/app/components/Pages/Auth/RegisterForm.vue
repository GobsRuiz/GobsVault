<template>
  <UForm @submit="onSubmit" class="w-full mx-auto mb-6">
    <UFormField label="Username" name="username" :error="usernameError" class="mb-4">
      <UInput
        v-model="usernameValue"
        type="text"
        placeholder="Seu username"
      />
    </UFormField>

    <UFormField label="Email" name="email" :error="emailError" class="mb-4">
      <UInput
        v-model="emailValue"
        type="email"
        placeholder="seu@email.com"
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
      :loading="isSubmitting || isLoggingIn"
      :disabled="!meta.valid || isSubmitting || isLoggingIn"
    >
      {{ buttonText }}
    </UButton>
  </UForm>
</template>

<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { registerSchema } from '~/../../shared/schemas/auth.schema'
import { ApiErrorHandler } from '~/utils/ApiErrorHandler'
import { z } from 'zod'

type RegisterSchema = z.infer<typeof registerSchema>

const { login } = useAuth()

const validationSchema = toTypedSchema(registerSchema)

const { meta } = useForm({
  validationSchema
})

const { value: usernameValue, errorMessage: usernameError } = useField<string>('username')
const { value: emailValue, errorMessage: emailError } = useField<string>('email')
const { value: passwordValue, errorMessage: passwordError } = useField<string>('password')

const isSubmitting = ref(false)
const isLoggingIn = ref(false)

const buttonText = computed(() => {
  if (isSubmitting.value) return 'Cadastrando...'
  if (isLoggingIn.value) return 'Logando...'
  return 'Cadastrar'
})

async function onSubmit() {
  if (!meta.value.valid) return

  isSubmitting.value = true

  try {
    const values = {
      username: usernameValue.value,
      email: emailValue.value,
      password: passwordValue.value
    }

    const response = await $fetch<{ success: boolean }>('/api/auth/register', {
      method: 'POST',
      body: values as RegisterSchema
    })

    if (response.success) {
      isSubmitting.value = false
      isLoggingIn.value = true

      await login({
        login: values.email,
        password: values.password
      })
    }
  } catch (err: any) {
    isSubmitting.value = false
    isLoggingIn.value = false
    ApiErrorHandler.show(err, 'Erro no Cadastro')
  }
}
</script>

<style lang="scss" scoped>
</style>
