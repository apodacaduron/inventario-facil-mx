<script setup lang="ts">
import {
  AddStockDialog,
  CreateProductSidebar,
  DeleteProductDialog,
  Product,
  ProductImagePreviewDialog,
  ProductImagesSidebar,
  ProductStockHistorySidebar,
  ShareStockDialog,
  UpdateProductSidebar,
  UploadProductImagesSidebar,
  useCurrencyFormatter,
} from "@/features/products";
import { ref, toRef, watchEffect } from "vue";
import {
  Button,
  Input,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Skeleton,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  Badge,
  DropdownMenuItem,
} from "@/components/ui";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  InboxArrowDownIcon,
  PlusIcon,
  ShareIcon,
  ShoppingBagIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll, useStorage } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useProductsQuery } from "@/features/products/composables/useProductQueries";
import {
  FeedbackCard,
  useLayerManager,
  useTableOrder,
  useTableStates,
} from "@/features/global";
import { useRoute } from "vue-router";
import {
  EditIcon,
  EllipsisVerticalIcon,
  HistoryIcon,
  ImageIcon,
} from "lucide-vue-next";
import DeleteProductImageDialog from "@/features/products/components/DeleteProductImageDialog.vue";

const tableRef = ref<HTMLElement | null>(null);
const productSearch = ref("");
const productSearchDebounced = refDebounced(productSearch, 400);
const tableFiltersRef = useStorage<{
  status: "in_stock" | "out_of_stock" | "all";
}>("products-table-filters", { status: "all" });
const isCreateProductSidebarOpen = ref(false);
const isUpdateProductSidebarOpen = ref(false);
const isDeleteProductDialogOpen = ref(false);
const isShareStockDialogOpen = ref(false);
const isAddStockDialogOpen = ref(false);
const isProductImageDialogOpen = ref(false);
const isProductStockHistorySidebarOpen = ref(false);
const activeProduct = ref<Product | null>(null);

const layerManager = useLayerManager();
const productsTableOrder = useTableOrder({
  options: {
    initialOrder: ["created_at", "desc"],
  },
});
const route = useRoute();
const organizationStore = useOrganizationStore();

const currencyFormatter = useCurrencyFormatter();
const productsQuery = useProductsQuery({
  options: {
    enabled: toRef(() => organizationStore.hasUserOrganizations),
    search: productSearchDebounced,
    orgId: toRef(() => route.params.orgId.toString()),
    order: toRef(() => productsTableOrder.tableOrder.value),
    filters: toRef(() => {
      if (tableFiltersRef.value.status === "all") return [];

      if (tableFiltersRef.value.status === "in_stock") {
        return [
          {
            column: "current_stock",
            operator: "gt",
            value: 0,
          },
        ];
      }

      return [
        {
          column: "current_stock",
          operator: "eq",
          value: 0,
        },
      ];
    }),
  },
});
useInfiniteScroll(
  tableRef,
  () => {
    if (productsQuery.isFetching.value) return;
    productsQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => productsQuery.hasNextPage.value }
);
const tableLoadingStates = useTableStates(productsQuery, productSearch);

function openDeleteProductDialog(product: Product) {
  activeProduct.value = product;
  isDeleteProductDialogOpen.value = true;
}

function openUpdateProductSidebar(product: Product) {
  activeProduct.value = product;
  isUpdateProductSidebarOpen.value = true;
}

function openProductImagesSidebar(product: Product) {
  activeProduct.value = product;
  layerManager.openLayer("product-images");
}

function openAddStockDialog(product: Product) {
  activeProduct.value = product;
  isAddStockDialogOpen.value = true;
}

function getProductStockBadgeProps(stock: number | null) {
  if (Number(stock) <= 0) return { variant: "destructive" } as const;

  const lowStockThreshold =
    organizationStore.currentUserOrganization?.i_organizations
      ?.low_stock_threshold ?? 0;

  const isLowStockWarningEnabled =
    organizationStore.canTriggerLowStockAlert &&
    Number(stock) <= lowStockThreshold;

  if (isLowStockWarningEnabled) {
    return {
      variant: "default",
      class: "bg-yellow-500 hover:bg-yellow-400",
    } as const;
  }

  return { variant: "default" } as const;
}

watchEffect(() => {
  if (isDeleteProductDialogOpen.value) return;
  if (isAddStockDialogOpen.value) return;
  if (isCreateProductSidebarOpen.value) return;
  if (isUpdateProductSidebarOpen.value) return;
  if (isProductImageDialogOpen.value) return;
  if (isProductStockHistorySidebarOpen.value) return;
  if (layerManager.hasAnyLayerOpen) return;

  activeProduct.value = null;
});
</script>

<template>
  <div
    ref="tableRef"
    class="py-6 mt-[71px] md:px-6 h-[calc(100vh-71px)] overflow-y-auto"
  >
    <div class="flex justify-between flex-col md:flex-row mx-4 md:mx-0">
      <div class="mb-6">
        <h2
          class="mb-0 md:mb-2 text-3xl font-extrabold leading-none tracking-tight md:text-4xl text-foreground"
        >
          Productos
        </h2>
        <p class="hidden md:block max-w-xl">
          Tus productos, tu control. Gestiona fácilmente tu inventario.
        </p>
      </div>
      <div class="hidden lg:flex gap-2">
        <Button
          :disabled="!organizationStore.canAddProducts"
          @click="isCreateProductSidebarOpen = true"
        >
          <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear producto
        </Button>
        <Button
          @click="isShareStockDialogOpen = true"
          variant="outline"
          size="icon"
        >
          <ShareIcon class="w-5 h-5 stroke-[2px]" />
        </Button>
      </div>
    </div>

    <div class="flex items-center justify-between pb-4 gap-4 mx-4 md:mx-0">
      <div class="flex gap-2">
        <Input
          v-model="productSearch"
          type="search"
          placeholder="Buscar productos"
          class="max-w-[256px]"
        />

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              :variant="
                tableFiltersRef.status === 'all' ? 'outline' : 'default'
              "
              size="icon"
            >
              <FunnelIcon class="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-56">
            <DropdownMenuLabel>Stock</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup v-model="tableFiltersRef.status">
              <DropdownMenuRadioItem value="all"> Todo </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="in_stock">
                En stock
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="out_of_stock">
                Fuera de stock
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="flex lg:hidden gap-2">
        <Button
          :disabled="!organizationStore.canAddProducts"
          @click="isCreateProductSidebarOpen = true"
          size="icon"
        >
          <PlusIcon class="w-5 h-5 stroke-[2px]" />
        </Button>
        <Button
          @click="isShareStockDialogOpen = true"
          variant="outline"
          size="icon"
        >
          <ShareIcon class="w-5 h-5 stroke-[2px]" />
        </Button>
      </div>
    </div>

    <div ref="tableRef" class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              @click="productsTableOrder.toggleTableOrder('name')"
              class="cursor-pointer pl-4"
            >
              <span class="flex items-center gap-2">
                Nombre
                <template
                  v-if="productsTableOrder.tableOrder.value[0] === 'name'"
                >
                  <ChevronUpIcon
                    v-if="productsTableOrder.tableOrder.value[1] === 'desc'"
                    class="h-4 w-4"
                  />
                  <ChevronDownIcon
                    v-if="productsTableOrder.tableOrder.value[1] === 'asc'"
                    class="h-4 w-4"
                  />
                </template>
              </span>
            </TableHead>
            <TableHead
              @click="productsTableOrder.toggleTableOrder('current_stock')"
              class="text-center cursor-pointer"
            >
              <span class="flex items-center gap-2">
                Cantidad
                <template
                  v-if="
                    productsTableOrder.tableOrder.value[0] === 'current_stock'
                  "
                >
                  <ChevronUpIcon
                    v-if="productsTableOrder.tableOrder.value[1] === 'desc'"
                    class="h-4 w-4"
                  />
                  <ChevronDownIcon
                    v-if="productsTableOrder.tableOrder.value[1] === 'asc'"
                    class="h-4 w-4"
                  />
                </template>
              </span>
            </TableHead>
            <TableHead class="text-center">Precio unitario</TableHead>
            <TableHead class="text-center"> Precio de venta </TableHead>
            <TableHead class="text-center"> - </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="tableLoadingStates.showLoadingState.value">
          <TableRow
            v-for="(_, index) in Array.from({ length: 15 })"
            :key="index"
          >
            <TableCell
              class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
            >
              <Skeleton class="w-[40px] h-[40px] rounded-full" />
              <div class="ps-3 flex flex-col gap-1">
                <div class="text-base font-semibold">
                  <Skeleton class="h-[20px] w-[180px]" />
                </div>
                <div class="font-normal text-slate-500">
                  <Skeleton class="h-4 w-[160px]" />
                </div>
              </div>
            </TableCell>
            <TableCell class="text-center items-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center items-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center">
              <Skeleton class="w-[54px] h-[36px]" />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody>
          <!-- @vue-ignore -->
          <template
            v-for="(page, index) in productsQuery.data.value?.pages"
            :key="index"
          >
            <TableRow v-for="product in page.data" :key="product.id">
              <TableCell
                class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
              >
                <Avatar class="cursor-pointer">
                  <AvatarImage
                    :src="product?.image_url ?? ''"
                    class="object-cover"
                  />
                  <AvatarFallback>{{
                    `${product?.name?.substring(0, 1).toLocaleUpperCase()}`
                  }}</AvatarFallback>
                </Avatar>
                <div class="ps-3">
                  <div class="text-base font-semibold">{{ product.name }}</div>
                  <div
                    v-if="product.description"
                    class="font-normal text-slate-500"
                  >
                    {{ product.description }}
                  </div>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <div class="flex items-center gap-4">
                  <Badge
                    v-bind="getProductStockBadgeProps(product.current_stock)"
                  >
                    {{ product.current_stock }}
                  </Badge>
                  <Button
                    v-if="organizationStore.isPremium"
                    @click="
                      isProductStockHistorySidebarOpen = true;
                      activeProduct = product;
                    "
                    variant="outline"
                    size="icon"
                  >
                    <HistoryIcon class="size-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell class="text-center">{{
                currencyFormatter.parse(product.unit_price) ?? "-"
              }}</TableCell>
              <TableCell class="text-center">
                {{ currencyFormatter.parse(product.retail_price) ?? "-" }}
              </TableCell>
              <TableCell class="text-center">
                <div class="flex justify-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button size="icon" variant="outline">
                        <EllipsisVerticalIcon class="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        @click="openUpdateProductSidebar(product)"
                      >
                        <EditIcon class="size-4 mr-2" />
                        Editar producto
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        @click="openProductImagesSidebar(product)"
                      >
                        <ImageIcon class="size-4 mr-2" />
                        Imágenes de producto
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="openAddStockDialog(product)">
                        <InboxArrowDownIcon class="size-4 mr-2" />
                        Actualizar stock
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        class="text-red-500"
                        @click="openDeleteProductDialog(product)"
                      >
                        <TrashIcon class="size-4 mr-2" />
                        Eliminar producto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <div
        v-if="productsQuery.isFetchingNextPage.value"
        class="w-full flex justify-center"
      >
        CARGANDO MAS...
      </div>

      <FeedbackCard
        v-if="tableLoadingStates.showEmptyState.value"
        class="mt-24"
      >
        <template #icon>
          <ShoppingBagIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>Comienza creando una producto</template>
        <template #description
          >Productos creadas se mostraran aquí. <br />
          Comienza creando la primera producto.
        </template>
        <template #action
          ><Button
            :disabled="!organizationStore.canAddProducts"
            @click="isCreateProductSidebarOpen = true"
          >
            <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear producto
          </Button>
        </template>
      </FeedbackCard>
      <FeedbackCard
        v-if="tableLoadingStates.showNoResultsState.value"
        class="mt-24"
      >
        <template #icon>
          <ShoppingBagIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>No se encontraron suscripciones</template>
        <template #description
          >Tu búsqueda "{{ productSearch }}" no coincidió con alguna producto.
          <br />
          Por favor intente de nuevo a agregue una nueva producto.
        </template>
        <template #action>
          <div class="flex gap-4">
            <Button @click="productSearch = ''" variant="outline">
              Clear search
            </Button>
            <Button
              :disabled="!organizationStore.canAddProducts"
              @click="isCreateProductSidebarOpen = true"
            >
              <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear producto
            </Button>
          </div>
        </template>
      </FeedbackCard>
    </div>

    <ProductImagePreviewDialog
      :layerManager="layerManager"
      :open="layerManager.currentLayer.value?.id === 'product-image-preview'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <DeleteProductImageDialog
      :layerManager="layerManager"
      :open="layerManager.currentLayer.value?.id === 'delete-product-image'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <UploadProductImagesSidebar
      :layerManager="layerManager"
      :product="activeProduct"
      :open="layerManager.currentLayer.value?.id === 'upload-product-images'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <ProductImagesSidebar
      :product="activeProduct"
      :layerManager="layerManager"
      :open="layerManager.currentLayer.value?.id === 'product-images'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <DeleteProductDialog
      v-model:open="isDeleteProductDialogOpen"
      :product="activeProduct"
    />
    <ShareStockDialog v-model:open="isShareStockDialogOpen" />
    <ProductStockHistorySidebar
      v-model:open="isProductStockHistorySidebarOpen"
      :product="activeProduct"
    />
    <CreateProductSidebar v-model:open="isCreateProductSidebarOpen" />
    <UpdateProductSidebar
      v-model:open="isUpdateProductSidebarOpen"
      :product="activeProduct"
    />
    <AddStockDialog
      v-model:open="isAddStockDialogOpen"
      :product="activeProduct"
    />
  </div>
</template>
