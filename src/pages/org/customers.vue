<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateCustomer,
  Customer,
  UpdateCustomer,
  customerServicesTypeguards,
  useCustomerServices,
} from "@/features/customers";
import { computed, ref } from "vue";
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
} from "@/components/ui";
import { Badge } from "@/components";
import {
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
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const customerServices = useCustomerServices();
const createCustomerMutation = useMutation({
  mutationFn: customerServices.createCustomer,
});
const customersQuery = useCustomersQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
    search: customerSearchDebounced,
  },
});
const deleteCustomerMutation = useMutation({
  mutationFn: customerServices.deleteCustomer,
});
const updateCustomerMutation = useMutation({
  mutationFn: customerServices.updateCustomer,
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

const customerHandlers = {
  async create(formValues: CreateCustomer) {
    await createCustomerMutation.mutateAsync(formValues);
    closeSidebar();
    await queryClient.invalidateQueries({ queryKey: ["customers"] });
  },
  async update(formValues: UpdateCustomer) {
    const customerId = formValues.customer_id;
    if (!customerId) throw new Error("Customer id required to perform update");
    await updateCustomerMutation.mutateAsync(formValues);
    closeSidebar();
    await queryClient.invalidateQueries({ queryKey: ["customers"] });
  },
};

async function handleSaveSidebar(formValues: CreateCustomer | UpdateCustomer) {
  if (customerServicesTypeguards.isCreateCustomer(formValues)) {
    await customerHandlers.create(formValues);
  } else {
    await customerHandlers.update(formValues);
  }
}

function openUpdateCustomerSidebar(customer: Customer) {
  selectedCustomerFromActions.value = customer;
  customerSidebarMode.value = "update";
}

async function deleteCustomer() {
  const customerId = selectedCustomerFromActions.value?.id;
  if (!customerId) throw new Error("Customer id required to perform delete");
  await deleteCustomerMutation.mutateAsync(customerId);
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

  <div class="relative overflow-x-auto shadow-md rounded-lg">
    <table
      ref="tableRef"
      class="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400"
    >
      <thead
        class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400"
      >
        <tr>
          <th scope="col" class="px-6 py-3 min-w-48">Nombre</th>
          <th scope="col" class="px-6 py-3 min-w-64 text-center">Notas</th>
          <th scope="col" class="px-6 py-3 text-center">Teléfono</th>
          <th scope="col" class="px-6 py-3 text-center">Dirección</th>
          <th scope="col" class="px-6 py-3 text-center">Mapa</th>
          <th scope="col" class="px-6 py-3 text-center">Estado de confianza</th>
          <th scope="col" class="px-6 py-3">Acción</th>
        </tr>
      </thead>
      <tbody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in customersQuery.data.value?.pages"
          :key="index"
        >
          <tr
            v-for="customer in page.data"
            :key="customer.id"
            class="bg-white border-b dark:bg-slate-900 dark:border-slate-800"
          >
            <th
              scope="row"
              class="flex items-center px-6 py-4 text-slate-900 whitespace-nowrap dark:text-white w-max"
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
            </th>
            <td class="text-center">
              {{ customer.notes || "-" }}
            </td>
            <td class="text-center">
              <a
                :href="`${WHATSAPP_URL}/${customer.phone}`"
                target="_blank"
                rel="noopener noreferrer"
                class="block"
              >
                {{ customer.phone }}
              </a>
            </td>
            <td class="text-center">
              {{ customer.address || "-" }}
            </td>
            <td class="text-center">
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
            </td>
            <td class="text-center">
              <Badge :color="getBadgeColorFromStatus(customer.trust_status)">
                {{ customer.trust_status?.toLocaleUpperCase() }}
              </Badge>
            </td>
            <td class="px-6 py-4">
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
            </td>
          </tr>
        </template>
      </tbody>
    </table>
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
        <Button type="button" variant="destructive" @click="deleteCustomer">
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
