<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateSale,
  Sale,
  UpdateSale,
  saleServicesTypeguards,
  useSaleServices,
} from "@/features/sales";
import { computed, ref } from "vue";
import {
  Button,
  Input,
  DropdownMenu,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Avatar,
  AvatarFallback,
} from "@/components/ui";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useSalesQuery } from "@/features/sales/composables/useSaleQueries";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useCurrencyFormatter } from "@/features/products";
import { Badge } from "@/components";

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL;
const tableRef = ref<HTMLElement | null>(null);
const saleSearch = ref("");
const saleSearchDebounced = refDebounced(saleSearch, 400);
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
    search: saleSearchDebounced,
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
function closeDeleteSaleDialog() {
  selectedSaleFromActions.value = null;
  isDeleteSaleDialogOpen.value = false;
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
    const saleId = formValues.sale_id;
    if (!saleId) throw new Error("Sale id required to perform update");
    await updateSaleMutation.mutateAsync(formValues);
    saleSidebarMode.value = null;
    selectedSaleFromActions.value = null;
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
  },
};

async function handleSaveSidebar(formValues: CreateSale | UpdateSale) {
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
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight text-slate-900 md:text-4xl dark:text-white"
      >
        Ventas
      </h2>
      <p class="max-w-xl">
        Tus ventas, tu control. Gestiona fácilmente tu lista de ventas.
      </p>
    </div>
    <div>
      <Button @click="saleSidebarMode = 'create'">
        <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear venta
      </Button>
    </div>
  </div>

  <div
    class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4"
  >
    <label for="table-search" class="sr-only">Buscar</label>
    <div class="relative">
      <Input v-model="saleSearch" placeholder="Buscar ventas" />
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
            class="bg-white border-b dark:bg-slate-900 dark:border-slate-800"
          >
            <th
              scope="row"
              class="flex items-center px-6 py-4 text-slate-900 whitespace-nowrap dark:text-white w-max"
            >
              <Avatar>
                <AvatarFallback>{{
                  `${sale.i_customers?.name
                    ?.substring(0, 1)
                    .toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div class="ps-3">
                <div class="text-base font-semibold">
                  {{ sale.i_customers?.name }}
                </div>
                <div
                  v-if="sale.i_customers?.phone"
                  class="font-normal text-slate-500"
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
                  class="w-10 h-10 border-2 border-white rounded-full dark:border-slate-800"
                  :src="
                    saleProduct.i_products?.image_url ??
                    '/product-placeholder.png'
                  "
                />
                <div
                  v-if="sale.i_sale_products.length > 3"
                  class="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-slate-700 border-2 border-white rounded-full hover:bg-slate-600 dark:border-slate-800"
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
                <DropdownMenuTrigger as-child>
                  <Button variant="outline">
                    <EllipsisVerticalIcon class="w-5 h-5 stroke-[2px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <EyeIcon class="w-5 h-5 mr-2" />
                    <span>Ver</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="sale.status === 'in_progress'"
                    @click="openUpdateSaleSidebar(sale)"
                  >
                    <PencilIcon class="w-5 h-5 mr-2" />
                    <span>Actualizar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="sale.status === 'cancelled'"
                    class="text-red-500 dark:text-red-500"
                    @click="openDeleteSaleDialog(sale)"
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

  <Dialog :open="isDeleteSaleDialogOpen" @update:open="closeDeleteSaleDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Eliminar Cliente </DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente esta venta. ¿Estás seguro de que
          deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="destructive" @click="deleteSale">
          Si, eliminar
        </Button>
        <Button
          type="button"
          variant="secondary"
          @click="closeDeleteSaleDialog"
        >
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <CreateOrEditSidebar
    :open="Boolean(saleSidebarMode)"
    :isLoading="createSaleMutation.isPending.value"
    :sale="selectedSaleFromActions"
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
</template>
