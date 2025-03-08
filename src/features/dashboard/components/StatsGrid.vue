<script setup lang="ts">
import { useRoute } from "vue-router";
import { isDefined } from "@vueuse/core";
import { toRef } from "vue";
import {
  useCurrencyFormatter,
  useMostSoldProductsQuery,
  useProductsInStockCountQuery,
} from "@/features/products";
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
  useBestCustomersQuery,
  useCustomersCountQuery,
} from "@/features/customers";
import {
  useSalesCountQuery,
  useSalesTotalIncomeQuery,
  useSalesTotalProfitQuery,
} from "@/features/sales";
import {
  AwardIcon,
  BoxIcon,
  DollarSignIcon,
  ShoppingCartIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-vue-next";

const props = defineProps<{
  from: string;
  to: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
}>();

const route = useRoute();
const currencyFormatter = useCurrencyFormatter();

const queryOptions = {
  options: {
    orgId: toRef(() => route.params.orgId.toString()),
    range: toRef(() => ({
      from: props.from,
      to: props.to,
    })),
  },
};

const salesCountQuery = useSalesCountQuery(queryOptions);
const customersCountQuery = useCustomersCountQuery(queryOptions);
const salesTotalIncomeQuery = useSalesTotalIncomeQuery(queryOptions);
const salesTotalProfitQuery = useSalesTotalProfitQuery(queryOptions);
const productsInStockCountQuery = useProductsInStockCountQuery({
  options: {
    orgId: queryOptions.options.orgId,
  },
});
const mostSoldProductsQuery = useMostSoldProductsQuery(queryOptions);
const bestCustomersQuery = useBestCustomersQuery(queryOptions);

const periodString = toRef(() => {
  switch (props.period) {
    case "daily":
      return "día";
    case "monthly":
      return "mes";
    case "weekly":
      return "semana";
    case "yearly":
      return "año";

    default:
      return "mes";
  }
});
</script>

<template>
  <div class="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-4">
    <a href="https://www.youtube.com/watch?v=4frFBUy_yd8" target="_blank">
      <Card
        class="h-[110px] flex justify-center items-center text-xl bg-primary text-primary-foreground"
      >
        ¿Cómo utilizar inventariofacil.mx?
      </Card>
    </a>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex relative pb-2">
          <CardTitle class="text-sm font-medium"> Total de ventas </CardTitle>
          <Avatar
            class="absolute top-2 right-4 bg-primary text-primary-foreground"
          >
            <AvatarFallback> <DollarSignIcon class="size-4" /> </AvatarFallback
          ></Avatar>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(salesTotalIncomeQuery.data.value)"
              >{{ currencyFormatter.parse(salesTotalIncomeQuery.data.value) }} /
              {{ periodString }}
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex relative pb-2">
          <CardTitle class="text-sm font-medium">
            Ganancia de ventas
          </CardTitle>
          <Avatar
            class="absolute top-2 right-4 bg-primary text-primary-foreground"
          >
            <AvatarFallback> <TrendingUpIcon class="size-4" /> </AvatarFallback
          ></Avatar>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(salesTotalProfitQuery.data.value)"
              >{{ currencyFormatter.parse(salesTotalProfitQuery.data.value) }} /
              {{ periodString }}
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex relative pb-2">
          <CardTitle class="text-sm font-medium">
            Cantidad de ventas
          </CardTitle>
          <Avatar
            class="absolute top-2 right-4 bg-primary text-primary-foreground"
          >
            <AvatarFallback>
              <ShoppingCartIcon class="size-4" />
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(salesCountQuery.data.value)">
              {{ salesCountQuery.data.value }} / {{ periodString }}
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/customers`">
      <Card>
        <CardHeader class="flex relative pb-2">
          <CardTitle class="text-sm font-medium"> Total de clientes</CardTitle>
          <Avatar
            class="absolute top-2 right-4 bg-primary text-primary-foreground"
          >
            <AvatarFallback>
              <UsersIcon class="size-4" />
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(customersCountQuery.data.value)"
              >{{ customersCountQuery.data.value }} / {{ periodString }}
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/sales`">
      <Card>
        <CardHeader class="flex relative pb-2">
          <CardTitle class="text-sm font-medium"
            >Los productos mas vendidos</CardTitle
          >
          <Avatar
            class="absolute top-2 right-4 bg-primary text-primary-foreground"
          >
            <AvatarFallback> <StarIcon class="size-4" /> </AvatarFallback
          ></Avatar>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold h-[32px] flex flex-row">
            <template v-if="isDefined(mostSoldProductsQuery.data.value)">
              <div
                class="relative"
                v-for="product in mostSoldProductsQuery.data.value"
                :key="product.product_id"
              >
                <Avatar :class="`border-muted border-2`">
                  <AvatarImage
                    :src="product?.image_url ?? ''"
                    class="object-cover"
                  />
                  <AvatarFallback>
                    {{
                      `${product?.name?.substring(0, 1).toLocaleUpperCase()}`
                    }}
                  </AvatarFallback>
                </Avatar>
              </div>
              <span class="ml-2">/ {{ periodString }}</span>
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/customers`">
      <Card>
        <CardHeader class="flex relative pb-2">
          <CardTitle class="text-sm font-medium"
            >Los mejores clientes</CardTitle
          >
          <Avatar
            class="absolute top-2 right-4 bg-primary text-primary-foreground"
          >
            <AvatarFallback> <AwardIcon class="size-4" /> </AvatarFallback
          ></Avatar>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold flex flex-row gap-2 lg:h-[32px]">
            <template v-if="isDefined(bestCustomersQuery.data.value)">
              <div
                class="relative"
                v-for="customer in bestCustomersQuery.data.value"
                :key="customer.customer_id"
              >
                <Badge>
                  {{ customer.name }}
                </Badge>
              </div>
              / {{ periodString }}
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>

    <router-link :to="`/org/${route.params.orgId}/products`">
      <Card>
        <CardHeader class="flex relative pb-2">
          <CardTitle class="text-sm font-medium"
            >Total de productos en stock</CardTitle
          >
          <Avatar
            class="absolute top-2 right-4 bg-primary text-primary-foreground"
          >
            <AvatarFallback> <BoxIcon class="size-4" /> </AvatarFallback
          ></Avatar>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            <template v-if="isDefined(productsInStockCountQuery.data.value)"
              >{{ productsInStockCountQuery.data.value }}
            </template>
            <Skeleton class="h-[32px] w-[64px]" v-else :count="1" />
          </div>
        </CardContent>
      </Card>
    </router-link>
  </div>
</template>
