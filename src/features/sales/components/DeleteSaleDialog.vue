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
import { Sale } from "../composables";

type DeleteSaleDialogProps = {
  isLoading?: boolean;
  sale: Sale | null;
};

const openModel = defineModel<boolean>("open");
defineProps<DeleteSaleDialogProps>();
const emit = defineEmits<{
  (e: "confirmDelete", formValues: Sale | null): void;
}>();
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar venta {{ sale?.id }}</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente esta venta. ¿Estás seguro de que
          deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          :disabled="isLoading"
          type="button"
          variant="destructive"
          @click="$emit('confirmDelete', sale)"
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
