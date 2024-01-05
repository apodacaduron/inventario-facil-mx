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
  open: boolean;
  isLoading?: boolean;
  product: Product | null;
};

const props = defineProps<AddStockDialogProps>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formValues: UpdateProduct): void;
}>();

const stockAmount = ref(0);

function closeDialog() {
  emit("close");
}

function addOneToStock() {
  stockAmount.value += 1;
}
function substractOneFromStock() {
  if (stockAmount.value <= 0) return;
  stockAmount.value -= 1;
}

function saveStock() {
  if (!props.product?.id)
    throw new Error("Product id is required to add to stock");
  emit("save", {
    current_stock: stockAmount.value,
    product_id: props.product.id,
  });
  closeDialog();
}

watch(
  () => props.open,
  (nextOpen) => {
    if (!nextOpen) return;
    stockAmount.value = props.product?.current_stock ?? 0;
  }
);
</script>

<template>
  <Dialog :open="open" @update:open="closeDialog">
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
        <DialogTitle class="text-center"> 🎉 Actualiza tu stock </DialogTitle>
        <DialogDescription class="text-center">
          Aumenta o reduce la cantidad de producto disponible
        </DialogDescription>
      </DialogHeader>
      <div class="text-center mb-6">
        <div class="mb-2 mt-5">
          <div class="font-semibold text-7xl">{{ stockAmount }}</div>
        </div>

        <div class="flex justify-center gap-4">
          <Button @click="substractOneFromStock"
            ><MinusIcon class="w-6 h-6 stroke-[2px]"
          /></Button>
          <Button @click="addOneToStock"
            ><PlusIcon class="w-6 h-6 stroke-[2px]"
          /></Button>
        </div>
      </div>
      <DialogFooter>
        <Button @click="saveStock" type="button" class="w-full">
          Guardar
        </Button>
        <Button @click="closeDialog" type="button" variant="outline">
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
