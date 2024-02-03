<script setup lang="ts">
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Product } from "../composables";

type DeleteProductDialogProps = {
  isLoading?: boolean;
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
defineProps<DeleteProductDialogProps>();
const emit = defineEmits<{
  (e: "confirmDelete", formValues: Product | null): void;
}>();
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar {{ product?.name }}</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente el producto. ¿Estás seguro de
          que deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          :disabled="isLoading"
          type="button"
          variant="destructive"
          @click="$emit('confirmDelete', product)"
        >
          Si, eliminar
        </Button>
        <Button
          :disabled="isLoading"
          type="button"
          variant="secondary"
          @click="openModel = false"
        >
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
