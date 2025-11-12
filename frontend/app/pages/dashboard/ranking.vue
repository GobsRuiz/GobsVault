<template>
  <div>
    <UISectionTitle>
      Ranking
    </UISectionTitle>

    <div class="flex gap-4 mb-4">
        <UCard class="max-w-max">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items=center">
                    <UIcon name="cryptocurrency:btc" size="20" class="mr-2" />
                    <p class="text-sm">Seu rank no global</p>
                </div>
            </div>

            <p class="text-2xl text-bold" style="font-family: 'Britanica Expanded';">
                #7
            </p>

            <p>
                Out of 10,234 traders
            </p>
        </UCard>

        <UCard class="max-w-max">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items=center">
                    <UIcon name="cryptocurrency:btc" size="20" class="mr-2" />
                    <p class="text-sm">Seu rank nos amigos</p>
                </div>
            </div>

            <p class="text-2xl text-bold" style="font-family: 'Britanica Expanded';">
                #1
            </p>

            <p>
               Out of 4 friends
            </p>
        </UCard>
    </div>

    <UTabs :items="items">
        <template #global>
            <UTable :data="data" class="flex-1" />
        </template>

        <template #friends>
            <UTable :data="data" class="flex-1" />
        </template>
    </UTabs>
  </div>
</template>

<script lang="ts" setup>
import type { TabsItem } from '@nuxt/ui'

const items: TabsItem[] = [
  {
    label: 'Global',
    icon: 'i-lucide-user',
    slot: 'global'
  },
  {
    label: 'Amigos',
    icon: 'i-lucide-lock',
    slot: 'friends',
  },
]

const data = ref([
  {
    rank: '#1',
    user: {
        foto: "https://api.dicebear.com/7.x/initials/svg?seed=GobsRuiz",
        name: "Gabriel Ruiz",
        level: "12"
    },
    balance: 594,
  },
])

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>

<style>

</style>