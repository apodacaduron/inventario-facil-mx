<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateProduct,
  Product,
  UpdateProduct,
  productServicesTypeguards,
  useCurrencyFormatter,
  useProductServices,
} from "@/features/products";
import { computed, ref } from "vue";
import {
  Button,
  Input,
  DropdownMenu,
  DropdownOption,
  Dialog,
  Textarea,
} from "@flavorly/vanilla-components";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import {
  refDebounced,
  useAsyncState,
  useClipboard,
  useInfiniteScroll,
} from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useProductsQuery } from "@/features/products/composables/useProductQueries";
import { useQueryClient } from "@tanstack/vue-query";

const tableRef = ref<HTMLElement | null>(null);
const shareText = ref("");
const productSearch = ref("");
const productSearchDebounced = refDebounced(productSearch, 400);
const productSidebarMode = ref<"create" | "update" | null>(null);
const isDeleteProductDialogOpen = ref(false);
const isShareProductsDialogOpen = ref(false);
const selectedProductFromActions = ref<Product | null>(null);
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const productServices = useProductServices();
const asyncCreateProduct = useAsyncState(productServices.createProduct, null);
const clipboard = useClipboard();
const currencyFormatter = useCurrencyFormatter();
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
  { distance: 10, canLoadMore: () => productsQuery.hasNextPage.value }
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
    await queryClient.removeQueries({ queryKey: ["products"] });
  },
  async update(formValues: UpdateProduct) {
    const productId = selectedProductFromActions.value?.id;
    if (!productId) throw new Error("Product id required to perform update");
    await asyncUpdateProduct.execute(0, {
      ...formValues,
      product_id: productId,
    });
    productSidebarMode.value = null;
    selectedProductFromActions.value = null;
    await queryClient.removeQueries({ queryKey: ["products"] });
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
  await queryClient.removeQueries({ queryKey: ["products"] });
}

async function shareExistingInventory() {
  const existingProducts =
    productsQuery.data.value?.pages.reduce<Product[]>((acc, page) => {
      const filteredProducts = page.data?.filter(
        (product) => (product.current_stock ?? 0) > 0
      );
      return [...acc, ...(filteredProducts ?? [])];
    }, []) ?? [];
  const inventoryString = existingProducts
    .map((product) => `${product.name}: ${product.current_stock ?? 0}`)
    .join("\r\n");

  // @ts-ignore
  if (navigator.share) {
    await navigator.share({
      title: "Productos disponibles",
      text: inventoryString,
    });
  } else {
    isShareProductsDialogOpen.value = true;
    shareText.value = inventoryString;
  }
}

function copyTextShareModal() {
  clipboard.copy(shareText.value);
  closeShareModal();
}
function closeShareModal() {
  isShareProductsDialogOpen.value = false;
  shareText.value = "";
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
    <div class="flex gap-2">
      <Button
        @click="productSidebarMode = 'create'"
        label="Crear producto"
        variant="primary"
      >
        <template #icon><PlusIcon class="w-5 h-5 stroke-[2px]" /></template>
      </Button>
      <Button @click="shareExistingInventory" variant="default">
        <template #default><ShareIcon class="w-5 h-5 stroke-[2px]" /></template>
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
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3 text-center">Cantidad</th>
          <th scope="col" class="px-6 py-3 text-center">Precio unitario</th>
          <th scope="col" class="px-6 py-3 text-center">Precio de venta</th>
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

  <Dialog v-model="isShareProductsDialogOpen">
    <div>
      <div
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
      >
        <ShareIcon
          class="h-6 w-6 stroke-[2px] text-green-600"
          aria-hidden="true"
        />
      </div>
      <div class="mt-3 text-center sm:mt-5">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          🎉 Lista de Productos disponibles
        </h3>
        <div class="mt-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            A continuación se muestra una lista de productos disponibles
            actualmente en stock. Puedes copiar y compartir esta lista según sea
            necesario.
          </p>
        </div>

        <div class="my-2">
          <Textarea autosize v-model="shareText" />
        </div>
      </div>
    </div>
    <div class="mt-5 sm:mt-6 flex flex-col gap-3">
      <Button
        type="button"
        class="w-full"
        variant="primary"
        @click="copyTextShareModal"
      >
        Copy
      </Button>
      <Button
        type="button"
        class="w-full"
        variant="default"
        @click="closeShareModal"
      >
        Close
      </Button>
    </div>
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
