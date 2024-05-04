<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateSale,
  DeleteSaleDialog,
  Sale,
  TodaySalesSidebar,
  UpdateSale,
  saleServicesTypeguards,
  useSaleServices,
} from '@/features/sales';
import { ref, toRef, watchEffect } from 'vue';
import {
  Button,
  Input,
  Avatar,
  AvatarFallback,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  AvatarImage,
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
  BanknotesIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  FunnelIcon,
  ShoppingBagIcon,
} from '@heroicons/vue/24/outline';
import { refDebounced, useInfiniteScroll, useStorage } from '@vueuse/core';
import { useOrganizationStore } from '@/stores';
import { useSalesQuery } from '@/features/sales/composables/useSaleQueries';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useCurrencyFormatter } from '@/features/products';
import { Badge } from '@/components';
import { FeedbackCard, useTableStates } from '@/features/global';
import { Tables } from '../../../types_db';
import { useDashboardDates } from '@/features/dashboard';

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL;
const tableFiltersRef = useStorage<{
  status: NonNullable<Tables<'i_sales'>['status']> | 'all';
  period?: 'daily' | 'weekly' | 'monthly';
}>('sales-table-filters', { status: 'all' });
const dashboardDates = useDashboardDates({
  period: toRef(() => tableFiltersRef.value.period),
});
const tableRef = ref<HTMLElement | null>(null);
const saleSearch = ref('');
const saleSearchDebounced = refDebounced(saleSearch, 400);
const isTodaySalesSidebarOpen = ref(false);
const isCreateOrUpdateSidebarOpen = ref(false);
const isSaleSidebarViewOnly = ref(false);
const isDeleteSaleDialogOpen = ref(false);
const activeSale = ref<Sale | null>(null);
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const saleServices = useSaleServices();
const createSaleMutation = useMutation({ mutationFn: createSaleMutationFn });
const updateSaleMutation = useMutation({ mutationFn: updateSaleMutationFn });
const deleteSaleMutation = useMutation({ mutationFn: deleteSaleMutationFn });
const currencyFormatter = useCurrencyFormatter();
const salesQuery = useSalesQuery({
  options: {
    enabled: toRef(() => organizationStore.hasOrganizations),
    search: saleSearchDebounced,
    filters: toRef(() => {
      const filters = [];

      if ('status' in tableFiltersRef.value) {
        if (tableFiltersRef.value.status !== 'all') {
          filters.push({
            column: 'status',
            operator: 'eq',
            value: tableFiltersRef.value.status,
          });
        }
      }
      if ('period' in tableFiltersRef.value) {
        if (tableFiltersRef.value.period) {
          filters.push({
            column: 'created_at',
            operator: 'gte',
            value: dashboardDates.dateRangeFromPeriod.value?.from.toISOString(),
          });
          filters.push({
            column: 'created_at',
            operator: 'lte',
            value: dashboardDates.dateRangeFromPeriod.value?.to.toISOString(),
          });
        }
      }

      return filters;
    }),
  },
});
useInfiniteScroll(
  tableRef,
  () => {
    if (salesQuery.isFetching.value) return;
    salesQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => salesQuery.hasNextPage.value }
);
const tableLoadingStates = useTableStates(salesQuery, saleSearch);

function openDeleteSaleDialog(sale: Sale) {
  activeSale.value = sale;
  isDeleteSaleDialogOpen.value = true;
}

function handleSaveSidebar(formValues: CreateSale | UpdateSale) {
  if (saleServicesTypeguards.isCreateSale(formValues)) {
    delete formValues.sale_id;
    createSaleMutation.mutate(formValues);
  } else {
    updateSaleMutation.mutate(formValues);
  }
  isCreateOrUpdateSidebarOpen.value = false;
}

function handleSaleSidebar(options: {
  sale?: Sale | null;
  viewOnly?: boolean;
}) {
  activeSale.value = options.sale ?? null;
  isCreateOrUpdateSidebarOpen.value = true;
  isSaleSidebarViewOnly.value = Boolean(options.viewOnly);
}

async function createSaleMutationFn(formValues: CreateSale) {
  await saleServices.createSale(formValues);
  await queryClient.invalidateQueries({ queryKey: ['sales'] });
}
async function updateSaleMutationFn(formValues: UpdateSale) {
  const saleId = formValues.sale_id;
  if (!saleId) throw new Error('Sale id required to perform update');
  await saleServices.updateSale(formValues);
  await queryClient.invalidateQueries({ queryKey: ['sales'] });
}
async function deleteSaleMutationFn() {
  const saleId = activeSale.value?.id;
  if (!saleId) throw new Error('Sale id required to perform delete');
  await saleServices.deleteSale(saleId);
  isDeleteSaleDialogOpen.value = false;
  await queryClient.invalidateQueries({ queryKey: ['sales'] });
}

function getBadgeColorFromStatus(status: Sale['status']) {
  switch (status) {
    case 'cancelled':
      return 'red';
    case 'in_progress':
      return 'blue';
    case 'completed':
      return 'green';
    default:
      return 'blue';
  }
}

function resetFilters() {
  tableFiltersRef.value = { status: 'all' };
}

watchEffect(() => {
  if (isDeleteSaleDialogOpen.value) return;
  if (isCreateOrUpdateSidebarOpen.value) return;

  activeSale.value = null;
  isSaleSidebarViewOnly.value = false;
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
          class="mb-0 md:mb-2 text-3xl font-extrabold leading-none tracking-tight text-slate-900 md:text-4xl dark:text-white"
        >
          Ventas
        </h2>
        <p class="hidden md:block max-w-xl">
          Tus ventas, tu control. Gestiona fácilmente tu lista de ventas.
        </p>
      </div>
      <div class="hidden lg:flex gap-2">
        <Button variant="outline" @click="isTodaySalesSidebarOpen = true">
          <ShoppingBagIcon class="w-5 h-5 stroke-[2px] mr-2" /> Ventas de hoy
        </Button>
        <Button @click="isCreateOrUpdateSidebarOpen = true">
          <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear venta
        </Button>
      </div>
    </div>

    <div class="flex items-center justify-between pb-4 gap-4 mx-4 md:mx-0">
      <div class="flex gap-2">
        <Input
          v-model="saleSearch"
          type="search"
          placeholder="Buscar ventas"
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
            <DropdownMenuLabel>Estatus</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup v-model="tableFiltersRef.status">
              <DropdownMenuRadioItem value="all"> Todo </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="in_progress">
                En progreso
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="completed">
                Completado
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="cancelled">
                Cancelado
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuLabel>Periodo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup v-model="tableFiltersRef.period">
              <DropdownMenuRadioItem value="daily">
                Diario
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="weekly">
                Semanal
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="monthly">
                Mensual
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <Button @click="resetFilters" size="sm" class="my-1 mx-2"
              >Limpiar</Button
            >
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div class="flex lg:hidden gap-2">
        <Button
          variant="outline"
          size="icon"
          @click="isTodaySalesSidebarOpen = true"
        >
          <ShoppingBagIcon class="w-5 h-5 stroke-[2px]" />
        </Button>
        <Button @click="isCreateOrUpdateSidebarOpen = true" size="icon">
          <PlusIcon class="w-5 h-5 stroke-[2px]" />
        </Button>
      </div>
    </div>

    <div ref="tableRef" class="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="pl-4"> Nombre </TableHead>
            <TableHead class="text-center">Productos</TableHead>
            <TableHead class="text-center">Cantidad</TableHead>
            <TableHead class="text-center"> Total </TableHead>
            <TableHead class="text-center"> Costo de envio </TableHead>
            <TableHead class="text-center"> Estatus</TableHead>
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
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center">
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
            v-for="(page, index) in salesQuery.data.value?.pages"
            :key="index"
          >
            <TableRow v-for="sale in page.data" :key="sale.id">
              <TableCell
                class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
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
                  @click="handleSaleSidebar({ sale, viewOnly: true })"
                >
                  <Avatar
                    v-for="saleProduct in sale.i_sale_products.slice(0, 3)"
                    :key="saleProduct.id"
                    class="border-muted border-2"
                  >
                    <AvatarImage :src="saleProduct.image_url ?? ''" />
                    <AvatarFallback>{{
                      `${saleProduct.name?.substring(0, 1).toLocaleUpperCase()}`
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
              <TableCell class="text-center flex justify-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        size="icon"
                        variant="outline"
                        @click="handleSaleSidebar({ sale, viewOnly: true })"
                      >
                        <EyeIcon class="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ver detalles</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        size="icon"
                        variant="outline"
                        v-if="sale.status === 'in_progress'"
                        @click="handleSaleSidebar({ sale })"
                      >
                        <PencilIcon class="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar venta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        size="icon"
                        variant="outline"
                        v-if="sale.status === 'cancelled'"
                        class="text-red-500 dark:text-red-500"
                        @click="openDeleteSaleDialog(sale)"
                      >
                        <TrashIcon class="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Eliminar venta</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
      <div v-if="salesQuery.isFetchingNextPage.value" class="w-full flex justify-center">LOADING...</div>

      <FeedbackCard
        v-if="tableLoadingStates.showEmptyState.value"
        class="mt-24"
      >
        <template #icon>
          <BanknotesIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>Comienza creando una venta</template>
        <template #description
          >Ventas creadas se mostraran aqui. <br />
          Comienza creando tu primera venta.
        </template>
        <template #action
          ><Button @click="isCreateOrUpdateSidebarOpen = true">
            <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear venta
          </Button>
        </template>
      </FeedbackCard>
      <FeedbackCard
        v-if="tableLoadingStates.showNoResultsState.value"
        class="mt-24"
      >
        <template #icon>
          <BanknotesIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>No se encontraron ventas</template>
        <template #description
          >Tu búsqueda "{{ saleSearch }}" no coincidio con alguna venta.
          <br />
          Por favor intente de nuevo o agregue una nueva venta.
        </template>
        <template #action>
          <div class="flex gap-4">
            <Button @click="saleSearch = ''" variant="outline">
              Clear search
            </Button>
            <Button @click="isCreateOrUpdateSidebarOpen = true">
              <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear venta
            </Button>
          </div>
        </template>
      </FeedbackCard>
    </div>

    <DeleteSaleDialog
      v-model:open="isDeleteSaleDialogOpen"
      :sale="activeSale"
      :isLoading="deleteSaleMutation.isPending.value"
      @confirmDelete="deleteSaleMutation.mutate"
    />

    <CreateOrEditSidebar
      v-model:open="isCreateOrUpdateSidebarOpen"
      :viewOnly="isSaleSidebarViewOnly"
      :isLoading="
        createSaleMutation.isPending.value || updateSaleMutation.isPending.value
      "
      :sale="activeSale"
      @save="handleSaveSidebar"
    />

    <TodaySalesSidebar v-model:open="isTodaySalesSidebarOpen" />
  </div>
</template>
