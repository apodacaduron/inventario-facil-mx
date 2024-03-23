<script setup lang="ts">
import {
  CreateOrEditSidebar,
  CreateSubscription,
  DeleteSubscriptionDialog,
  Subscription,
  UpdateSubscription,
  subscriptionServicesTypeguards,
  useSubscriptionServices,
} from "@/features/subscriptions";
import { ref, toRef, watchEffect } from "vue";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Skeleton,
} from "@/components/ui";
import {
  CalendarDaysIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { FeedbackCard, useTableStates, useTableOrder } from "@/features/global";
import { useSubscriptionsQuery } from "@/features/subscriptions";
import { useCurrencyFormatter } from "@/features/products";

const tableRef = ref<HTMLElement | null>(null);
const userSearch = ref("");
const userSearchDebounced = refDebounced(userSearch, 400);
const isCreateOrUpdateSidebarOpen = ref(false);
const isDeleteSubscriptionDialogOpen = ref(false);
const activeSubscription = ref<Subscription | null>(null);
const subscriptionsTableOrder = useTableOrder({
  options: {
    initialOrder: ["created_at", "desc"],
  },
});
const queryClient = useQueryClient();
const subscriptionServices = useSubscriptionServices();
const createSubscriptionMutation = useMutation({
  mutationFn: createSubscriptionMutationFn,
});
const updateSubscriptionMutation = useMutation({
  mutationFn: updateSubscriptionMutationFn,
});
const deleteSubscriptionMutation = useMutation({
  mutationFn: deleteSubscriptionMutationFn,
});

const currencyFormatter = useCurrencyFormatter();
const subscriptionsQuery = useSubscriptionsQuery({
  options: {
    enabled: true,
    search: userSearchDebounced,
    order: toRef(() => subscriptionsTableOrder.tableOrder.value),
  },
});
useInfiniteScroll(
  tableRef,
  () => {
    if (subscriptionsQuery.isFetching.value) return;
    subscriptionsQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => subscriptionsQuery.hasNextPage.value }
);
const tableLoadingStates = useTableStates(subscriptionsQuery, userSearch);

function openDeleteSubscriptionDialog(subscription: Subscription) {
  activeSubscription.value = subscription;
  isDeleteSubscriptionDialogOpen.value = true;
}

function handleSaveModal(formValues: CreateSubscription | UpdateSubscription) {
  if (subscriptionServicesTypeguards.isCreateSubscription(formValues)) {
    createSubscriptionMutation.mutate(formValues);
  } else {
    updateSubscriptionMutation.mutate(formValues);
  }
  isCreateOrUpdateSidebarOpen.value = false;
}

function openUpdateSubscriptionSidebar(subscription: Subscription) {
  activeSubscription.value = subscription;
  isCreateOrUpdateSidebarOpen.value = true;
}

async function createSubscriptionMutationFn(formValues: CreateSubscription) {
  await subscriptionServices.createSubscription(formValues);
  await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
}
async function updateSubscriptionMutationFn(formValues: UpdateSubscription) {
  const subscriptionId = formValues.subscription_id;
  if (!subscriptionId)
    throw new Error("Subscription id required to perform update");
  await subscriptionServices.updateSubscription({
    ...formValues,
    subscription_id: subscriptionId,
  });
  await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
}
async function deleteSubscriptionMutationFn(subscription: Subscription | null) {
  const subscriptionId = subscription?.id;
  if (!subscriptionId)
    throw new Error("Subscription id required to perform delete");
  await subscriptionServices.deleteSubscription(subscriptionId);
  isDeleteSubscriptionDialogOpen.value = false;
  await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
}

watchEffect(() => {
  if (isDeleteSubscriptionDialogOpen.value) return;
  if (isCreateOrUpdateSidebarOpen.value) return;

  activeSubscription.value = null;
});
</script>

<template>
  <div class="flex justify-between flex-col md:flex-row mx-4 md:mx-0">
    <div class="mb-6">
      <h2
        class="mb-0 md:mb-2 text-3xl font-extrabold leading-none tracking-tight md:text-4xl text-foreground"
      >
        Suscripciones
      </h2>
      <p class="hidden md:block max-w-xl">
        Tus suscripciones, tu control. Gestiona fácilmente tus suscripciones.
      </p>
    </div>
    <div class="hidden lg:flex gap-2">
      <Button @click="isCreateOrUpdateSidebarOpen = true">
        <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear suscripción
      </Button>
    </div>
  </div>

  <div class="flex items-center justify-between pb-4 gap-4 mx-4 md:mx-0">
    <Input
      v-model="userSearch"
      type="search"
      placeholder="Buscar usuarios"
      class="max-w-[256px]"
    />

    <div class="flex lg:hidden gap-2">
      <Button @click="isCreateOrUpdateSidebarOpen = true" size="icon">
        <PlusIcon class="w-5 h-5 stroke-[2px]" />
      </Button>
    </div>
  </div>

  <div ref="tableRef" class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="pl-4"> Usuario </TableHead>
          <TableHead class="text-center"> Plan </TableHead>
          <TableHead class="text-center"> Precio </TableHead>
          <TableHead class="text-center">Fecha inicio</TableHead>
          <TableHead class="text-center"> Fecha expiración </TableHead>
          <TableHead class="text-center"> - </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody v-if="tableLoadingStates.showLoadingState.value">
        <TableRow v-for="(_, index) in Array.from({ length: 15 })" :key="index">
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
            <Skeleton class="w-[54px] h-[36px]" />
          </TableCell>
        </TableRow>
      </TableBody>
      <TableBody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in subscriptionsQuery.data.value?.pages"
          :key="index"
        >
          <TableRow v-for="subscription in page.data" :key="subscription.id">
            <TableCell
              class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
            >
              <Avatar>
                <AvatarImage :src="subscription?.users?.avatar_url ?? ''" />
                <AvatarFallback>{{
                  `${subscription?.users?.full_name
                    ?.substring(0, 1)
                    .toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div class="ps-3">
                <div class="text-base font-semibold">
                  {{ subscription?.users?.full_name }}
                </div>
                <div
                  v-if="subscription?.users?.email"
                  class="font-normal text-slate-500"
                >
                  {{ subscription?.users?.email }}
                </div>
              </div>
            </TableCell>
            <TableCell class="text-center">
              {{ subscription.plans?.name?.toUpperCase() }}
            </TableCell>
            <TableCell class="text-center">{{
              currencyFormatter.parse(subscription.plans?.price ?? 0)
            }}</TableCell>
            <TableCell class="text-center">{{
              subscription.start_date
                ? new Date(subscription.start_date).toLocaleDateString(
                    "es-MX",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )
                : "-"
            }}</TableCell>
            <TableCell class="text-center">
              {{
                subscription.end_date
                  ? new Date(subscription.end_date).toLocaleDateString(
                      "es-MX",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "-"
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
                    @click="openUpdateSubscriptionSidebar(subscription)"
                  >
                    <PencilIcon class="w-5 h-5 mr-2" />
                    <span>Actualizar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="text-red-500 dark:text-red-500"
                    @click="openDeleteSubscriptionDialog(subscription)"
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

    <FeedbackCard v-if="tableLoadingStates.showEmptyState.value" class="mt-24">
      <template #icon>
        <CalendarDaysIcon class="w-10 h-10 stroke-[1px]" />
      </template>
      <template #title>Comienza creando una suscripción</template>
      <template #description
        >Suscripciones creadas se mostraran aqui. <br />
        Comienza creando la primera suscripción.
      </template>
      <template #action
        ><Button @click="isCreateOrUpdateSidebarOpen = true">
          <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear suscripción
        </Button>
      </template>
    </FeedbackCard>
    <FeedbackCard
      v-if="tableLoadingStates.showNoResultsState.value"
      class="mt-24"
    >
      <template #icon>
        <CalendarDaysIcon class="w-10 h-10 stroke-[1px]" />
      </template>
      <template #title>No se encontraron suscripciones</template>
      <template #description
        >Tu busqueda "{{ userSearch }}" no coincidio con alguna suscripción.
        <br />
        Por favor intente de nuevo a agregue una nueva suscripción.
      </template>
      <template #action>
        <div class="flex gap-4">
          <Button @click="userSearch = ''" variant="outline">
            Clear search
          </Button>
          <Button @click="isCreateOrUpdateSidebarOpen = true">
            <PlusIcon class="w-5 h-5 stroke-[2px] mr-2" /> Crear suscripción
          </Button>
        </div>
      </template>
    </FeedbackCard>
  </div>

  <DeleteSubscriptionDialog
    v-model:open="isDeleteSubscriptionDialogOpen"
    :subscription="activeSubscription"
    :isLoading="deleteSubscriptionMutation.isPending.value"
    @confirmDelete="deleteSubscriptionMutation.mutate"
  />
  <CreateOrEditSidebar
    v-model:open="isCreateOrUpdateSidebarOpen"
    :subscription="activeSubscription"
    :isLoading="
      updateSubscriptionMutation.isPending.value ||
      createSubscriptionMutation.isPending.value
    "
    @save="handleSaveModal"
  />
</template>
