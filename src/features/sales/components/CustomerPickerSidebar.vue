<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Avatar,
  AvatarFallback,
  Input,
  Card,
  CardContent,
  Button,
  CardFooter,
} from "@/components/ui";
import { FeedbackCard, useTableStates } from "@/features/global";
import { UsersIcon } from "lucide-vue-next";
import { Customer, useCustomersQuery } from "@/features/customers";
import { ref, toRef } from "vue";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useRoute } from "vue-router";

type Props = {
  activeCustomer: Customer | null;
};
type Emits = {
  (e: "select", customer: Customer | null): void;
};

const openModel = defineModel<boolean>("open");
defineProps<Props>();
defineEmits<Emits>();

const customersRef = ref<HTMLElement | null>(null);
const customerSearch = ref("");
const customerSearchDebounced = refDebounced(customerSearch, 400);

const route = useRoute();
const customersQuery = useCustomersQuery({
  options: {
    enabled: toRef(() => openModel.value),
    orgId: toRef(() => route.params.orgId.toString()),
    search: customerSearchDebounced,
    filters: [{ column: "trust_status", operator: "eq", value: "trusted" }],
    order: ["name", "asc"],
  },
});
const customersLoadingStates = useTableStates(customersQuery, customerSearch);
useInfiniteScroll(
  customersRef,
  () => {
    if (customersQuery.isFetching.value) return;
    customersQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => customersQuery.hasNextPage.value }
);
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-100">
      <div ref="customersRef">
        <SheetHeader class="mb-6">
          <SheetTitle>Selecciona cliente</SheetTitle>
          <SheetDescription>
            Selecciona fácilmente un cliente para tu venta
          </SheetDescription>
        </SheetHeader>
        <Input
          v-model="customerSearch"
          type="search"
          placeholder="Busca clientes..."
        />

        <FeedbackCard
          v-if="customersLoadingStates.showEmptyState.value"
          class="my-24"
        >
          <template #icon>
            <UsersIcon class="size-10" />
          </template>
          <template #title>No tienes clientes aun</template>
          <template #description
            >Cuando tengas clientes agregados se mostraran aquí.
          </template>
        </FeedbackCard>

        <div v-else class="grid grid-cols-2 gap-3 mt-4 mb-10">
          <Card
            v-for="customer in customersQuery.data.value?.pages.flatMap(
              (page) => page.data
            )"
            :key="customer?.id"
            class="flex flex-col"
          >
            <CardContent class="p-4 text-center">
              <Avatar>
                <AvatarFallback>{{
                  `${customer?.name?.substring(0, 1).toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div>
                <div class="text-sm font-semibold line-clamp-2">
                  {{ customer?.name ?? "-" }}
                </div>
                <div class="text-sm font-normal text-slate-500">
                  {{ customer?.phone ?? "-" }}
                </div>
              </div>
            </CardContent>
            <CardFooter class="px-2 pb-2 mt-auto">
              <Button
                @click="
                  $emit('select', customer);
                  openModel = false;
                "
                class="w-full text-left"
                type="button"
                :variant="
                  activeCustomer?.id === customer?.id ? 'default' : 'outline'
                "
                >{{
                  activeCustomer?.id === customer?.id
                    ? "Seleccionado"
                    : "Seleccionar"
                }}</Button
              >
            </CardFooter>
          </Card>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
