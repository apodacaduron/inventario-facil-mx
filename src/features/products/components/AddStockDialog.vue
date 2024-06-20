<script setup lang="ts">
import {
  Dialog,
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerHeader,
} from "@/components/ui";
import {
  InboxArrowDownIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { Product, UpdateProduct, useProductServices } from "../composables";
import { ref, toRef, watch } from "vue";
import { createReusableTemplate, useMediaQuery } from "@vueuse/core";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { analytics } from "@/config/analytics";
import { notifyIfHasError } from "@/features/global";

type AddStockDialogProps = {
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<AddStockDialogProps>();

const stockAmount = ref(0);

const queryClient = useQueryClient();
const productServices = useProductServices();
const [ModalBodyTemplate, ModalBody] = createReusableTemplate();
const isDesktop = useMediaQuery("(min-width: 768px)");
const updateProductMutation = useMutation({
  mutationFn: async (formValues: UpdateProduct) => {
    const productId = formValues.product_id;
    if (!productId) throw new Error("Product id required to perform update");
    const { error } = await productServices.updateProduct({
      ...formValues,
      product_id: productId,
    });
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    openModel.value = false;
    analytics.event("update-product-stock", formValues);
  },
});

const originalStockAmount = toRef(() => props.product?.current_stock ?? 0);
const stockDifference = toRef(
  () => stockAmount.value - originalStockAmount.value
);

function updateStock(nextStockAmount: number) {
  const isSubstracting = nextStockAmount < stockAmount.value;
  if (isSubstracting && nextStockAmount < 0) return;
  stockAmount.value = nextStockAmount;
}

function saveStock() {
  if (!props.product?.id)
    throw new Error("Product id is required to add to stock");
  updateProductMutation.mutate({
    current_stock: stockAmount.value,
    product_id: props.product.id,
  });
}

watch(
  () => openModel.value,
  (nextIsDialogOpen) => {
    if (!nextIsDialogOpen) return;
    stockAmount.value = originalStockAmount.value;
  }
);
</script>

<template>
  <ModalBodyTemplate>
    <div class="text-center mb-6 flex justify-between items-center">
      <Button @click="updateStock(stockAmount - 1)" variant="outline">
        <MinusIcon class="w-6 h-6 stroke-[2px]" />
      </Button>

      <div class="mb-2 mt-5 flex justify-center gap-2">
        <div
          v-if="
            originalStockAmount !== stockAmount && originalStockAmount !== 0
          "
          class="text-2xl text-red-500"
        >
          {{ originalStockAmount }}
        </div>
        <div class="font-semibold text-8xl">{{ stockAmount }}</div>
        <div
          v-if="
            originalStockAmount !== stockAmount && originalStockAmount !== 0
          "
          class="text-2xl"
        >
          <template v-if="stockDifference > 0">+</template>{{ stockDifference }}
        </div>
      </div>

      <Button @click="updateStock(stockAmount + 1)" variant="outline">
        <PlusIcon class="w-6 h-6 stroke-[2px]" />
      </Button>
    </div>
  </ModalBodyTemplate>

  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
        >
          <InboxArrowDownIcon
            class="h-6 w-6 stroke-[2px] text-green-600"
            aria-hidden="true"
          />
        </div>
        <DialogTitle class="text-center">
          🎉 Actualiza stock de {{ product?.name }}
        </DialogTitle>
        <DialogDescription class="text-center">
          Aumenta o reduce la cantidad de producto disponible
        </DialogDescription>
      </DialogHeader>
      <ModalBody />
      <DialogFooter>
        <Button
          :disabled="updateProductMutation.isPending.value"
          @click="saveStock"
          type="button"
          class="w-full"
        >
          Guardar
        </Button>
        <Button
          :disabled="updateProductMutation.isPending.value"
          @click="openModel = false"
          type="button"
          variant="outline"
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
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
          >
            <InboxArrowDownIcon
              class="h-6 w-6 stroke-[2px] text-green-600"
              aria-hidden="true"
            />
          </div>
          <DrawerTitle class="text-center">
            🎉 Actualiza stock de {{ product?.name }}
          </DrawerTitle>
          <DrawerDescription class="text-center">
            Aumenta o reduce la cantidad de producto disponible
          </DrawerDescription>
        </DrawerHeader>
        <ModalBody />
        <DrawerFooter>
          <Button
            :disabled="updateProductMutation.isPending.value"
            @click="saveStock"
            type="button"
            class="w-full"
          >
            Guardar
          </Button>
          <Button
            :disabled="updateProductMutation.isPending.value"
            @click="openModel = false"
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
