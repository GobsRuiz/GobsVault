<template>
  <div class="layoutDefault">
    <LayoutsSidebar />

    <main>
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss">
.layoutDefault{
  height: 100vh;
  display: flex;
  box-sizing: border-box;
  padding: 10px 10px 10px 0;

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