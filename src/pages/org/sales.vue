<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateSale,
  Sale,
  UpdateSale,
  saleServicesTypeguards,
  useSaleServices,
} from "@/features/sales";
import { computed, ref, watchEffect } from "vue";
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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  AvatarImage,
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
const saleSidebarMode = ref<"create" | "update" | "view" | null>(null);
const isDeleteSaleDialogOpen = ref(false);
const selectedSale = ref<Sale | null>(null);
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
  selectedSale.value = sale;
  isDeleteSaleDialogOpen.value = true;
}

function closeSidebar() {
  handleSaleSidebar({ sale: null, mode: null });
}

const saleHandlers = {
  async create(formValues: CreateSale) {
    await createSaleMutation.mutateAsync(formValues);
    closeSidebar();
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
  },
  async update(formValues: UpdateSale) {
    const saleId = formValues.sale_id;
    if (!saleId) throw new Error("Sale id required to perform update");
    await updateSaleMutation.mutateAsync(formValues);
    closeSidebar();
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
  },
};

async function handleSaveSidebar(formValues: CreateSale | UpdateSale) {
  console.log(formValues, saleServicesTypeguards.isCreateSale(formValues));
  if (saleServicesTypeguards.isCreateSale(formValues)) {
    await saleHandlers.create(formValues);
  } else {
    await saleHandlers.update(formValues);
  }
}

function handleSaleSidebar(options: {
  sale?: Sale | null;
  mode: "create" | "update" | "view" | null;
}) {
  selectedSale.value = options.sale ?? null;
  saleSidebarMode.value = options.mode;
}

async function deleteSale() {
  const saleId = selectedSale.value?.id;
  if (!saleId) throw new Error("Sale id required to perform delete");
  await deleteSaleMutation.mutateAsync(saleId);
  isDeleteSaleDialogOpen.value = false;
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

watchEffect(() => {
  if (isDeleteSaleDialogOpen.value) return;
  if (saleSidebarMode.value) return;

  selectedSale.value = null;
});
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
      <Input v-model="saleSearch" type="search" placeholder="Buscar ventas" />
    </div>
  </div>

  <div ref="tableRef" class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead> Nombre </TableHead>
          <TableHead class="text-center">Productos</TableHead>
          <TableHead class="text-center">Cantidad</TableHead>
          <TableHead class="text-center"> Total </TableHead>
          <TableHead class="text-center"> Costo de envio </TableHead>
          <TableHead class="text-center"> Estatus</TableHead>
          <TableHead class="text-center"> Creado</TableHead>
          <TableHead class="text-center"> - </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in salesQuery.data.value?.pages"
          :key="index"
        >
          <TableRow v-for="sale in page.data" :key="sale.id">
            <TableCell
              class="flex items-center px-6 py-4 text-foreground whitespace-nowrap w-max"
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
            </TableCell>
            <TableCell class="text-center"
              ><div
                class="flex -space-x-4 rtl:space-x-reverse w-fit mx-auto cursor-pointer"
                @click="handleSaleSidebar({ sale, mode: 'view' })"
              >
                <Avatar
                  v-for="saleProduct in sale.i_sale_products.slice(0, 3)"
                  :key="saleProduct.id"
                  class="border-muted border-2"
                >
                  <AvatarImage :src="saleProduct.i_products?.image_url ?? ''" />
                  <AvatarFallback>{{
                    `${saleProduct.i_products?.name
                      ?.substring(0, 1)
                      .toLocaleUpperCase()}`
                  }}</AvatarFallback>
                </Avatar>
                <div
                  v-if="sale.i_sale_products.length > 3"
                  class="flex items-center justify-center w-10 h-10 text-xs font-medium border-2 rounded-full bg-background border-muted"
                >
                  {{ sale.i_sale_products.length - 3 }}
                </div>
              </div></TableCell
            >
            <TableCell class="text-center">{{
              sale.i_sale_products.reduce(
                (acc, saleProduct) => acc + (saleProduct.qty ?? 0),
                0
              )
            }}</TableCell>
            <TableCell class="text-center">
              {{
                currencyFormatter.parse(
                  sale.i_sale_products.reduce(
                    (acc, saleProduct) =>
                      acc + (saleProduct.qty ?? 0) * (saleProduct.price ?? 0),
                    0
                  )
                )
              }}
            </TableCell>
            <TableCell class="text-center">
              {{ currencyFormatter.parse(sale.shipping_cost) }}
            </TableCell>
            <TableCell class="text-center">
              <Badge :color="getBadgeColorFromStatus(sale.status)"
                >{{ sale.status?.toLocaleUpperCase() }}
              </Badge>
            </TableCell>
            <TableCell class="text-center">
              {{
                new Date(sale.created_at).toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </TableCell>
            <TableCell class="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline">
                    <EllipsisVerticalIcon class="w-5 h-5 stroke-[2px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    @click="handleSaleSidebar({ sale, mode: 'view' })"
                  >
                    <EyeIcon class="w-5 h-5 mr-2" />
                    <span>Ver</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="sale.status === 'in_progress'"
                    @click="handleSaleSidebar({ sale, mode: 'update' })"
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
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>

  <Dialog v-model:open="isDeleteSaleDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Eliminar Venta </DialogTitle>
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
          @click="isDeleteSaleDialogOpen = false"
        >
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <CreateOrEditSidebar
    :open="Boolean(saleSidebarMode)"
    :viewOnly="saleSidebarMode === 'view'"
    :isLoading="createSaleMutation.isPending.value"
    :sale="selectedSale"
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
</template>
