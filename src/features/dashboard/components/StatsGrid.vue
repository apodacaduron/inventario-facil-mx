<script setup lang="ts">
import { useRoute } from "vue-router";
import { isDefined } from "@vueuse/core";
import {
  useSalesPricesQuery,
  useTotalCustomersQuery,
  useTotalSalesQuery,
} from "../composable";
import { toRef } from "vue";
import { useCurrencyFormatter } from "@/features/products";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  InboxStackIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{ from: string; to: string }>();

const route = useRoute();
const currencyFormatter = useCurrencyFormatter();
const totalSalesQuery = useTotalSalesQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
const totalCustomersQuery = useTotalCustomersQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
const salesPricesQuery = useSalesPricesQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">
            Cantidad de ventas
          </CardTitle>
          <InboxStackIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(totalSalesQuery.data.value)">
              {{ totalSalesQuery.data.value }}
            </template>
            <Skeleton class="h-6 w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium"> Total de ventas </CardTitle>
          <BanknotesIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template
              v-if="isDefined(salesPricesQuery.data.value?.sale_price_total)"
              >{{
                currencyFormatter.parse(
                  salesPricesQuery.data.value?.sale_price_total
                )
              }}
            </template>
            <Skeleton class="h-6 w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium">
            Ganancia de ventas
          </CardTitle>
          <CurrencyDollarIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template
              v-if="isDefined(salesPricesQuery.data.value?.profit_total)"
              >{{
                currencyFormatter.parse(
                  salesPricesQuery.data.value?.profit_total
                )
              }}
            </template>
            <Skeleton class="h-6 w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/customers`">
      <Card>
        <CardHeader
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <CardTitle class="text-sm font-medium"> Total de clientes</CardTitle>
          <UserGroupIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(totalCustomersQuery.data.value)"
              >{{ totalCustomersQuery.data.value }}
            </template>
            <Skeleton class="h-6 w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>
  </div>
</template>
