<script setup lang="ts">
type BadgeProps = {
  color: "green" | "red" | "blue";
};

defineProps<BadgeProps>();
</script>

<template>
  <span :class="['badge', `badge--${color}`]">
    <slot />
  </span>
</template>

<style scoped lang="scss">
.badge {
  @apply text-xs font-medium me-2 px-2.5 py-0.5 rounded;
  &--green {
    @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300;
  }
  &--blue {
    @apply bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300;
  }
  &--red {
    @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300;
  }
}
</style>
