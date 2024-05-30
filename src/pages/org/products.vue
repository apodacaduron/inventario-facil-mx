<script setup lang="ts">
import {
  AddStockDialog,
  CreateOrEditSidebar,
  CreateProduct,
  DeleteProductDialog,
  Product,
  ProductImageDialog,
  ShareStockDialog,
  UpdateProduct,
  productServicesTypeguards,
  useCurrencyFormatter,
  useProductServices,
  useProductsCountQuery,
} from '@/features/products';
import { ref, toRef, watchEffect } from 'vue';
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
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  InboxArrowDownIcon,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  ShoppingBagIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline';
import { refDebounced, useInfiniteScroll, useStorage } from '@vueuse/core';
import { useOrganizationStore, useSubscriptionStore } from '@/stores';
import { useProductsQuery } from '@/features/products/composables/useProductQueries';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { FeedbackCard, useServiceHelpers, useTableOrder, useTableStates } from '@/features/global';
import { analytics } from '@/config/analytics';

const tableRef = ref<HTMLElement | null>(null);

const productSearch = ref('');
const productSearchDebounced = refDebounced(productSearch, 400);
const tableFiltersRef = useStorage<{
  status: 'in_stock' | 'out_of_stock' | 'all';
}>('products-table-filters', { status: 'all' });
const isCreateOrUpdateSidebarOpen = ref(false);
const isDeleteProductDialogOpen = ref(false);
const isShareStockDialogOpen = ref(false);
const isAddStockDialogOpen = ref(false);
const isProductImageDialogOpen = ref(false);
const activeProduct = ref<Product | null>(null);
const productsTableOrder = useTableOrder({
  options: {
    initialOrder: ['created_at', 'desc'],
  },
});
const serviceHelpers = useServiceHelpers();
const organization = serviceHelpers.getCurrentOrganization();
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const subscriptionStore = useSubscriptionStore();
const productServices = useProductServices();
const createProductMutation = useMutation({
  mutationFn: createProductMutationFn,
});
const updateProductMutation = useMutation({
  mutationFn: updateProductMutationFn,
});
const deleteProductMutation = useMutation({
  mutationFn: deleteProductMutationFn,
});

const currencyFormatter = useCurrencyFormatter();
const productsCountQuery = useProductsCountQuery();
const productsQuery = useProductsQuery({
  options: {
    enabled: toRef(() => organizationStore.hasOrganizations),
    search: productSearchDebounced,
    organization_id: toRef(() => organization?.org_id?.toString()),
    order: toRef(() => productsTableOrder.tableOrder.value),
    filters: toRef(() => {
      if (tableFiltersRef.value.status === 'all') return [];

      if (tableFiltersRef.value.status === 'in_stock') {
        return [
          {
            column: 'current_stock',
            operator: 'gt',
            value: 0,
          },
        ];
      }

      return [
        {
          column: 'current_stock',
          operator: 'eq',
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

function handleSaveModal(formValues: CreateProduct | UpdateProduct) {
  if (productServicesTypeguards.isCreateProduct(formValues)) {
    createProductMutation.mutate(formValues);
  } else {
    updateProductMutation.mutate(formValues);
  }
  isCreateOrUpdateSidebarOpen.value = false;
  isAddStockDialogOpen.value = false;
}

function openUpdateProductSidebar(product: Product) {
  activeProduct.value = product;
  isCreateOrUpdateSidebarOpen.value = true;
}

function openAddStockDialog(product: Product) {
  activeProduct.value = product;
  isAddStockDialogOpen.value = true;
}

async function createProductMutationFn(formValues: CreateProduct) {
  await productServices.createProduct(formValues);
  await queryClient.invalidateQueries({ queryKey: ['products'] });
  analytics.event('create-product', formValues);
}
async function updateProductMutationFn(formValues: UpdateProduct) {
  const productId = formValues.product_id;
  if (!productId) throw new Error('Product id required to perform update');
  await productServices.updateProduct({
    ...formValues,
    product_id: productId,
  });
  await queryClient.invalidateQueries({ queryKey: ['products'] });
  analytics.event('update-product', formValues);
}
async function deleteProductMutationFn(product: Product | null) {
  const productId = product?.id;
  if (!productId) throw new Error('Product id required to perform delete');
  await productServices.deleteProduct(productId);
  isDeleteProductDialogOpen.value = false;
  await queryClient.invalidateQueries({ queryKey: ['products'] });
  analytics.event('delete-product', product);
}

watchEffect(() => {
  if (isDeleteProductDialogOpen.value) return;
  if (isAddStockDialogOpen.value) return;
  if (isCreateOrUpdateSidebarOpen.value) return;
  if (isProductImageDialogOpen.value) return;

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
          :disabled="
            !subscriptionStore.canAddProducts(productsCountQuery.data.value)
          "
          @click="isCreateOrUpdateSidebarOpen = true"
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
          :disabled="
            !subscriptionStore.canAddProducts(productsCountQuery.data.value)
          "
          @click="isCreateOrUpdateSidebarOpen = true"
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
                <Avatar class="cursor-pointer" @click="isProductImageDialogOpen = true; activeProduct = product">
                  <AvatarImage :src="product?.image_url ?? ''" />
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
              <TableCell class="text-center">{{
                product.current_stock
              }}</TableCell>
              <TableCell class="text-center">{{
                currencyFormatter.parse(product.unit_price) ?? '-'
              }}</TableCell>
              <TableCell class="text-center">
                {{ currencyFormatter.parse(product.retail_price) ?? '-' }}
              </TableCell>
              <TableCell class="text-center flex justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        size="icon"
                        variant="outline"
                        @click="openUpdateProductSidebar(product)"
                      >
                        <PencilIcon class="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar producto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        size="icon"
                        variant="outline"
                        @click="openAddStockDialog(product)"
                      >
                        <InboxArrowDownIcon class="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Actualizar stock</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        size="icon"
                        variant="outline"
                        class="text-red-500 dark:text-red-500"
                        @click="openDeleteProductDialog(product)"
                      >
                        <TrashIcon class="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eliminar producto</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <div v-if="productsQuery.isFetchingNextPage.value" class="w-full flex justify-center">LOADING...</div>

      <FeedbackCard
        v-if="tableLoadingStates.showEmptyState.value"
        class="mt-24"
      >
        <template #icon>
          <ShoppingBagIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>Comienza creando una producto</template>
        <template #description
          >Productos creadas se mostraran aqui. <br />
          Comienza creando la primera producto.
        </template>
        <template #action
          ><Button @click="isCreateOrUpdateSidebarOpen = true">
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
          >Tu busqueda "{{ productSearch }}" no coincidio con alguna producto.
          <br />
          Por favor intente de nuevo a agregue una nueva producto.
        </template>
        <template #action>
          <div class="flex gap-4">
            <Button @click="productSearch = ''" variant="outline">
              Clear search
            </Button>
            <Button @click="isCreateOrUpdateSidebarOpen = true">
              <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear producto
            </Button>
          </div>
        </template>
      </FeedbackCard>
    </div>

    <DeleteProductDialog
      v-model:open="isDeleteProductDialogOpen"
      :product="activeProduct"
      :isLoading="deleteProductMutation.isPending.value"
      @confirmDelete="deleteProductMutation.mutate"
    />
    <ShareStockDialog v-model:open="isShareStockDialogOpen" />
    <CreateOrEditSidebar
      v-model:open="isCreateOrUpdateSidebarOpen"
      :product="activeProduct"
      :isLoading="
        updateProductMutation.isPending.value ||
        createProductMutation.isPending.value
      "
      @save="handleSaveModal"
    />
    <AddStockDialog
      v-model:open="isAddStockDialogOpen"
      :product="activeProduct"
      :isLoading="updateProductMutation.isPending.value"
      @save="handleSaveModal"
    />
    <ProductImageDialog
      v-model:open="isProductImageDialogOpen"
      :product="activeProduct"
    />
  </div>
</template>
