<script setup lang="ts">
import { Dialog, Button, DialogContent } from "@/components/ui";
import {
  InboxArrowDownIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { Product } from "../composables";
import { ref, watch } from "vue";

type AddStockDialogProps = {
  open: boolean;
  isLoading?: boolean;
  product: Product | null;
};

const props = defineProps<AddStockDialogProps>();
const emits = defineEmits(["close"]);

const stockAmount = ref(0);

function closeDialog() {
  emits("close");
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
      <div>
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
        >
          <InboxArrowDownIcon
            class="h-6 w-6 stroke-[2px] text-green-600"
            aria-hidden="true"
          />
        </div>
        <div class="mt-3 text-center sm:mt-5">
          <h3
            class="text-lg font-medium leading-6 text-slate-900 dark:text-white"
          >
            🎉 Actualiza tu stock
          </h3>
          <div class="mt-2">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Aumenta o reduce la cantidad de producto disponible
            </p>
          </div>

          <div class="mb-2 mt-6">
            <div class="font-semibold text-7xl">{{ stockAmount }}</div>
          </div>

          <div class="flex justify-center gap-4">
            <Button><MinusIcon class="w-6 h-6 stroke-[2px]" /></Button>
            <Button><PlusIcon class="w-6 h-6 stroke-[2px]" /></Button>
          </div>
        </div>
      </div>
      <div class="mt-10 sm:mt-10 flex flex-col gap-3">
        <Button type="button" class="w-full"> Guardar </Button>
        <Button type="button" class="w-full" variant="outline">
          Cancelar
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
