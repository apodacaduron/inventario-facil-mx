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
import { Subscription } from "../composables";

type DeleteSubscriptionDialogProps = {
  isLoading?: boolean;
  subscription: Subscription | null;
};

const openModel = defineModel<boolean>("open");
defineProps<DeleteSubscriptionDialogProps>();
const emit = defineEmits<{
  (e: "confirmDelete", formValues: Subscription | null): void;
}>();
</script>

<template>
  <Dialog v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle
          >Eliminar suscripción de
          {{ subscription?.users?.full_name ?? "-" }}</DialogTitle
        >
        <DialogDescription>
          Esta acción eliminará permanentemente el suscripción. ¿Estás seguro de
          que deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          :disabled="isLoading"
          type="button"
          variant="destructive"
          @click="$emit('confirmDelete', subscription)"
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
