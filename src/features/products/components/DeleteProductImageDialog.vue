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
import { useProductServices } from "../composables";
import { useMediaQuery } from "@vueuse/core";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { notifyIfHasError, useLayerManager } from "@/features/global";
import { Tables } from "../../../../types_db";
import { Spinner } from "@/components";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const queryClient = useQueryClient();
const productServices = useProductServices();
const isDesktop = useMediaQuery("(min-width: 768px)");
const deleteProductImageMutation = useMutation({
  mutationFn: async () => {
    const productImage = props.layerManager.currentLayer.value.state
      .productImage as Tables<"product_images"> | null;
    if (!productImage)
      throw new Error("Product image is required to delete image");

    const response = await productServices.deleteProductImage(productImage);
    notifyIfHasError(response.error);
    await queryClient.invalidateQueries({ queryKey: ["product-images"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    openModel.value = false;
  },
});
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar imagen de producto</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente esta imagen. ¿Estás seguro de
          que deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex flex-row gap-2">
        <Button
          :disabled="deleteProductImageMutation.isPending.value"
          type="button"
          variant="secondary"
          @click="openModel = false"
          class="w-full"
        >
          Cancelar
        </Button>
        <Button
          :disabled="deleteProductImageMutation.isPending.value"
          type="button"
          variant="destructive"
          @click="deleteProductImageMutation.mutate()"
          class="w-full"
        >
          <Spinner
            v-if="deleteProductImageMutation.isPending.value"
            class="mr-3"
          />
          Si, eliminar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>Eliminar imagen de producto</DrawerTitle>
          <DrawerDescription>
            Esta acción eliminará permanentemente esta imagen. ¿Estás seguro de
            que deseas proceder con la eliminación?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter class="flex flex-row gap-2">
          <Button
            :disabled="deleteProductImageMutation.isPending.value"
            type="button"
            variant="secondary"
            @click="openModel = false"
            class="w-full"
          >
            Cancelar
          </Button>
          <Button
            :disabled="deleteProductImageMutation.isPending.value"
            type="button"
            variant="destructive"
            @click="deleteProductImageMutation.mutate()"
            class="w-full"
          >
            <Spinner
              v-if="deleteProductImageMutation.isPending.value"
              class="mr-3"
            />
            Si, eliminar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
