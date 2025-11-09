<template>
  <div class="variationBadge" :class="{ negative: change < 0 }">
    <UIcon
      :name="
        change >= 0 ? 'ant-design:rise-outlined' : 'ant-design:fall-outlined'
      "
      size="15"
    />

    <p>{{ Math.abs(change).toFixed(2) }}%</p>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  change: number;
}>();
</script>

<style lang="scss" scoped>
.variationBadge {
  max-width: max-content;
  display: flex;
  align-items: center;
  border-radius: 6px;
  background-color: #00dc82;
  padding: 3px 6px;

  &.negative {
    background-color: #ef4444;
  }

  p {
    font-family: "Britanica Expanded";
    font-size: 10px;
    font-weight: bold;
    margin-left: 5px;
  }
}
</style>
