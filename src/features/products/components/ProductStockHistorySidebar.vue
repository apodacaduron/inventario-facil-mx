<script setup lang="ts">
import {
  Sheet,
  Button,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Separator,
} from "@/components/ui";
import { Product, useProductStockHistoryQuery } from "../composables";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  HistoryIcon,
  MoveRightIcon,
} from "lucide-vue-next";
import { FeedbackCard, useTableStates } from "@/features/global";
import { toRef } from "vue";

type ProductStockHistorySidebarProps = {
  product?: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = withDefaults(defineProps<ProductStockHistorySidebarProps>(), {
  product: null,
});

const productStockHistoryQuery = useProductStockHistoryQuery({
  options: {
    enabled: toRef(() => Boolean(openModel.value && props.product?.id)),
    search: "",
    productId: toRef(() => props.product?.id),
    order: ["created_at", "desc"],
  },
});
const tableLoadingStates = useTableStates(productStockHistoryQuery, "");
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Historial de stock </SheetTitle>
        <SheetDescription>
          Consulta los cambios en el stock de tus productos a traves del tiempo.
        </SheetDescription>
      </SheetHeader>

      <FeedbackCard
        v-if="tableLoadingStates.showEmptyState.value"
        class="my-24"
      >
        <template #icon>
          <HistoryIcon class="size-10" />
        </template>
        <template #title>Este producto aun no tiene historial</template>
        <template #description
          >Una vez que el stock de alguno de tus productos tenga un cambio se
          mostrara aquí
        </template>
      </FeedbackCard>

      <div
        v-for="page in productStockHistoryQuery.data.value?.pages"
        class="flex flex-col gap-2 my-6"
      >
        <div v-for="product in page.data">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-4">
              <ChevronUpIcon
                v-if="(product.old_stock ?? 0) < (product.new_stock ?? 0)"
                class="size-6 text-green-500"
              />
              <ChevronDownIcon v-else class="size-6 text-red-500" />
              <div class="flex items-center gap-3">
                <span class="text-xl line-through text-muted-foreground">{{
                  product.old_stock
                }}</span>
                <MoveRightIcon class="size-4" />
                <span class="text-2xl">{{ product.new_stock }}</span>
              </div>
            </div>
            <div class="text-muted-foreground text-xs">
              {{
                new Date(product.created_at).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })
              }}
            </div>
          </div>
          <Separator />
        </div>
      </div>

      <SheetFooter class="flex flex-row gap-2">
        <Button
          class="w-full"
          @click="openModel = false"
          variant="outline"
          type="button"
          >Cerrar</Button
        >
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
