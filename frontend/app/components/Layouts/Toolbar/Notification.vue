<template>
  <div class="toolbarNotification">
    <UDropdownMenu :items="items" :ui="{ content: 'w-48' }">
      <Button class="toolbarNotification__btn">
        <UChip size="2xs">
          <UIcon name="mingcute:notification-line" size="20" />
        </UChip>
      </Button>
    </UDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const items: DropdownMenuItem[][] = [
[
    {
      label: 'Notificações',
      type: 'label'
    }
  ],
  [
    {
      label: "Level UP",
      icon: "gis:point",
      description: "Lorem ipsum dolor",
    },
  ],
];
</script>

<style lang="scss">
.toolbarNotification {
  height: 20px;
  
  &__btn {
    height: 20px;
  }
}
</style>
