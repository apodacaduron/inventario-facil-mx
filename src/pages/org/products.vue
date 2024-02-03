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
import { computed, ref, watchEffect } from "vue";
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
    enabled: computed(() => organizationStore.hasOrganizations),
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
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight text-slate-900 md:text-4xl dark:text-white"
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
    <div class="relative">
      <Input
        v-model="productSearch"
        type="search"
        placeholder="Buscar productos"
      />
    </div>
  </div>

  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table
      ref="tableRef"
      class="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400"
    >
      <thead
        class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400"
      >
        <tr>
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3 text-center">Cantidad</th>
          <th scope="col" class="px-6 py-3 text-center">Precio unitario</th>
          <th scope="col" class="px-6 py-3 text-center">Precio de venta</th>
          <th scope="col" class="px-6 py-3">Acción</th>
        </tr>
      </thead>
      <tbody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in productsQuery.data.value?.pages"
          :key="index"
        >
          <tr
            v-for="product in page.data"
            :key="product.id"
            class="bg-white border-b dark:bg-slate-900 dark:border-slate-800"
          >
            <th
              scope="row"
              class="flex items-center px-6 py-4 text-slate-900 whitespace-nowrap dark:text-white w-max"
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
            </th>
            <td class="text-center">
              {{ product.current_stock }}
            </td>
            <td class="text-center">
              {{ currencyFormatter.parse(product.unit_price) ?? "-" }}
            </td>
            <td class="text-center">
              {{ currencyFormatter.parse(product.retail_price) ?? "-" }}
            </td>
            <td class="px-6 py-4">
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
            </td>
          </tr>
        </template>
      </tbody>
    </table>
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
