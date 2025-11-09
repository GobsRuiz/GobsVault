<template>
  <div class="layoutDashboard">
    <LayoutsSidebar class="col-start-1 row-span-2" />

    <LayoutsToolbar class="col-start-2 row-start-1" />

    <main class="col-start-2 row-start-2">
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.layoutDashboard{
  height: 100vh;
  display: grid;
  grid-template-columns: 70px 1fr;
  grid-template-rows: 70px auto;
  box-sizing: border-box;
  padding: 0 10px 10px 0;

  main{
    width: 100%;
    height: 100%;
    background-color: var(--ui-bg-accented);
    border-radius: 30px;
    overflow-y: auto;
    box-sizing: border-box;
    padding: 30px;
  }
}
</style>