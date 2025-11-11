<template>
  <div class="w-full">
    <div class="relative flex bg-dark-elevated rounded-lg p-1 gap-0">
      <button
        v-for="(item, index) in items"
        :key="item.key"
        class="flex-1 relative z-10 py-1.5 px-1.5 bg-transparent border-none rounded-md text-sm font-light cursor-pointer transition-colors duration-200"
        :class="modelValue === item.key ? 'text-black' : 'text-white/60 hover:text-white/80'"
        @click="selectTab(item.key)"
      >
        {{ item.label }}
      </button>
      <div
        class="absolute top-1 left-1 bottom-1 bg-brand-500 rounded-md z-0 transition-transform duration-250 ease-in-out"
        :style="indicatorStyle"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface TabItem {
  key: string
  label: string
}

interface Props {
  modelValue: string
  items: TabItem[]
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedIndex = computed(() => {
  return props.items.findIndex(item => item.key === props.modelValue)
})

const indicatorStyle = computed(() => {
  const index = selectedIndex.value
  const widthPercent = 100 / props.items.length
  return {
    width: `calc(${widthPercent}% - 4px)`,
    transform: `translateX(${(index * 100)}%)`
  }
})

function selectTab(key: string): void {
  emit('update:modelValue', key)
}
</script>
