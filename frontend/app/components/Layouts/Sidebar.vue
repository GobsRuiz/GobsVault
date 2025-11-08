<template>
  <div class="sidebar">
    <UIcon name="iconamoon:lightning-1" size="20" />

    <nav class="sidebar__nav">
      <NuxtLink 
        v-for="(link, index) in links"
        :key="index"
        :to="link.to"
        class="sidebar__nav__link"
      >
        <UIcon :name="link.icon" size="20" />
      </NuxtLink>
    </nav>
  </div>
</template>

<script lang="ts" setup>
const links = [
  {
    to: "/",
    icon: "material-symbols:home",
    text: "Home",
  },
  {
    to: "/",
    icon: "material-symbols:home",
    text: "Home",
  },
  {
    to: "/",
    icon: "material-symbols:home",
    text: "Home",
  },
]
</script>

<style lang="scss">
.sidebar{
  max-width: max-content;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  padding: 12px;

  &__nav{
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__link{
      padding: 10px 5px;
    }
  }
}
</style>