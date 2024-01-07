<script setup lang="ts">
import {
  AddStockDialog,
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
  Dialog,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Textarea,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { refDebounced, useClipboard, useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useProductsQuery } from "@/features/products/composables/useProductQueries";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

const tableRef = ref<HTMLElement | null>(null);
const shareText = ref("");
const productSearch = ref("");
const productSearchDebounced = refDebounced(productSearch, 400);
const productSidebarMode = ref<"create" | "update" | null>(null);
const isDeleteProductDialogOpen = ref(false);
const isShareProductsDialogOpen = ref(false);
const isAddStockDialogOpen = ref(false);
const selectedProductFromActions = ref<Product | null>(null);
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const productServices = useProductServices();
const createProductMutation = useMutation({
  mutationFn: productServices.createProduct,
});
const clipboard = useClipboard();
const currencyFormatter = useCurrencyFormatter();
const productsQuery = useProductsQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
    search: productSearchDebounced,
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
  selectedProductFromActions.value = product;
  isDeleteProductDialogOpen.value = true;
}
function closeDeleteProductDialog() {
  selectedProductFromActions.value = null;
  isDeleteProductDialogOpen.value = false;
}

function closeSidebar() {
  productSidebarMode.value = null;
  selectedProductFromActions.value = null;
}

const productHandlers = {
  async create(formValues: CreateProduct) {
    await createProductMutation.mutateAsync(formValues);
    productSidebarMode.value = null;
    selectedProductFromActions.value = null;
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  },
  async update(formValues: UpdateProduct) {
    const productId = formValues.product_id;
    if (!productId) throw new Error("Product id required to perform update");
    await updateProductMutation.mutateAsync({
      ...formValues,
      product_id: productId,
    });
    productSidebarMode.value = null;
    selectedProductFromActions.value = null;
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  },
};

async function handleSaveSidebar(formValues: CreateProduct | UpdateProduct) {
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

function openAddStockDialog(product: Product) {
  selectedProductFromActions.value = product;
  isAddStockDialogOpen.value = true;
}
function closeAddStockDialog() {
  selectedProductFromActions.value = null;
  isAddStockDialogOpen.value = false;
}

async function deleteProduct() {
  const productId = selectedProductFromActions.value?.id;
  if (!productId) throw new Error("Product id required to perform delete");
  await deleteProductMutation.mutateAsync(productId);
  isDeleteProductDialogOpen.value = false;
  selectedProductFromActions.value = null;
  await queryClient.invalidateQueries({ queryKey: ["products"] });
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
    .map((product) => `${product.name}`)
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
      <Button @click="shareExistingInventory" variant="outline">
        <ShareIcon class="w-5 h-5 stroke-[2px]" />
      </Button>
    </div>
  </div>

  <div
    class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4"
  >
    <label for="table-search" class="sr-only">Buscar</label>
    <div class="relative">
      <Input v-model="productSearch" placeholder="Buscar productos" />
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

  <Dialog
    :open="isDeleteProductDialogOpen"
    @update:open="closeDeleteProductDialog"
  >
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar Producto</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente el producto. ¿Estás seguro de
          que deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="destructive" @click="deleteProduct">
          Si, eliminar
        </Button>
        <Button
          type="button"
          variant="secondary"
          @click="closeDeleteProductDialog"
        >
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog
    :open="isShareProductsDialogOpen"
    @update:open="(isOpen) => (isShareProductsDialogOpen = isOpen)"
  >
    <DialogContent class="sm:max-w-[425px]">
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
          <h3
            class="text-lg font-medium leading-6 text-slate-900 dark:text-white"
          >
            🎉 Lista de Productos disponibles
          </h3>
          <div class="mt-2">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              A continuación se muestra una lista de productos disponibles
              actualmente en stock. Puedes copiar y compartir esta lista según
              sea necesario.
            </p>
          </div>

          <div class="my-2">
            <Textarea autosize v-model="shareText" />
          </div>
        </div>
      </div>
      <div class="mt-5 sm:mt-6 flex flex-col gap-3">
        <Button type="button" class="w-full" @click="copyTextShareModal">
          Copy
        </Button>
        <Button
          type="button"
          class="w-full"
          variant="outline"
          @click="closeShareModal"
        >
          Close
        </Button>
      </div>
    </DialogContent>
  </Dialog>

  <CreateOrEditSidebar
    :open="Boolean(productSidebarMode)"
    :product="selectedProductFromActions"
    :isLoading="
      updateProductMutation.isPending.value ||
      createProductMutation.isPending.value
    "
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
  <AddStockDialog
    :product="selectedProductFromActions"
    :open="isAddStockDialogOpen"
    @close="closeAddStockDialog"
    @save="handleSaveSidebar"
  />
</template>
