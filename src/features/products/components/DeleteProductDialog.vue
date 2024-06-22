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
import { Product, useProductServices } from "../composables";
import { useMediaQuery } from "@vueuse/core";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { analytics } from "@/config/analytics";
import { notifyIfHasError } from "@/features/global";

type DeleteProductDialogProps = {
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<DeleteProductDialogProps>();

const queryClient = useQueryClient();
const productServices = useProductServices();
const isDesktop = useMediaQuery("(min-width: 768px)");
const deleteProductMutation = useMutation({
  mutationFn: async () => {
    const productId = props.product?.id;
    if (!productId) throw new Error("Product id required to perform delete");
    const { error } = await productServices.deleteProduct(productId);
    notifyIfHasError(error);
    openModel.value = false;
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    analytics.event("delete-product", props.product);
  },
});
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
          :disabled="deleteProductMutation.isPending.value"
          type="button"
          variant="destructive"
          @click="deleteProductMutation.mutate"
        >
          Si, eliminar
        </Button>
        <Button
          :disabled="deleteProductMutation.isPending.value"
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
            :disabled="deleteProductMutation.isPending.value"
            type="button"
            variant="destructive"
            @click="deleteProductMutation.mutate"
          >
            Si, eliminar
          </Button>
          <Button
            :disabled="deleteProductMutation.isPending.value"
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
