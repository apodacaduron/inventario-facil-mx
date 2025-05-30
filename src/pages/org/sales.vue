<script setup lang="ts">
import {
  CreateSaleSidebar,
  DeleteSaleDialog,
  Sale,
  TodaySalesSidebar,
  UpdateSaleSidebar,
  ViewSaleSidebar,
} from "@/features/sales";
import { ref, toRef, watchEffect } from "vue";
import {
  Button,
  Input,
  Avatar,
  AvatarFallback,
  Table,
  TableRow,
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
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui";
import {
  BanknotesIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  FunnelIcon,
  ShoppingBagIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll, useStorage } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useSalesQuery } from "@/features/sales/composables/useSaleQueries";
import {
  CreateProductSidebar,
  useCurrencyFormatter,
} from "@/features/products";
import {
  FeedbackCard,
  useLayerManager,
  useTableStates,
} from "@/features/global";
import { Tables } from "../../../types_db";
import { useDashboardDates } from "@/features/dashboard";
import { useRoute } from "vue-router";
import CustomerPickerSidebar from "@/features/sales/components/CustomerPickerSidebar.vue";
import { CreateCustomerSidebar, Customer } from "@/features/customers";
import ProductPickerSidebar from "@/features/sales/components/ProductPickerSidebar.vue";
import { WHATSAPP_URL } from "@/config/constants";
import { ProBadge } from "@/components";

const LOCALE = {
  in_progress: "En progreso",
  cancelled: "Cancelada",
  completed: "Completada",
};
const tableFiltersRef = useStorage<{
  status: NonNullable<Tables<"i_sales">["status"]> | "all";
  period?: "daily" | "weekly" | "monthly";
}>("sales-table-filters", { status: "all" });
const dashboardDates = useDashboardDates({
  period: toRef(() => tableFiltersRef.value.period),
});
const tableRef = ref<HTMLElement | null>(null);
const saleSearch = ref("");
const saleSearchDebounced = refDebounced(saleSearch, 400);
const isViewSaleSidebarOpen = ref(false);
const isTodaySalesSidebarOpen = ref(false);
const isCreateSaleSidebarOpen = ref(false);
const isUpdateSaleSidebarOpen = ref(false);
const isDeleteSaleDialogOpen = ref(false);
const activeSale = ref<Sale | null>(null);
const activeCustomer = ref<Customer | null>(null);
const activeProducts = ref<
  Map<
    string,
    Pick<
      Sale["i_sale_products"][number],
      "product_id" | "price" | "unit_price" | "qty" | "name" | "image_url"
    >
  >
>(new Map());

const layerManager = useLayerManager();
const route = useRoute();
const organizationStore = useOrganizationStore();

const currencyFormatter = useCurrencyFormatter();
const salesQuery = useSalesQuery({
  options: {
    orgId: toRef(() => route.params.orgId.toString()),
    enabled: toRef(() => organizationStore.hasUserOrganizations),
    search: saleSearchDebounced,
    filters: toRef(() => {
      const filters = [];

      if ("status" in tableFiltersRef.value) {
        if (tableFiltersRef.value.status !== "all") {
          filters.push({
            column: "status",
            operator: "eq",
            value: tableFiltersRef.value.status,
          });
        }
      }
      if ("period" in tableFiltersRef.value) {
        if (tableFiltersRef.value.period) {
          filters.push({
            column: "created_at",
            operator: "gte",
            value: dashboardDates.dateRangeFromPeriod.value?.from.toISOString(),
          });
          filters.push({
            column: "created_at",
            operator: "lte",
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

function openViewSaleSidebar(sale: Sale) {
  activeSale.value = sale;
  isViewSaleSidebarOpen.value = true;
}

function openUpdateSaleSidebar(sale?: Sale | null) {
  activeSale.value = sale ?? null;
  layerManager.openLayer("update-sale");
}

function getBadgeColorFromStatus(status: Sale["status"]) {
  switch (status) {
    case "cancelled":
      return "destructive";
    case "in_progress":
      return "outline";
    case "completed":
      return "default";
    default:
      return "outline";
  }
}

function resetFilters() {
  tableFiltersRef.value = { status: "all" };
}

watchEffect(() => {
  if (isDeleteSaleDialogOpen.value) return;
  if (isCreateSaleSidebarOpen.value) return;
  if (isUpdateSaleSidebarOpen.value) return;
  if (isViewSaleSidebarOpen.value) return;
  if (layerManager.hasAnyLayerOpen.value) return;

  activeSale.value = null;
  activeCustomer.value = null;
  activeProducts.value.clear();
});
</script>

<template>
  <div ref="tableRef" class="py-6 md:px-6 h-[calc(100vh-71px)] overflow-y-auto">
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
        <ProBadge :visible="!organizationStore.isPremium">
          <Button
            :disabled="!organizationStore.isPremium"
            variant="outline"
            @click="isTodaySalesSidebarOpen = true"
          >
            <ShoppingBagIcon class="w-5 h-5 stroke-[2px] mr-2" /> Ventas de hoy
          </Button>
        </ProBadge>
        <Button @click="layerManager.openLayer('create-sale')">
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
        <Button @click="layerManager.openLayer('create-sale')" size="icon">
          <PlusIcon class="w-5 h-5 stroke-[2px]" />
        </Button>
      </div>
    </div>

    <div ref="tableRef" class="overflow-x-auto">
      <div
        class="grid gap-4 mt-6 mx-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:mx-0"
      >
        <template
          v-for="(page, index) in salesQuery.data.value?.pages"
          :key="index"
        >
          <Card
            v-for="sale in page.data"
            :key="sale.id"
            @click.stop="openViewSaleSidebar(sale)"
          >
            <CardHeader>
              <CardTitle class="flex justify-between">
                <div class="flex">
                  <Avatar>
                    <AvatarFallback>{{
                      (sale.i_customers?.name ?? sale.customer_name)
                        ?.substring(0, 1)
                        .toLocaleUpperCase() ?? "?"
                    }}</AvatarFallback>
                  </Avatar>
                  <div class="ps-3">
                    <div class="text-base font-semibold">
                      {{ sale.i_customers?.name ?? sale.customer_name ?? "-" }}
                    </div>
                    <div
                      v-if="sale.i_customers?.phone || sale.customer_phone"
                      class="font-normal text-slate-500"
                    >
                      <a
                        :href="`${WHATSAPP_URL}/${
                          sale.i_customers?.phone ?? sale.customer_phone
                        }`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="block"
                      >
                        {{ sale.i_customers?.phone ?? sale.customer_phone }}
                      </a>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          size="icon"
                          variant="outline"
                          @click.stop="openViewSaleSidebar(sale)"
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
                          @click.stop="openUpdateSaleSidebar(sale)"
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
                          @click.stop="openDeleteSaleDialog(sale)"
                        >
                          <TrashIcon class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar venta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent class="text-sm">
              <div class="flex justify-between gap-2 flex-wrap">
                <div>
                  <p><strong>Productos</strong></p>
                  <div
                    class="flex -space-x-4 rtl:space-x-reverse w-fit cursor-pointer"
                    @click="openViewSaleSidebar(sale)"
                  >
                    <Avatar
                      v-for="saleProduct in sale.i_sale_products.slice(0, 3)"
                      :key="saleProduct.id"
                      class="border-muted border-2"
                    >
                      <AvatarImage
                        :src="saleProduct.image_url ?? ''"
                        class="object-cover"
                      />
                      <AvatarFallback>{{
                        `${saleProduct.name
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
                  </div>
                </div>

                <p>
                  <strong>Cantidad</strong><br />
                  {{
                    sale.i_sale_products.reduce(
                      (acc, saleProduct) => acc + (saleProduct.qty ?? 0),
                      0
                    )
                  }}
                </p>

                <div>
                  <p><strong>Total</strong></p>
                  <div v-if="sale.redeem_cashback">
                    <span
                      v-if="
                        sale.cashback_redeemed ||
                        sale.i_customers?.cashback_balance
                      "
                      class="line-through text-muted-foreground mr-2"
                    >
                      {{ currencyFormatter.parse(sale.total ?? 0) }}
                    </span>
                    <span
                      v-if="
                        (sale.total ?? 0) >
                        ((sale.cashback_redeemed ||
                          sale.i_customers?.cashback_balance) ??
                          0)
                      "
                    >
                      {{
                        currencyFormatter.parse(
                          (sale.total ?? 0) -
                            ((sale.cashback_redeemed ||
                              sale.i_customers?.cashback_balance) ??
                              0)
                        )
                      }}
                    </span>
                    <span v-else>GRATIS</span>
                  </div>
                  <div v-else>
                    {{ currencyFormatter.parse(sale.total ?? 0) }}
                  </div>
                </div>

                <p v-if="Number(sale.shipping_cost)">
                  <strong>Costo de envío</strong><br />
                  {{ currencyFormatter.parse(sale.shipping_cost) }}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Badge :variant="getBadgeColorFromStatus(sale.status)"
                >{{ LOCALE[sale.status ?? "in_progress"]?.toLocaleUpperCase() }}
              </Badge>
            </CardFooter>
          </Card>
        </template>
      </div>

      <Table>
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
      </Table>
      <div
        v-if="salesQuery.isFetchingNextPage.value"
        class="w-full flex justify-center"
      >
        CARGANDO MAS...
      </div>

      <FeedbackCard
        v-if="tableLoadingStates.showEmptyState.value"
        class="mt-24"
      >
        <template #icon>
          <BanknotesIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>Comienza creando una venta</template>
        <template #description
          >Ventas creadas se mostraran aquí. <br />
          Comienza creando tu primera venta.
        </template>
        <template #action
          ><Button @click="layerManager.openLayer('create-sale')">
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
          >Tu búsqueda "{{ saleSearch }}" no coincidió con alguna venta.
          <br />
          Por favor intente de nuevo o agregue una nueva venta.
        </template>
        <template #action>
          <div class="flex gap-4">
            <Button @click="saleSearch = ''" variant="outline">
              Clear search
            </Button>
            <Button @click="layerManager.openLayer('create-sale')">
              <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear venta
            </Button>
          </div>
        </template>
      </FeedbackCard>
    </div>

    <DeleteSaleDialog
      v-model:open="isDeleteSaleDialogOpen"
      :sale="activeSale"
    />
    <CreateSaleSidebar
      :activeCustomer="activeCustomer"
      :activeProducts="activeProducts"
      :layerManager="layerManager"
      :open="layerManager.currentLayer.value?.id === 'create-sale'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <CreateCustomerSidebar
      @createCustomer="activeCustomer = $event"
      :open="layerManager.currentLayer.value?.id === 'create-customer'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <UpdateSaleSidebar
      :sale="activeSale"
      :activeProducts="activeProducts"
      :layerManager="layerManager"
      :open="layerManager.currentLayer.value?.id === 'update-sale'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <CustomerPickerSidebar
      :activeCustomer="activeCustomer"
      :layerManager="layerManager"
      :open="layerManager.currentLayer.value?.id === 'customer-picker'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
      @select="activeCustomer = $event"
    />
    <ProductPickerSidebar
      :activeProducts="activeProducts"
      :sale="activeSale"
      :layerManager="layerManager"
      :open="layerManager.currentLayer.value?.id === 'product-picker'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <CreateProductSidebar
      :open="layerManager.currentLayer.value?.id === 'create-product'"
      @update:open="(open) => open === false && layerManager.closeLayer()"
    />
    <ViewSaleSidebar v-model:open="isViewSaleSidebarOpen" :sale="activeSale" />

    <TodaySalesSidebar v-model:open="isTodaySalesSidebarOpen" />
  </div>
</template>
