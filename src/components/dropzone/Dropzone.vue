<script setup lang="ts">
import { CloudUploadIcon, TrashIcon } from "lucide-vue-next";
import { useDropzone } from "vue3-dropzone";
import { Button, useToast } from "../ui";
import FileTypeIcon from "./FileTypeIcon.vue";
import { noop } from "@vueuse/core";

type Props = {
  supportedExtensions?: string[];
};

const acceptedFilesModel = defineModel<File[]>("acceptedFiles", {
  default: [],
});
const props = defineProps<Props>();

const { toast } = useToast();
const { getRootProps, getInputProps, isDragActive } = useDropzone({
  onDrop,
  accept: props.supportedExtensions?.join(","),
  onDropRejected(rejectReasons) {
    const rejectErrors = rejectReasons.flatMap(
      (rejectReason) => rejectReason.errors
    );
    const errorMessages = rejectErrors
      .map((rejectError) =>
        rejectError != null &&
        typeof rejectError === "object" &&
        "message" in rejectError
          ? rejectError.message
          : noop()
      )
      .filter(Boolean);

    const uniqueErrorMessages = new Set([...errorMessages]);

    toast({
      title: "Uh oh! Algo salió mal.",
      description: [...uniqueErrorMessages.values()].join("\r\n"),
      variant: "destructive",
      class: "whitespace-pre",
    });
  },
});

function onDrop(acceptFiles: File[]) {
  acceptedFilesModel.value?.push(...acceptFiles);
}

function removeFromAcceptedFiles(index: number) {
  acceptedFilesModel.value?.splice(index, 1);
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
</script>

<template>
  <div class="dropzone">
    <div
      :class="['dropzone__area', { 'dropzone__area--hover': isDragActive }]"
      v-bind="getRootProps()"
    >
      <input v-bind="getInputProps()" />
      <div class="border border-border rounded-lg p-2 shadow-sm">
        <CloudUploadIcon class="size-5" />
      </div>
      <div>
        <span class="text-primary font-semibold">Haz clic para subir</span> o
        arrastra y suelta <br />
        <div class="text-xs text-muted-foreground max-w-sm">
          Sube tus archivos de forma sencilla y rápida, seleccionándolos desde
          tu dispositivo o arrastrándolos directamente aquí.
        </div>
      </div>
    </div>

    <div v-if="acceptedFiles?.length" class="dropzone__list">
      <div
        class="dropzone__list-item"
        v-for="(file, index) in acceptedFiles"
        :key="index"
      >
        <div>
          <FileTypeIcon :fileType="file.type" />
        </div>
        <div class="flex-1">
          <div class="text-lg font-semibold line-clamp-1">
            {{ file.name }}
          </div>
          <div class="text-muted-foreground">
            {{ formatBytes(file.size) }}
          </div>
        </div>
        <div>
          <Button
            @click="removeFromAcceptedFiles(index)"
            variant="ghost"
            size="icon"
          >
            <TrashIcon class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dropzone {
  @apply max-w-3xl;
  @apply flex flex-col gap-4;
  &__area {
    @apply border border-border rounded-xl;
    @apply text-center select-none;
    @apply flex flex-col justify-center items-center gap-4;
    @apply p-8;

    &--hover {
      @apply transition-shadow ring-2 ring-primary;
    }
  }

  &__list {
    @apply flex flex-col gap-4;
  }
  &__list-item {
    @apply border border-border rounded-lg p-4;
    @apply flex gap-4;
  }
}
</style>
