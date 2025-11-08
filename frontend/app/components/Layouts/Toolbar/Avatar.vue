<template>
  <div class="toolbarAvatar">
    <UDropdownMenu
      :items="items"
      :ui="{
        content: 'w-48'
      }"
    >
      <div class="toolbarAvatar__avatar">
        <p>Gabriel Eduardo Ruiz</p>

        <UAvatar src="https://github.com/benjamincanac.png" />
      </div>
    </UDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const items = ref<DropdownMenuItem[][]>([
  [
    {
      label: "Benjamin",
      avatar: {
        src: "https://github.com/benjamincanac.png",
      },
      type: "label",
    },
  ],
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
    },
    {
      label: "Settings",
      icon: "i-lucide-cog",
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      color: 'error',
    },
  ],
]);
</script>

<style lang="scss">
.toolbarAvatar {
  &__avatar {
    display: flex;
    align-items: center;
    margin-left: 40px;

    p {
      max-width: 120px;
      font-size: 10px;
      margin-right: 12px;
      padding-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
