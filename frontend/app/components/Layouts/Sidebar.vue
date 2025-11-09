<template>
  <div class="sidebar">
    <UIcon name="iconamoon:lightning-1" size="40" class="mx-auto relative top-[5px]" />

    <nav class="sidebar__nav">
      <NuxtLink 
        v-for="(link, index) in links"
        :key="index"
        :to="link.to"
        active-class="active"
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
    icon: "si:dashboard-line",
    text: "OVERVIEW",
  },
  {
    to: "/portfolio",
    icon: "f7:chart-pie",
    text: "PORTFOLIO",
  },
  {
    to: "/trading",
    icon: "streamline-freehand:trading-graph",
    text: "TRADING",
  },
  {
    to: "/quests",
    icon: "tdesign:dart-board",
    text: "QUESTS",
  },
  {
    to: "/ranking",
    icon: "solar:ranking-line-duotone",
    text: "RANKING",
  },
]
</script>

<style lang="scss">
.sidebar{
  width: 100%;
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
      display: flex;
      align-items: center;
      border-radius: 6px;
      margin-bottom: 5px;
      padding: 10px;

      &:last-child{
        margin-bottom: 0;
      }

      &.active{
        background-color: rgba(#00dc82, .2);
      }

      &:hover{
        color: #000;
        background-color: #00dc82;
      }
    }
  }
}
</style>