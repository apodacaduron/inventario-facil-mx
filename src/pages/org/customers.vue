<script setup lang="ts">
import {
  Customer,
  DeleteCustomerDialog,
  CreateCustomerSidebar,
  useCustomersQuery,
  UpdateCustomerSidebar,
} from "@/features/customers";
import { ref, toRef, watchEffect } from "vue";
import { FeedbackCard, useTableOrder, useTableStates } from "@/features/global";
import {
  Button,
  Input,
  Avatar,
  AvatarFallback,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Skeleton,
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
  MapIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";
import { useCurrencyFormatter } from "@/features/products";
import { WHATSAPP_URL } from "@/config/constants";
import { ProBadge } from "@/components";

const LOCALE = {
  trusted: "Confiable",
  not_trusted: "No confiable",
};
const tableRef = ref<HTMLElement | null>(null);
const customerSearch = ref("");
const customerSearchDebounced = refDebounced(customerSearch, 400);
const isCreateSidebarOpen = ref(false);
const isUpdateSidebarOpen = ref(false);
const isDeleteCustomerDialogOpen = ref(false);
const activeCustomer = ref<Customer | null>(null);

const currencyFormatter = useCurrencyFormatter();
const customersTableOrder = useTableOrder({
  options: {
    initialOrder: ["created_at", "desc"],
  },
});
const route = useRoute();
const organizationStore = useOrganizationStore();

const customersQuery = useCustomersQuery({
  options: {
    orgId: toRef(() => route.params.orgId.toString()),
    enabled: toRef(() => organizationStore.hasUserOrganizations),
    search: customerSearchDebounced,
    order: toRef(() => customersTableOrder.tableOrder.value),
  },
});
useInfiniteScroll(
  tableRef,
  () => {
    if (customersQuery.isFetching.value) return;
    customersQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => customersQuery.hasNextPage.value }
);
const tableLoadingStates = useTableStates(customersQuery, customerSearch);

function openDeleteCustomerDialog(customer: Customer) {
  activeCustomer.value = customer;
  isDeleteCustomerDialogOpen.value = true;
}

function openUpdateCustomerSidebar(customer: Customer) {
  activeCustomer.value = customer;
  isUpdateSidebarOpen.value = true;
}

function getBadgeColorFromStatus(status: Customer["trust_status"]) {
  switch (status) {
    case "trusted":
      return "default";
    case "not_trusted":
      return "destructive";
    default:
      return "default";
  }
}

watchEffect(() => {
  if (isCreateSidebarOpen.value) return;
  if (isUpdateSidebarOpen.value) return;
  if (isDeleteCustomerDialogOpen.value) return;

  activeCustomer.value = null;
});
</script>

<template>
  <div ref="tableRef" class="py-6 md:px-6 h-[calc(100vh-71px)] overflow-y-auto">
    <div class="flex justify-between flex-col md:flex-row mx-4 md:mx-0">
      <div class="mb-6">
        <h2
          class="mb-0 md:mb-2 text-3xl font-extrabold leading-none tracking-tight text-slate-900 md:text-4xl dark:text-white"
        >
          Clientes
        </h2>
        <p class="hidden md:block max-w-xl">
          Tus clientes, tu control. Gestiona fácilmente tu lista de clientes.
        </p>
      </div>
      <div class="hidden lg:flex gap-2">
        <ProBadge :visible="!organizationStore.canAddCustomers">
          <Button
            :disabled="!organizationStore.canAddCustomers"
            @click="isCreateSidebarOpen = true"
            label=""
          >
            <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear cliente
          </Button>
        </ProBadge>
      </div>
    </div>

    <div class="flex items-center justify-between pb-4 gap-4 mx-4 md:mx-0">
      <Input
        v-model="customerSearch"
        type="search"
        placeholder="Buscar clientes"
        class="max-w-[256px]"
      />

      <div class="flex lg:hidden gap-2">
        <ProBadge :visible="!organizationStore.canAddCustomers">
          <Button
            :disabled="!organizationStore.canAddCustomers"
            @click="isCreateSidebarOpen = true"
            label=""
            size="icon"
          >
            <PlusIcon class="w-5 h-5 stroke-[2px]" />
          </Button>
        </ProBadge>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div
        class="grid gap-4 mt-6 mx-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:mx-0"
      >
        <template
          v-for="(page, index) in customersQuery.data.value?.pages"
          :key="index"
        >
          <Card v-for="customer in page.data" :key="customer.id">
            <CardHeader>
              <CardTitle class="flex justify-between">
                <div
                  class="flex items-center text-foreground whitespace-nowrap w-max"
                >
                  <Avatar>
                    <AvatarFallback>{{
                      `${customer?.name?.substring(0, 1).toLocaleUpperCase()}`
                    }}</AvatarFallback>
                  </Avatar>
                  <div class="ps-3">
                    <div class="text-base font-semibold">
                      {{ customer.name }}
                    </div>
                    <div
                      class="flex gap-2 text-xs font-normal text-muted-foreground"
                    >
                      <div v-if="customer.email">
                        {{ customer.email }}
                      </div>
                      <a
                        v-if="customer.phone"
                        :href="`${WHATSAPP_URL}/${customer.phone}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="block"
                      >
                        {{ customer.phone }}
                      </a>
                    </div>
                  </div>
                </div>
                <div class="flex justify-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          size="icon"
                          variant="outline"
                          @click="openUpdateCustomerSidebar(customer)"
                        >
                          <PencilIcon class="w-4 h4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Editar cliente</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger as-child>
                        <Button
                          v-if="customer.trust_status === 'not_trusted'"
                          size="icon"
                          variant="outline"
                          class="text-red-500 dark:text-red-500"
                          @click="openDeleteCustomerDialog(customer)"
                        >
                          <TrashIcon class="w-4 h4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Eliminar cliente</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent class="text-sm">
              <div class="flex justify-between flex-wrap gap-2">
                <div>
                  <p><strong>Notes</strong></p>
                  {{ customer.notes || "-" }}
                </div>
                <div>
                  <p><strong>Address</strong></p>
                  {{ customer.address || "-" }}
                </div>
                <div>
                  <p><strong>Map URL</strong></p>
                  <a
                    v-if="customer.map_url"
                    :href="customer.map_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block w-fit mx-auto"
                  >
                    <MapIcon class="w-6 h-6 stroke-[2px]" />
                  </a>
                  <template v-else>-</template>
                </div>
                <div
                  v-if="
                    organizationStore.currentUserOrganization?.i_organizations
                      ?.is_cashback_enabled
                  "
                >
                  <p><strong>Monedero</strong></p>
                  <div class="text-center">
                    {{
                      currencyFormatter.parse(customer.cashback_balance) ?? "-"
                    }}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Badge :variant="getBadgeColorFromStatus(customer.trust_status)">
                {{
                  LOCALE[
                    customer.trust_status ?? "trusted"
                  ]?.toLocaleUpperCase()
                }}
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
            <TableCell class="text-center"
              ><Skeleton class="h-4 w-[180px]"
            /></TableCell>
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
        v-if="customersQuery.isFetchingNextPage.value"
        class="w-full flex justify-center"
      >
        CARGANDO MAS...
      </div>

      <FeedbackCard
        v-if="tableLoadingStates.showEmptyState.value"
        class="mt-24"
      >
        <template #icon>
          <UserGroupIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>Comienza creando una cliente</template>
        <template #description
          >Clientes creados se mostraran aquí. <br />
          Comienza creando la primera cliente.
        </template>
        <template #action
          ><Button
            :disabled="!organizationStore.canAddCustomers"
            @click="isCreateSidebarOpen = true"
          >
            <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear cliente
          </Button>
        </template>
      </FeedbackCard>
      <FeedbackCard
        v-if="tableLoadingStates.showNoResultsState.value"
        class="mt-24"
      >
        <template #icon>
          <UserGroupIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>No se encontraron suscripciones</template>
        <template #description
          >Tu búsqueda "{{ customerSearch }}" no coincidió con alguna cliente.
          <br />
          Por favor intente de nuevo a agregue una nueva cliente.
        </template>
        <template #action>
          <div class="flex gap-4">
            <Button @click="customerSearch = ''" variant="outline">
              Clear search
            </Button>
            <Button
              :disabled="!organizationStore.canAddCustomers"
              @click="isCreateSidebarOpen = true"
            >
              <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear cliente
            </Button>
          </div>
        </template>
      </FeedbackCard>
    </div>

    <CreateCustomerSidebar v-model:open="isCreateSidebarOpen" />
    <UpdateCustomerSidebar
      v-model:open="isUpdateSidebarOpen"
      :customer="activeCustomer"
    />
    <DeleteCustomerDialog
      v-model:open="isDeleteCustomerDialogOpen"
      :customer="activeCustomer"
    />
  </div>
</template>
