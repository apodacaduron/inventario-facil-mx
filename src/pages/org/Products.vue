<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateProduct,
  Product,
  UpdateProduct,
  productServicesTypeguards,
  useProductServices,
} from "@/features/products";
import { computed, ref } from "vue";
import {
  Button,
  Input,
  DropdownMenu,
  DropdownOption,
  Dialog,
} from "@flavorly/vanilla-components";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useAsyncState, useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useProductsQuery } from "@/features/products/composables/useProductQueries";
import { useQueryClient } from "@tanstack/vue-query";

const tableRef = ref<HTMLElement | null>(null);
const productSearch = ref("");
const productSearchDebounced = refDebounced(productSearch, 400);
const productSidebarMode = ref<"create" | "update" | null>(null);
const isDeleteProductDialogOpen = ref(false);
const selectedProductFromActions = ref<Product | null>(null);
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const productServices = useProductServices();
const asyncCreateProduct = useAsyncState(productServices.createProduct, null);
const productsQuery = useProductsQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
    search: productSearchDebounced,
  },
});
const asyncDeleteProduct = useAsyncState(productServices.deleteProduct, null);
const asyncUpdateProduct = useAsyncState(productServices.updateProduct, null);
useInfiniteScroll(
  tableRef,
  () => {
    if (productsQuery.isFetching.value) return;
    productsQuery.fetchNextPage();
  },
  { distance: 10 }
);

function openDeleteProductDialog(product: Product) {
  selectedProductFromActions.value = product;
  isDeleteProductDialogOpen.value = true;
}

function closeSidebar() {
  productSidebarMode.value = null;
  selectedProductFromActions.value = null;
}

const productHandlers = {
  async create(formValues: CreateProduct) {
    await asyncCreateProduct.execute(0, formValues);
    productSidebarMode.value = null;
    selectedProductFromActions.value = null;
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  },
  async update(formValues: UpdateProduct) {
    const productId = selectedProductFromActions.value?.id;
    const stockId = selectedProductFromActions.value?.i_stock.find(Boolean)?.id;
    if (!productId) throw new Error("Product id required to perform update");
    if (!stockId) throw new Error("Stock id required to perform update");
    await asyncUpdateProduct.execute(0, {
      ...formValues,
      product_id: productId,
      stock_id: stockId,
    });
    productSidebarMode.value = null;
    selectedProductFromActions.value = null;
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  },
};

async function handleSaveSidebar(formValues: CreateProduct | UpdateProduct) {
  if (!productSidebarMode.value)
    throw new Error("productSidebarMode must not be null");
  if (productServicesTypeguards.isCreateProduct(formValues)) {
    await productHandlers.create(formValues);
  } else {
    await productHandlers.update(formValues);
  }
}

function openUpdateProductSidebar(product: Product) {
  selectedProductFromActions.value = product;
  productSidebarMode.value = "update";
}

async function deleteProduct() {
  const productId = selectedProductFromActions.value?.id;
  if (!productId) throw new Error("Product id required to perform delete");
  await asyncDeleteProduct.execute(0, productId);
  isDeleteProductDialogOpen.value = false;
  selectedProductFromActions.value = null;
  await queryClient.invalidateQueries({ queryKey: ["products"] });
}
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="mb-6">
      <h2
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white"
      >
        Productos
      </h2>
      <p class="max-w-xl">
        Tus productos, tu control. Gestiona fácilmente tu inventario.
      </p>
    </div>
    <div>
      <Button
        @click="productSidebarMode = 'create'"
        label="Crear producto"
        variant="primary"
      >
        <template #icon><PlusIcon class="w-5 h-5 stroke-[2px]" /></template>
      </Button>
    </div>
  </div>

  <div
    class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4"
  >
    <label for="table-search" class="sr-only">Buscar</label>
    <div class="relative">
      <Input v-model="productSearch" placeholder="Buscar productos">
        <template #before>
          <MagnifyingGlassIcon class="w-5 h-5 stroke-[2px]" /> </template
      ></Input>
    </div>
  </div>

  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table
      ref="tableRef"
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input
                id="checkbox-all-search"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label for="checkbox-all-search" class="sr-only">checkbox</label>
            </div>
          </th>
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Cantidad</th>
          <th scope="col" class="px-6 py-3">Acción</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="page in productsQuery.data.value?.pages">
          <tr
            v-for="(product, index) in page.data"
            :key="index"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <td class="w-4 p-4">
              <div class="flex items-center">
                <input
                  id="checkbox-table-search-1"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label for="checkbox-table-search-1" class="sr-only"
                  >checkbox</label
                >
              </div>
            </td>
            <th
              scope="row"
              class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
            >
              <img
                v-if="product.image_url"
                class="w-12 h-12 rounded-full"
                :src="product.image_url"
                alt="Rounded avatar"
              />
              <img
                v-else
                class="w-12 h-12 rounded-full"
                src="/product-placeholder.png"
                alt="Rounded avatar"
              />
              <div class="ps-3">
                <div class="text-base font-semibold">{{ product.name }}</div>
                <div
                  v-if="product.description"
                  class="font-normal text-gray-500"
                >
                  {{ product.description }}
                </div>
              </div>
            </th>
            <td>
              {{ product.i_stock.find(Boolean)?.current_stock }}
            </td>
            <td class="px-6 py-4">
              <DropdownMenu>
                <template #trigger>
                  <Button>
                    <template #default>
                      <EllipsisVerticalIcon class="w-5 h-5 stroke-[2px]" />
                    </template>
                  </Button>
                </template>

                <DropdownOption @click="openUpdateProductSidebar(product)">
                  <PencilIcon class="w-5 h-5 mr-2" />
                  <span>Actualizar</span>
                </DropdownOption>
                <DropdownOption @click="openDeleteProductDialog(product)">
                  <TrashIcon class="w-5 h-5 mr-2" />
                  <span>Eliminar</span>
                </DropdownOption>
              </DropdownMenu>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>

  <Dialog
    v-model="isDeleteProductDialogOpen"
    position="center"
    title="Eliminar Producto"
  >
    <div class="text-center">
      <p class="text-sm text-gray-500 dark:text-gray-200">
        Esta acción eliminará permanentemente el producto. ¿Estás seguro de que
        deseas proceder con la eliminación?
      </p>
    </div>
    <template #footer>
      <Button type="button" variant="primary" @click="deleteProduct">
        Si, eliminar
      </Button>
      <Button
        type="button"
        variant="secondary"
        @click="isDeleteProductDialogOpen = false"
      >
        Cancelar
      </Button>
    </template>
  </Dialog>

  <CreateOrEditSidebar
    :open="Boolean(productSidebarMode)"
    :mode="productSidebarMode ?? undefined"
    :product="selectedProductFromActions"
    :isLoading="
      asyncUpdateProduct.isLoading.value || asyncCreateProduct.isLoading.value
    "
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
</template>
