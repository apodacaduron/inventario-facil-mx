<script setup lang="ts">
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui";
import { Subscription } from "../composables";
import { useMediaQuery } from "@vueuse/core";

type DeleteSubscriptionDialogProps = {
  isLoading?: boolean;
  subscription: Subscription | null;
};

const openModel = defineModel<boolean>("open");
defineProps<DeleteSubscriptionDialogProps>();
const emit = defineEmits<{
  (e: "confirmDelete", formValues: Subscription | null): void;
}>();

const isDesktop = useMediaQuery("(min-width: 768px)");
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
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

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle
            >Eliminar suscripción de
            {{ subscription?.users?.full_name ?? "-" }}</DrawerTitle
          >
          <DrawerDescription>
            Esta acción eliminará permanentemente el suscripción. ¿Estás seguro
            de que deseas proceder con la eliminación?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
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
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
