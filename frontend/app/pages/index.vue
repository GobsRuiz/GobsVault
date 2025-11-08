<script setup lang="ts">
const { data: message } = await useFetch('https://api.chucknorris.io/jokes/random')
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-bold">🎮 GobsVault</h1>
      <p class="text-gray-400">Frontend configurado com sucesso!</p>
      
      <UCard v-if="message" class="max-w-md">
        <p class="text-sm">{{ message }}</p>
      </UCard>
    </div>
  </div>
</template>