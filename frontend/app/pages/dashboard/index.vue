<template>
  <div>
    <PagesOverviewTotalBalance />
    <PagesOverviewMarket />
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})
</script>

<style>

</style>