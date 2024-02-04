<script setup lang="ts">
import { useRoute } from "vue-router";
import { isDefined } from "@vueuse/core";
import {
  useProductsInStockQuery,
  useSalesPricesQuery,
  useTotalCustomersQuery,
  useTotalSalesQuery,
  useMostSoldProductsQuery,
  useBestCustomersQuery
} from "../composable";
import { toRef } from "vue";
import { useCurrencyFormatter } from "@/features/products";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import {
  ArchiveBoxIcon,
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
const productsInStockQuery = useProductsInStockQuery();
const mostSoldProductsQuery = useMostSoldProductsQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
    limit: 5,
  },
});
const bestCustomersQuery = useBestCustomersQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
    limit: 3,
  },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Cantidad de ventas
          </CardTitle>
          <InboxStackIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(totalSalesQuery.data.value)">
              {{ totalSalesQuery.data.value }} / mes
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium"> Total de ventas </CardTitle>
          <BanknotesIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(salesPricesQuery.data.value?.sale_price_total)">{{
              currencyFormatter.parse(
                salesPricesQuery.data.value?.sale_price_total
              )
            }} / mes
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Ganancia de ventas
          </CardTitle>
          <CurrencyDollarIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(salesPricesQuery.data.value?.profit_total)">{{
              currencyFormatter.parse(
                salesPricesQuery.data.value?.profit_total
              )
            }} / mes
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/customers`">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium"> Total de clientes</CardTitle>
          <UserGroupIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(totalCustomersQuery.data.value)">{{ totalCustomersQuery.data.value }} / mes
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/products`">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total de productos en stock</CardTitle>
          <ArchiveBoxIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(productsInStockQuery.data.value)">{{
              productsInStockQuery.data.value.data?.reduce<number>(
                (acc, product) => acc + (product.current_stock || 0),
                0
              ) || 0
            }}
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Los productos mas vendidos</CardTitle>
          <ArchiveBoxIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold h-[32px] flex flex-row">
            <template v-if="isDefined(mostSoldProductsQuery.data.value)">
              <div class="relative" v-for="(soldProduct, index) in mostSoldProductsQuery.data.value"
                :key="soldProduct.id">

                <Avatar class="border-muted border-2">
                  <AvatarImage :src="soldProduct.i_products?.image_url ?? ''" />
                  <AvatarFallback>
                    {{
                      `${soldProduct.i_products?.name
                        ?.substring(0, 1)
                        .toLocaleUpperCase()}`
                    }}
                  </AvatarFallback>
                </Avatar>
                <div class="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 text-center">{{
                  index + 1 }}</div>
              </div>
              <span class="ml-2">/ mes</span>
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/customers`" class="lg:col-span-2">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Los mejores clientes</CardTitle>
          <ArchiveBoxIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold flex flex-row gap-2 lg:h-[32px]">
            <template v-if="isDefined(bestCustomersQuery.data.value)">
              <div class="relative" v-for="(customer, index) in bestCustomersQuery.data.value" :key="customer.id">
                <Badge>
                  {{ customer.name }}
                </Badge>
                <div class="absolute top-0 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 text-center">{{
                  index + 1 }}
                </div>
              </div>
              / mes
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>
  </div>
</template>
