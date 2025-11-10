<template>
  <div class="layoutDashboard h-screen box-border py-2">
    <LayoutsSidebar class="col-start-1 row-span-2" />

    <LayoutsToolbar class="col-start-2 row-start-1" />

    <main class="col-start-2 row-start-2 rounded-4xl">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.layoutDashboard{
  display: grid;
  grid-template-columns: 70px 1fr;
  grid-template-rows: 70px auto;

  main{
    width: 100%;
    height: 100%;
    background-color: var(--ui-bg-accented);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 30px;
  }
}
</style>