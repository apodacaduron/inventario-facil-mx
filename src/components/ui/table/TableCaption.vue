<script setup lang="ts">
import { cn } from "@/config/shadcn";

const props = defineProps<{ class?: string }>();
</script>

<template>
  <caption :class="cn('mt-4 text-sm text-muted-foreground', props.class)">
    <slot />
  </caption>
</template>
