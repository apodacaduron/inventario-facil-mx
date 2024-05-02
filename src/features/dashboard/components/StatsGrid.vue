<script setup lang="ts">
import { useRoute } from "vue-router";
import { isDefined } from "@vueuse/core";
import { toRef } from "vue";
import { useCurrencyFormatter, useMostSoldProductsQuery, useProductsInStockCountQuery } from "@/features/products";
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
import { useBestCustomersQuery, useCustomersCountQuery } from "@/features/customers";
import { useSalesCountQuery, useSalesTotalIncomeQuery, useSalesTotalProfitQuery } from "@/features/sales";

const props = defineProps<{ from: string; to: string }>();

const route = useRoute();
const currencyFormatter = useCurrencyFormatter();
const salesCountQuery = useSalesCountQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
const customersCountQuery = useCustomersCountQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
const salesTotalIncomeQuery = useSalesTotalIncomeQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
const salesTotalProfitQuery = useSalesTotalProfitQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
const productsInStockCountQuery = useProductsInStockCountQuery();
const mostSoldProductsQuery = useMostSoldProductsQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
const bestCustomersQuery = useBestCustomersQuery({
  options: {
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
});
</script>

<template>
  <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
            <template v-if="isDefined(salesCountQuery.data.value)">
              {{ salesCountQuery.data.value }} / mes
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
            <template v-if="isDefined(salesTotalIncomeQuery.data.value)">{{
              currencyFormatter.parse(
                salesTotalIncomeQuery.data.value
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
            <template v-if="isDefined(salesTotalProfitQuery.data.value)">{{
              currencyFormatter.parse(
                salesTotalProfitQuery.data.value
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
            <template v-if="isDefined(customersCountQuery.data.value)">{{ customersCountQuery.data.value }} / mes
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
            <template v-if="isDefined(productsInStockCountQuery.data.value)">{{
              productsInStockCountQuery.data.value
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
              <div class="relative" v-for="(product) in mostSoldProductsQuery.data.value"
                :key="product.product_id">

                <Avatar :class="`border-muted border-2`">
                  <AvatarImage :src="product?.image_url ?? ''" />
                  <AvatarFallback>
                    {{
                      `${product?.name
                        ?.substring(0, 1)
                        .toLocaleUpperCase()}`
                    }}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span class="ml-2">/ mes</span>
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/customers`">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Los mejores clientes</CardTitle>
          <ArchiveBoxIcon class="w-5 h-5" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold flex flex-row gap-2 lg:h-[32px]">
            <template v-if="isDefined(bestCustomersQuery.data.value)">
              <div class="relative" v-for="(customer) in bestCustomersQuery.data.value" :key="customer.customer_id">
                <Badge>
                  {{ customer.name }}
                </Badge>
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
