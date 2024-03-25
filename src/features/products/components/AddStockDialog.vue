<script setup lang="ts">
import {
  Dialog,
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";
import {
  InboxArrowDownIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { Product, UpdateProduct } from "../composables";
import { ref, watch } from "vue";

type AddStockDialogProps = {
  isLoading?: boolean;
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<AddStockDialogProps>();
const emit = defineEmits<{
  (e: "save", formValues: UpdateProduct): void;
}>();

const stockAmount = ref(0);

function updateStock(nextStockAmount: number) {
  const isSubstracting = nextStockAmount < stockAmount.value;
  if (isSubstracting && nextStockAmount < 0) return;
  stockAmount.value = nextStockAmount;
}

function saveStock() {
  if (!props.product?.id)
    throw new Error("Product id is required to add to stock");
  emit("save", {
    current_stock: stockAmount.value,
    product_id: props.product.id,
  });
}

watch(
  () => openModel.value,
  (nextIsDialogOpen) => {
    if (!nextIsDialogOpen) return;
    stockAmount.value = props.product?.current_stock ?? 0;
  }
);
</script>

<template>
  <Dialog v-model:open="openModel">
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
      <div class="text-center mb-6">
        <div class="mb-2 mt-5">
          <div class="font-semibold text-7xl">{{ stockAmount }}</div>
        </div>

        <div class="flex justify-center gap-4">
          <Button @click="updateStock(stockAmount - 1)">
            <MinusIcon class="w-6 h-6 stroke-[2px]" />
          </Button>
          <Button @click="updateStock(stockAmount + 1)">
            <PlusIcon class="w-6 h-6 stroke-[2px]" />
          </Button>
        </div>
      </div>
      <DialogFooter>
        <Button
          :disabled="isLoading"
          @click="saveStock"
          type="button"
          class="w-full"
        >
          Guardar
        </Button>
        <Button
          :disabled="isLoading"
          @click="openModel = false"
          type="button"
          variant="outline"
        >
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
