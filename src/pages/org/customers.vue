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
  DropdownOption,
  Dialog,
} from "@flavorly/vanilla-components";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useAsyncState, useInfiniteScroll } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";
import { useCustomersQuery } from "@/features/customers/composables/useCustomerQueries";
import { useQueryClient } from "@tanstack/vue-query";

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
const asyncCreateCustomer = useAsyncState(
  customerServices.createCustomer,
  null
);
const customersQuery = useCustomersQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
    search: customerSearchDebounced,
  },
});
const asyncDeleteCustomer = useAsyncState(
  customerServices.deleteCustomer,
  null
);
const asyncUpdateCustomer = useAsyncState(
  customerServices.updateCustomer,
  null
);
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
}

const customerHandlers = {
  async create(formValues: CreateCustomer) {
    await asyncCreateCustomer.execute(0, formValues);
    customerSidebarMode.value = null;
    selectedCustomerFromActions.value = null;
    await queryClient.removeQueries({ queryKey: ["customers"] });
  },
  async update(formValues: UpdateCustomer) {
    await asyncUpdateCustomer.execute(0, formValues);
    customerSidebarMode.value = null;
    selectedCustomerFromActions.value = null;
    await queryClient.removeQueries({ queryKey: ["customers"] });
  },
};

async function handleSaveSidebar(formValues: CreateCustomer | UpdateCustomer) {
  if (!customerSidebarMode.value)
    throw new Error("customerSidebarMode must not be null");
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
  await asyncDeleteCustomer.execute(0, customerId);
  isDeleteCustomerDialogOpen.value = false;
  selectedCustomerFromActions.value = null;
  await queryClient.removeQueries({ queryKey: ["customers"] });
}
</script>

<template>
  <div class="flex items-center justify-between flex-col md:flex-row">
    <div class="mb-6">
      <h2
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white"
      >
        Clientes
      </h2>
      <p class="max-w-xl">
        Tus clientes, tu control. Gestiona fácilmente tu lista de clientes.
      </p>
    </div>
    <div>
      <Button
        @click="customerSidebarMode = 'create'"
        label="Crear cliente"
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
      <Input v-model="customerSearch" placeholder="Buscar clientes">
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
          <th scope="col" class="px-6 py-3">Telefono</th>
          <th scope="col" class="px-6 py-3">Dirección</th>
          <th scope="col" class="px-6 py-3 text-center">Mapa</th>
          <th scope="col" class="px-6 py-3">Acción</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="page in customersQuery.data.value?.pages">
          <tr
            v-for="(customer, index) in page.data"
            :key="index"
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <th
              scope="row"
              class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
            >
              <img
                class="w-12 h-12 rounded-full"
                src="/customer-placeholder.jpg"
                alt="Rounded avatar"
              />
              <div class="ps-3">
                <div class="text-base font-semibold">{{ customer.name }}</div>
                <div v-if="customer.email" class="font-normal text-gray-500">
                  {{ customer.email }}
                </div>
              </div>
            </th>
            <td>
              <a
                :href="`${WHATSAPP_URL}/${customer.phone}`"
                target="_blank"
                rel="noopener noreferrer"
                class="block"
              >
                {{ customer.phone }}
              </a>
            </td>
            <td>
              {{ customer.address || "-" }}
            </td>
            <td>
              <a
                v-if="customer.map_url"
                :href="customer.map_url"
                target="_blank"
                rel="noopener noreferrer"
                class="block w-fit mx-auto"
              >
                <MapIcon class="w-6 h-6 stroke-[2px]" />
              </a>
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

                <DropdownOption @click="openUpdateCustomerSidebar(customer)">
                  <PencilIcon class="w-5 h-5 mr-2" />
                  <span>Actualizar</span>
                </DropdownOption>
                <DropdownOption @click="openDeleteCustomerDialog(customer)">
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
    v-model="isDeleteCustomerDialogOpen"
    position="center"
    title="Eliminar Cliente"
  >
    <div class="text-center">
      <p class="text-sm text-gray-500 dark:text-gray-200">
        Esta acción eliminará permanentemente a este cliente. ¿Estás seguro de
        que deseas proceder con la eliminación?
      </p>
    </div>
    <template #footer>
      <Button type="button" variant="primary" @click="deleteCustomer">
        Si, eliminar
      </Button>
      <Button
        type="button"
        variant="secondary"
        @click="isDeleteCustomerDialogOpen = false"
      >
        Cancelar
      </Button>
    </template>
  </Dialog>

  <CreateOrEditSidebar
    :open="Boolean(customerSidebarMode)"
    :mode="customerSidebarMode ?? undefined"
    :customer="selectedCustomerFromActions"
    :isLoading="
      asyncUpdateCustomer.isLoading.value || asyncCreateCustomer.isLoading.value
    "
    @close="closeSidebar"
    @save="handleSaveSidebar"
  />
</template>
