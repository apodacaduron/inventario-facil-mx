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
import { Customer } from "../composables";

type DeleteCustomerDialogProps = {
  isLoading?: boolean;
  customer: Customer | null;
};

const openModel = defineModel<boolean>("open");
defineProps<DeleteCustomerDialogProps>();
const emit = defineEmits<{
  (e: "confirmDelete", formValues: Customer | null): void;
}>();
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar {{ customer?.name }}</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente a este cliente. ¿Estás seguro de
          que deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          :disabled="isLoading"
          type="button"
          variant="destructive"
          @click="$emit('confirmDelete', customer)"
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
