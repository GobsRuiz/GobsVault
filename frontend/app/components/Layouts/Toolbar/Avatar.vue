<template>
  <div class="toolbarAvatar">
    <UDropdownMenu
      :items="items"
      :ui="{
        content: 'w-48'
      }"
    >
      <div class="toolbarAvatar__avatar">
        <p>{{ user?.username || 'Guest' }}</p>

        <UAvatar :src="avatarUrl" />
      </div>
    </UDropdownMenu>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownMenuItem } from "@nuxt/ui";

const { user, logout } = useAuth()

const avatarUrl = computed(() => {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${user.value?.username || 'Guest'}`
})

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: user.value?.username || 'Guest',
      avatar: {
        src: avatarUrl.value,
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
      onClick: () => logout()
    },
  ],
])
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
