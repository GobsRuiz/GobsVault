<template>
  <div class="h-screen bg-[#E2AD5E] box-border py-2 pr-2">
    <div class="h-full flex items-center mx-auto">
      <div class="flex-1">
        <img src="/images/img.png" alt="imagem ilustrativa" class="max-w-[700px] w-full ml-auto">
      </div>
  
      <div class="flex-1 h-full bg-dark-card rounded-4xl box-border my-5 p-5">
        <h1 class="text-center text-3xl mb-10">
          Bem vindo a GobsVault
        </h1>

        <div class="max-w-[300px] mx-auto">
          <PagesAuthLoginForm v-if="!isRegister" key="login" />
          <PagesAuthRegisterForm v-else key="register" />
        </div>

        <p v-if="!isRegister" class="text-center text-xs" @click="toggleToRegister">Você não tem uma conta? Cadastre-se</p>
        <p v-else class="text-center text-xs" @click="toggleToLogin">Você já tem uma conta? Faça o login</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: 'guest'
})

const isRegister = ref(false)

function toggleToRegister() {
  isRegister.value = true
}

function toggleToLogin() {
  isRegister.value = false
}
</script>

<style lang="scss" scoped>
</style>