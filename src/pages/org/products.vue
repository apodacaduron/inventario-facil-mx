<script setup lang="ts">
import {
  AddStockDialog,
  CreateOrEditSidebar,
  CreateProduct,
  DeleteProductDialog,
  Product,
  ShareStockDialog,
  UpdateProduct,
  productServicesTypeguards,
  useCurrencyFormatter,
  useProductServices,
} from "@/features/products";
import { ref, toRef, watchEffect } from "vue";
import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import {
  EllipsisVerticalIcon,
  InboxArrowDownIcon,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useProductsQuery } from "@/features/products/composables/useProductQueries";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

const tableRef = ref<HTMLElement | null>(null);

const productSearch = ref("");
const productSearchDebounced = refDebounced(productSearch, 400);
const productSidebarMode = ref<"create" | "update" | null>(null);
const isDeleteProductDialogOpen = ref(false);
const isShareStockDialogOpen = ref(false);
const isAddStockDialogOpen = ref(false);
const selectedProduct = ref<Product | null>(null);
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const productServices = useProductServices();
const createProductMutation = useMutation({
  mutationFn: productServices.createProduct,
});

const currencyFormatter = useCurrencyFormatter();
const productsQuery = useProductsQuery({
  options: {
    enabled: toRef(() => organizationStore.hasOrganizations),
    search: productSearchDebounced,
    order: ["created_at", "desc"],
  },
});
const deleteProductMutation = useMutation({
  mutationFn: productServices.deleteProduct,
});
const updateProductMutation = useMutation({
  mutationFn: productServices.updateProduct,
});
useInfiniteScroll(
  tableRef,
  () => {
    if (productsQuery.isFetching.value) return;
    productsQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => productsQuery.hasNextPage.value }
);

function openDeleteProductDialog(product: Product) {
  selectedProduct.value = product;
  isDeleteProductDialogOpen.value = true;
}

const productHandlers = {
  async create(formValues: CreateProduct) {
    await createProductMutation.mutateAsync(formValues);
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  },
  async update(formValues: UpdateProduct) {
    const productId = formValues.product_id;
    if (!productId) throw new Error("Product id required to perform update");
    await updateProductMutation.mutateAsync({
      ...formValues,
      product_id: productId,
    });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  },
};

async function handleSaveModal(formValues: CreateProduct | UpdateProduct) {
  if (productServicesTypeguards.isCreateProduct(formValues)) {
    await productHandlers.create(formValues);
  } else {
    await productHandlers.update(formValues);
  }
  productSidebarMode.value = null;
}

function openUpdateProductSidebar(product: Product) {
  selectedProduct.value = product;
  productSidebarMode.value = "update";
}

function openAddStockDialog(product: Product) {
  selectedProduct.value = product;
  isAddStockDialogOpen.value = true;
}

async function deleteProduct(product: Product | null) {
  const productId = product?.id;
  if (!productId) throw new Error("Product id required to perform delete");
  await deleteProductMutation.mutateAsync(productId);
  isDeleteProductDialogOpen.value = false;
  await queryClient.invalidateQueries({ queryKey: ["products"] });
}

watchEffect(() => {
  if (isDeleteProductDialogOpen.value) return;
  if (isAddStockDialogOpen.value) return;
  if (productSidebarMode.value) return;

  selectedProduct.value = null;
});
</script>

<template>
  <div class="flex items-center justify-between flex-col md:flex-row">
    <div class="mb-6">
      <h2
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight md:text-4xl text-foreground"
      >
        Productos
      </h2>
      <p class="max-w-xl">
        Tus productos, tu control. Gestiona fácilmente tu inventario.
      </p>
    </div>
    <div class="flex gap-2">
      <Button @click="productSidebarMode = 'create'">
        <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear producto
      </Button>
      <Button @click="isShareStockDialogOpen = true" variant="outline">
        <ShareIcon class="w-5 h-5 stroke-[2px]" />
      </Button>
    </div>
  </div>

  <div
    class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4"
  >
    <label for="table-search" class="sr-only">Buscar</label>
    <div>
      <Input
        v-model="productSearch"
        type="search"
        placeholder="Buscar productos"
      />
    </div>
  </div>

  <div ref="tableRef" class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead> Nombre </TableHead>
          <TableHead class="text-center">Cantidad</TableHead>
          <TableHead class="text-center">Precio unitario</TableHead>
          <TableHead class="text-center"> Precio de venta </TableHead>
          <TableHead class="text-center"> - </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in productsQuery.data.value?.pages"
          :key="index"
        >
          <TableRow v-for="product in page.data" :key="product.id">
            <TableCell
              class="flex items-center px-6 py-4 text-foreground whitespace-nowrap w-max"
            >
              <Avatar>
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
              currencyFormatter.parse(product.unit_price) ?? "-"
            }}</TableCell>
            <TableCell class="text-center">
              {{ currencyFormatter.parse(product.retail_price) ?? "-" }}
            </TableCell>
            <TableCell class="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline">
                    <EllipsisVerticalIcon class="w-5 h-5 stroke-[2px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem @click="openUpdateProductSidebar(product)">
                    <PencilIcon class="w-5 h-5 mr-2" />
                    <span>Actualizar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="openAddStockDialog(product)">
                    <InboxArrowDownIcon class="w-5 h-5 mr-2" />
                    <span>Actualizar stock</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="text-red-500 dark:text-red-500"
                    @click="openDeleteProductDialog(product)"
                  >
                    <TrashIcon class="w-5 h-5 mr-2" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>

  <DeleteProductDialog
    v-model:open="isDeleteProductDialogOpen"
    :product="selectedProduct"
    :isLoading="deleteProductMutation.isPending.value"
    @confirmDelete="deleteProduct"
  />
  <ShareStockDialog v-model:open="isShareStockDialogOpen" />
  <CreateOrEditSidebar
    :open="Boolean(productSidebarMode)"
    @close="productSidebarMode = null"
    :product="selectedProduct"
    :isLoading="
      updateProductMutation.isPending.value ||
      createProductMutation.isPending.value
    "
    @save="handleSaveModal"
  />
  <AddStockDialog
    v-model:open="isAddStockDialogOpen"
    :product="selectedProduct"
    :isLoading="updateProductMutation.isPending.value"
    @save="handleSaveModal"
  />
</template>
