<script setup lang="ts">
import { Badge } from "@/components/ui/badge";

type Props = {
  visible?: boolean;
};

defineProps<Props>();
</script>

<template>
  <div v-if="visible" class="relative w-fit inline-block">
    <slot />
    <Badge class="absolute -top-2 -right-2 text-[8px] px-1 py-1 leading-none"
      >PRO</Badge
    >
  </div>
  <slot v-else />
</template>
