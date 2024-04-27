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
import { Product } from "../composables";
import { useMediaQuery } from "@vueuse/core";

type DeleteProductDialogProps = {
  isLoading?: boolean;
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
defineProps<DeleteProductDialogProps>();
const emit = defineEmits<{
  (e: "confirmDelete", formValues: Product | null): void;
}>();

const isDesktop = useMediaQuery("(min-width: 768px)");
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
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

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>Eliminar {{ product?.name }}</DrawerTitle>
          <DrawerDescription>
            Esta acción eliminará permanentemente el producto. ¿Estás seguro de
            que deseas proceder con la eliminación?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
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
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
