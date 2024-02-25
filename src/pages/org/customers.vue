<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateCustomer,
  Customer,
  UpdateCustomer,
  customerServicesTypeguards,
  useCustomerServices,
} from "@/features/customers";
import { ref, toRef } from "vue";
import { useTableOrder } from "@/features/global";
import {
  Button,
  Input,
  DropdownMenu,
  Dialog,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Avatar,
  AvatarFallback,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { Badge } from "@/components";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  MapIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useCustomersQuery } from "@/features/customers/composables/useCustomerQueries";
import { useMutation, useQueryClient } from "@tanstack/vue-query";

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL;
const tableRef = ref<HTMLElement | null>(null);
const customerSearch = ref("");
const customerSearchDebounced = refDebounced(customerSearch, 400);
const customerSidebarMode = ref<"create" | "update" | null>(null);
const isDeleteCustomerDialogOpen = ref(false);
const selectedCustomerFromActions = ref<Customer | null>(null);
const customersTableOrder = useTableOrder({
  options: {
    initialOrder: ["created_at", "desc"],
  },
});
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const customerServices = useCustomerServices();
const createCustomerMutation = useMutation({
  mutationFn: createCustomerMutationFn,
});
const updateCustomerMutation = useMutation({
  mutationFn: updateCustomerMutationFn,
});
const deleteCustomerMutation = useMutation({
  mutationFn: deleteCustomerMutationFn,
});
const customersQuery = useCustomersQuery({
  options: {
    enabled: toRef(() => organizationStore.hasOrganizations),
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

function openDeleteCustomerDialog(customer: Customer) {
  selectedCustomerFromActions.value = customer;
  isDeleteCustomerDialogOpen.value = true;
}

function closeSidebar() {
  customerSidebarMode.value = null;
  selectedCustomerFromActions.value = null;
  isDeleteCustomerDialogOpen.value = false;
}

function handleSaveSidebar(formValues: CreateCustomer | UpdateCustomer) {
  if (customerServicesTypeguards.isCreateCustomer(formValues)) {
    createCustomerMutation.mutate(formValues);
  } else {
    updateCustomerMutation.mutate(formValues);
  }
}

function openUpdateCustomerSidebar(customer: Customer) {
  selectedCustomerFromActions.value = customer;
  customerSidebarMode.value = "update";
}

async function createCustomerMutationFn(formValues: CreateCustomer) {
  await customerServices.createCustomer(formValues);
  closeSidebar();
  await queryClient.invalidateQueries({ queryKey: ["customers"] });
}
async function updateCustomerMutationFn(formValues: UpdateCustomer) {
  const customerId = formValues.customer_id;
  if (!customerId) throw new Error("Customer id required to perform update");
  await customerServices.updateCustomer(formValues);
  closeSidebar();
  await queryClient.invalidateQueries({ queryKey: ["customers"] });
}
async function deleteCustomerMutationFn() {
  const customerId = selectedCustomerFromActions.value?.id;
  if (!customerId) throw new Error("Customer id required to perform delete");
  await customerServices.deleteCustomer(customerId);
  closeSidebar();
  await queryClient.invalidateQueries({ queryKey: ["customers"] });
}

function getBadgeColorFromStatus(status: Customer["trust_status"]) {
  switch (status) {
    case "trusted":
      return "green";
    case "not_trusted":
      return "red";
    default:
      return "green";
  }
}
</script>

<template>
  <div class="flex items-center justify-between flex-col md:flex-row">
    <div class="mb-6">
      <h2
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight text-slate-900 md:text-4xl dark:text-white"
      >
        Clientes
      </h2>
      <p class="max-w-xl">
        Tus clientes, tu control. Gestiona fácilmente tu lista de clientes.
      </p>
    </div>
    <div>
      <Button @click="customerSidebarMode = 'create'" label="">
        <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear cliente
      </Button>
    </div>
  </div>

  <div
    class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4"
  >
    <label for="table-search" class="sr-only">Buscar</label>
    <div class="relative">
      <Input
        v-model="customerSearch"
        type="search"
        placeholder="Buscar clientes"
      />
    </div>
  </div>

  <div ref="tableRef" class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            @click="customersTableOrder.toggleTableOrder('name')"
            class="cursor-pointer"
          >
            <span class="flex items-center gap-2">
              Nombre
              <template
                v-if="customersTableOrder.tableOrder.value[0] === 'name'"
              >
                <ChevronUpIcon
                  v-if="customersTableOrder.tableOrder.value[1] === 'desc'"
                  class="h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="customersTableOrder.tableOrder.value[1] === 'asc'"
                  class="h-4 w-4"
                />
              </template>
            </span>
          </TableHead>
          <TableHead class="text-center">Notas</TableHead>
          <TableHead class="text-center">Teléfono</TableHead>
          <TableHead class="text-center"> Dirección </TableHead>
          <TableHead class="text-center"> Mapa </TableHead>
          <TableHead class="text-center"> Estado de confianza </TableHead>
          <TableHead class="text-center"> - </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in customersQuery.data.value?.pages"
          :key="index"
        >
          <TableRow v-for="customer in page.data" :key="customer.id">
            <TableCell
              class="flex items-center px-6 py-4 text-foreground whitespace-nowrap w-max"
            >
              <Avatar>
                <AvatarFallback>{{
                  `${customer?.name?.substring(0, 1).toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div class="ps-3">
                <div class="text-base font-semibold">{{ customer.name }}</div>
                <div v-if="customer.email" class="font-normal text-slate-500">
                  {{ customer.email }}
                </div>
              </div>
            </TableCell>
            <TableCell class="text-center">{{
              customer.notes || "-"
            }}</TableCell>
            <TableCell class="text-center"
              ><a
                :href="`${WHATSAPP_URL}/${customer.phone}`"
                target="_blank"
                rel="noopener noreferrer"
                class="block"
              >
                {{ customer.phone }}
              </a></TableCell
            >
            <TableCell class="text-center">
              {{ customer.address || "-" }}
            </TableCell>
            <TableCell class="text-center">
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
            </TableCell>
            <TableCell class="text-center">
              <Badge :color="getBadgeColorFromStatus(customer.trust_status)">
                {{ customer.trust_status?.toLocaleUpperCase() }}
              </Badge>
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
                    @click="openUpdateCustomerSidebar(customer)"
                  >
                    <PencilIcon class="w-5 h-5 mr-2" />
                    <span>Actualizar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="customer.trust_status === 'not_trusted'"
                    class="text-red-500 dark:text-red-500"
                    @click="openDeleteCustomerDialog(customer)"
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

  <Dialog :open="isDeleteCustomerDialogOpen" @update:open="closeSidebar">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar Cliente</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente a este cliente. ¿Estás seguro de
          que deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          type="button"
          variant="destructive"
          @click="deleteCustomerMutation.mutate"
        >
          Si, eliminar
        </Button>
        <Button type="button" variant="secondary" @click="closeSidebar">
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <CreateOrEditSidebar
    :open="Boolean(customerSidebarMode)"
    :customer="selectedCustomerFromActions"
    :isLoading="
      updateCustomerMutation.isPending.value ||
      createCustomerMutation.isPending.value
    "
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
</template>
