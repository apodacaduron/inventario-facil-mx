<script setup lang="ts">
import { FileIcon } from "lucide-vue-next";
import { computed } from "vue";

type Props = {
  fileType: string;
};

const props = defineProps<Props>();

const fileType = computed(() => {
  const [_, type] = props.fileType.split("/");

  switch (type) {
    case "jpg":
    case "jpeg":
      return {
        class: "bg-purple-500 text-primary-foreground",
        text: type.toUpperCase(),
      };
    case "pdf":
      return {
        class: "bg-red-500 text-primary-foreground",
        text: type.toUpperCase(),
      };
    case "png":
      return {
        class: "bg-blue-500 text-primary-foreground",
        text: type.toUpperCase(),
      };

    default:
      return {
        class: "bg-secondary text-primary",
        text: type.toUpperCase() || "?",
      };
  }
});
</script>

<template>
  <div class="relative">
    <FileIcon class="size-12 text-muted-foreground stroke-[1px]" />
    <div
      :class="[
        fileType.class,
        'text-xs p-1 w-fit rounded-sm absolute bottom-2 -left-1',
      ]"
    >
      {{ fileType.text }}
    </div>
  </div>
</template>
