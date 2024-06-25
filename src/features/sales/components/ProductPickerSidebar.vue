<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Avatar,
  AvatarFallback,
  Input,
  Card,
  CardContent,
  Button,
  CardFooter,
  AvatarImage,
  Badge,
  SheetFooter,
} from "@/components/ui";
import {
  FeedbackCard,
  useSidebarManager,
  useTableStates,
} from "@/features/global";
import {
  MinusIcon,
  PackagePlusIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "lucide-vue-next";
import { computed, ref, toRef } from "vue";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useRoute } from "vue-router";
import { Sale } from "../composables";
import { Product, useProductsQuery } from "@/features/products";

type Props = {
  sidebarManager: ReturnType<typeof useSidebarManager>;
  sale: Sale | null;
  activeProducts: Map<
    string,
    Pick<
      Sale["i_sale_products"][number],
      "product_id" | "price" | "unit_price" | "qty" | "name" | "image_url"
    >
  >;
};
type Emits = {
  (e: "select", customer: Props["activeProducts"] | null): void;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();
defineEmits<Emits>();

const productsRef = ref<HTMLElement | null>(null);
const productSearch = ref("");
const productSearchDebounced = refDebounced(productSearch, 400);

const filtersWithSelectedProductIds = computed(
  () =>
    props.sale?.i_sale_products
      .filter((product) => Boolean(product?.product_id))
      .map((product) => ({
        column: "id",
        operator: "eq",
        value: product.product_id ?? "Unknown",
        filterType: "or",
      })) ?? []
);

const route = useRoute();
const productsQuery = useProductsQuery({
  options: {
    enabled: toRef(() => openModel.value),
    orgId: toRef(() => route.params?.orgId?.toString()),
    search: productSearchDebounced,
    filters: toRef(() => {
      return [
        ...filtersWithSelectedProductIds.value,
        {
          column: "current_stock",
          operator: "gt",
          value: 0,
          filterType: "or",
        },
      ];
    }),
    order: ["name", "asc"],
  },
});
const productsLoadingStates = useTableStates(productsQuery, productSearch);
useInfiniteScroll(
  productsRef,
  () => {
    if (productsQuery.isFetching.value) return;
    productsQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => productsQuery.hasNextPage.value }
);

function updateProductFormQuantity(product: Product | null, quantity: number) {
  if (!product) return;

  if (quantity > getMaxIncrementValue(product)) return;
  if (quantity < 0) return;

  if (quantity === 0) {
    props.activeProducts?.delete(product.id);
  } else {
    props.activeProducts?.set(product.id, {
      image_url: product.image_url,
      name: product.name,
      price:
        props.activeProducts.get(product.id)?.price ?? product.retail_price,
      unit_price: product.unit_price,
      product_id: product.id,
      qty: quantity,
    });
  }
}

function decrementProductQuantity(product: Product | null) {
  if (!product) return;
  const currentQty = getProductQuantityFromForm(product);

  return updateProductFormQuantity(product, currentQty - 1);
}

function incrementProductQuantity(product: Product | null) {
  const currentQty = getProductQuantityFromForm(product);

  return updateProductFormQuantity(product, currentQty + 1);
}

function isDecrementDisabled(product: Product | null) {
  const maxDecrementValue = 0;
  const currentQty = getProductQuantityFromForm(product);

  return currentQty <= maxDecrementValue;
}

function isIncrementDisabled(product: Product | null) {
  const maxIncrementValue = getMaxIncrementValue(product);
  const currentQty = getProductQuantityFromForm(product);

  return currentQty >= maxIncrementValue;
}

function getProductQuantityFromForm(product: Product | null) {
  if (!product) return 0;

  return props.activeProducts?.get(product.id)?.qty ?? 0;
}

function getMaxIncrementValue(product: Product | null) {
  const matchingProduct = props.sale?.i_sale_products.find(
    (saleProduct) => saleProduct.product_id === product?.id
  );
  const initialFormQty = matchingProduct?.qty ?? 0;
  const currentStock = product?.current_stock ?? 0;

  if (initialFormQty > 0) return currentStock + initialFormQty;

  return currentStock;
}
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-100">
      <div ref="productsRef">
        <SheetHeader class="mb-6">
          <SheetTitle>Selecciona productos</SheetTitle>
          <SheetDescription>
            Selecciona fácilmente productos para agregar a tu venta
          </SheetDescription>
        </SheetHeader>
        <div class="flex gap-3">
          <Input
            v-model="productSearch"
            type="search"
            placeholder="Busca productos..."
          />
          <Button
            type="button"
            class="shrink-0"
            variant="ghost"
            size="icon"
            @click="sidebarManager.openSidebar('create-product')"
          >
            <PackagePlusIcon class="size-4" />
          </Button>
        </div>

        <FeedbackCard
          v-if="productsLoadingStates.showEmptyState.value"
          class="my-24"
        >
          <template #icon>
            <ShoppingBagIcon class="size-10" />
          </template>
          <template #title>No tienes productos en stock</template>
          <template #description
            >Cuando tengas productos en stock se mostraran aquí.
          </template>
        </FeedbackCard>

        <div v-else class="grid grid-cols-2 gap-3 mt-4 mb-10">
          <Card
            v-for="product in productsQuery.data.value?.pages.flatMap(
              (page) => page.data
            )"
            :key="product?.id"
            :class="`flex flex-col ${
              activeProducts?.has(product?.id ?? '') &&
              'border-black dark:border-white'
            }`"
          >
            <CardContent class="p-4 text-center">
              <div class="relative">
                <Avatar>
                  <AvatarImage :src="product?.image_url ?? ''" />
                  <AvatarFallback>{{
                    `${product?.name?.substring(0, 1).toLocaleUpperCase()}`
                  }}</AvatarFallback>
                </Avatar>
                <Badge class="absolute -top-1 -left-1 text-xs">
                  {{ product?.current_stock }}
                </Badge>
              </div>
              <div class="text-sm font-semibold line-clamp-2">
                {{ product?.name }}
              </div>
            </CardContent>
            <CardFooter class="px-2 pb-2 mt-auto">
              <div class="flex gap-1">
                <Button
                  :disabled="isDecrementDisabled(product)"
                  @click="decrementProductQuantity(product)"
                  class="shrink-0"
                  variant="outline"
                  size="icon"
                >
                  <MinusIcon class="size-4" />
                </Button>
                <Input
                  class="numeric-input"
                  :default-value="getProductQuantityFromForm(product)"
                  :value="getProductQuantityFromForm(product)"
                  type="number"
                  @update:model-value="
                    updateProductFormQuantity(product, Number($event))
                  "
                />
                <Button
                  :disabled="isIncrementDisabled(product)"
                  @click="incrementProductQuantity(product)"
                  class="shrink-0"
                  variant="outline"
                  size="icon"
                >
                  <PlusIcon class="size-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <SheetFooter>
          <Button @click="openModel = false" class="w-full" type="button">
            Aceptar
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped>
.numeric-input {
  text-align: center;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
    -moz-appearance: textfield;
  }
}
</style>
