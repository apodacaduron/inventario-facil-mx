<script setup lang="ts">
import { cn } from "@/config/shadcn";

const props = defineProps<{ class?: string }>();
</script>

<template>
  <tfoot
    :class="cn('bg-primary font-medium text-primary-foreground', props.class)"
  >
    <slot />
  </tfoot>
</template>
