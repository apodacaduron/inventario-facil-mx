<script setup lang="ts">
import { Dropzone } from "@/components";
import {
  Sheet,
  Button,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui";
import { ref } from "vue";
import { Product } from "../composables";

type Props = {
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
defineProps<Props>();

const acceptedFiles = ref<File[]>([]);
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Subir imágenes de productos </SheetTitle>
        <SheetDescription>
          Agrega imágenes a tus productos arrastrándolas aquí o haciendo clic.
        </SheetDescription>
      </SheetHeader>

      <div class="my-6">
        <Dropzone
          v-model:acceptedFiles="acceptedFiles"
          :supportedExtensions="['.jpg', '.png', '.jpeg']"
        />
      </div>

      <SheetFooter class="flex flex-row gap-2">
        <Button
          @click="openModel = false"
          variant="outline"
          type="button"
          class="w-full"
          >Cancelar</Button
        >
        <Button
          :disabled="acceptedFiles.length === 0"
          type="submit"
          class="w-full"
          >Subir</Button
        >
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
