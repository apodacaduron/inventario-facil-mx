<script lang="ts" setup>
import { useFormField } from "./useFormField";
import { cn } from "@/config/shadcn";

const { formDescriptionId } = useFormField();
</script>

<template>
  <p
    :id="formDescriptionId"
    :class="cn('text-[0.8rem] text-muted-foreground', $attrs.class ?? '')"
  >
    <slot />
  </p>
</template>
