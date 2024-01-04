<script setup lang="ts">
import {
  CreateSidebar,
  CreateSale,
  Sale,
  UpdateSale,
  saleServicesTypeguards,
  useSaleServices,
  UpdateSidebar,
} from "@/features/sales";
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
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useSalesQuery } from "@/features/sales/composables/useSaleQueries";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useCurrencyFormatter } from "@/features/products";
import { Badge } from "@/components";

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL;
const tableRef = ref<HTMLElement | null>(null);
const saleSearch = ref("");
const saleSidebarMode = ref<"create" | "update" | null>(null);
const isDeleteSaleDialogOpen = ref(false);
const selectedSaleFromActions = ref<Sale | null>(null);
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const saleServices = useSaleServices();
const createSaleMutation = useMutation({ mutationFn: saleServices.createSale });
const currencyFormatter = useCurrencyFormatter();
const salesQuery = useSalesQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
  },
});
const deleteSaleMutation = useMutation({ mutationFn: saleServices.deleteSale });
const updateSaleMutation = useMutation({ mutationFn: saleServices.updateSale });
useInfiniteScroll(
  tableRef,
  () => {
    if (salesQuery.isFetching.value) return;
    salesQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => salesQuery.hasNextPage.value }
);

function openDeleteSaleDialog(sale: Sale) {
  selectedSaleFromActions.value = sale;
  isDeleteSaleDialogOpen.value = true;
}

function closeSidebar() {
  saleSidebarMode.value = null;
  selectedSaleFromActions.value = null;
}

const saleHandlers = {
  async create(formValues: CreateSale) {
    await createSaleMutation.mutateAsync(formValues);
    saleSidebarMode.value = null;
    selectedSaleFromActions.value = null;
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
  },
  async update(formValues: UpdateSale) {
    await updateSaleMutation.mutateAsync(formValues);
    saleSidebarMode.value = null;
    selectedSaleFromActions.value = null;
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
  },
};

async function handleSaveSidebar(formValues: CreateSale | UpdateSale) {
  if (!saleSidebarMode.value)
    throw new Error("saleSidebarMode must not be null");
  if (saleServicesTypeguards.isCreateSale(formValues)) {
    await saleHandlers.create(formValues);
  } else {
    await saleHandlers.update(formValues);
  }
}

function openUpdateSaleSidebar(sale: Sale) {
  selectedSaleFromActions.value = sale;
  saleSidebarMode.value = "update";
}

async function deleteSale() {
  const saleId = selectedSaleFromActions.value?.id;
  if (!saleId) throw new Error("Sale id required to perform delete");
  await deleteSaleMutation.mutateAsync(saleId);
  isDeleteSaleDialogOpen.value = false;
  selectedSaleFromActions.value = null;
  await queryClient.invalidateQueries({ queryKey: ["sales"] });
}

function getBadgeColorFromStatus(status: Sale["status"]) {
  switch (status) {
    case "cancelled":
      return "red";
    case "in_progress":
      return "blue";
    case "completed":
      return "green";
    default:
      return "blue";
  }
}
</script>

<template>
  <div class="flex items-center justify-between flex-col md:flex-row">
    <div class="mb-6">
      <h2
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white"
      >
        Ventas
      </h2>
      <p class="max-w-xl">
        Tus ventas, tu control. Gestiona fácilmente tu lista de ventas.
      </p>
    </div>
    <div>
      <Button
        @click="saleSidebarMode = 'create'"
        label="Crear venta"
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
      <Input v-model="saleSearch" placeholder="Buscar ventas">
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
          <th scope="col" class="px-6 py-3 text-center">Productos</th>
          <th scope="col" class="px-6 py-3 text-center">Cantidad</th>
          <th scope="col" class="px-6 py-3 text-center">Total</th>
          <th scope="col" class="px-6 py-3 text-center">Costo de envio</th>
          <th scope="col" class="px-6 py-3 text-center">Estatus</th>
          <th scope="col" class="px-6 py-3 text-center">Creado</th>
          <th scope="col" class="px-6 py-3">Acción</th>
        </tr>
      </thead>
      <tbody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in salesQuery.data.value?.pages"
          :key="index"
        >
          <tr
            v-for="sale in page.data"
            :key="sale.id"
            class="bg-white border-b dark:bg-gray-900 dark:border-gray-800"
          >
            <th
              scope="row"
              class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white min-w-[200px]"
            >
              <img
                class="w-12 h-12 rounded-full"
                src="/customer-placeholder.jpg"
                alt="Rounded avatar"
              />
              <div class="ps-3">
                <div class="text-base font-semibold">
                  {{ sale.i_customers?.name }}
                </div>
                <div
                  v-if="sale.i_customers?.phone"
                  class="font-normal text-gray-500"
                >
                  <a
                    :href="`${WHATSAPP_URL}/${sale.i_customers.phone}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block"
                  >
                    {{ sale.i_customers.phone }}
                  </a>
                </div>
              </div>
            </th>
            <td class="text-center">
              <div class="flex -space-x-4 rtl:space-x-reverse w-fit mx-auto">
                <img
                  v-for="saleProduct in sale.i_sale_products.slice(0, 3)"
                  :key="saleProduct.id"
                  class="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
                  :src="
                    saleProduct.i_products?.image_url ??
                    '/product-placeholder.png'
                  "
                />
                <div
                  v-if="sale.i_sale_products.length > 3"
                  class="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800"
                >
                  {{ sale.i_sale_products.length - 3 }}
                </div>
              </div>
            </td>
            <td class="text-center">
              {{
                sale.i_sale_products.reduce(
                  (acc, saleProduct) => acc + (saleProduct.qty ?? 0),
                  0
                )
              }}
            </td>
            <td class="text-center">
              {{
                currencyFormatter.parse(
                  sale.i_sale_products.reduce(
                    (acc, saleProduct) =>
                      acc + (saleProduct.qty ?? 0) * (saleProduct.price ?? 0),
                    0
                  )
                )
              }}
            </td>
            <td class="text-center">
              {{ currencyFormatter.parse(sale.shipping_cost) }}
            </td>
            <td class="text-center">
              <Badge :color="getBadgeColorFromStatus(sale.status)"
                >{{ sale.status?.toLocaleUpperCase() }}
              </Badge>
            </td>
            <td class="text-center">
              {{
                new Date(sale.created_at).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
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

                <DropdownOption>
                  <EyeIcon class="w-5 h-5 mr-2" />
                  <span>Ver</span>
                </DropdownOption>
                <DropdownOption
                  v-if="sale.status === 'in_progress'"
                  @click="openUpdateSaleSidebar(sale)"
                >
                  <PencilIcon class="w-5 h-5 mr-2" />
                  <span>Actualizar</span>
                </DropdownOption>
                <DropdownOption
                  v-if="sale.status === 'cancelled'"
                  class="text-red-500 dark:text-red-500"
                  @click="openDeleteSaleDialog(sale)"
                >
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
    v-model="isDeleteSaleDialogOpen"
    position="center"
    title="Eliminar Cliente"
  >
    <div class="text-center">
      <p class="text-sm text-gray-500 dark:text-gray-200">
        Esta acción eliminará permanentemente esta venta. ¿Estás seguro de que
        deseas proceder con la eliminación?
      </p>
    </div>
    <template #footer>
      <Button type="button" variant="error" @click="deleteSale">
        Si, eliminar
      </Button>
      <Button
        type="button"
        variant="secondary"
        @click="isDeleteSaleDialogOpen = false"
      >
        Cancelar
      </Button>
    </template>
  </Dialog>

  <CreateSidebar
    :open="saleSidebarMode === 'create'"
    :isLoading="createSaleMutation.isPending.value"
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
  <UpdateSidebar
    :open="saleSidebarMode === 'update'"
    :isLoading="updateSaleMutation.isPending.value"
    :sale="selectedSaleFromActions"
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
</template>
