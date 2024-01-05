<script setup lang="ts">
import {
  StatCard,
  useProductsInStockQuery,
  useSalesPricesQuery,
  useTotalCustomersQuery,
  useTotalSalesQuery,
} from "@/features/dashboard";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  InboxStackIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import { Skeleton } from "@/components/ui";
import { isDefined } from "@vueuse/core";
import { useCurrencyFormatter } from "@/features/products";
import { useRoute } from "vue-router";

const DATE = new Date();
const FIRST_DAY_OF_MONTH = new Date(DATE.getFullYear(), DATE.getMonth(), 1);
const LAST_DAY_OF_MONTH = new Date(DATE.getFullYear(), DATE.getMonth() + 1, 0);

const route = useRoute();
const currencyFormatter = useCurrencyFormatter();
const totalCustomersQuery = useTotalCustomersQuery({
  options: {
    range: {
      from: FIRST_DAY_OF_MONTH.toISOString(),
      to: LAST_DAY_OF_MONTH.toISOString(),
    },
  },
});
const totalSalesQuery = useTotalSalesQuery({
  options: {
    range: {
      from: FIRST_DAY_OF_MONTH.toISOString(),
      to: LAST_DAY_OF_MONTH.toISOString(),
    },
  },
});
const salesPricesQuery = useSalesPricesQuery({
  options: {
    range: {
      from: FIRST_DAY_OF_MONTH.toISOString(),
      to: LAST_DAY_OF_MONTH.toISOString(),
    },
  },
});
const productsInStockQuery = useProductsInStockQuery();
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-3">
      <div class="text-slate-500 dark:text-slate-400 font-semibold">
        Estadísticas
        <span
          class="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
          >MENSUAL
        </span>
      </div>
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-4">
        <router-link :to="`/org/${route.params.orgId}/sales`">
          <StatCard>
            <template #icon><InboxStackIcon class="w-6 h-6" /></template>
            <template #stat>
              <template v-if="isDefined(totalSalesQuery.data.value)"
                >{{ totalSalesQuery.data.value }}
              </template>
              <Skeleton class="h-6 w-[64px]" v-else :count="1" />
            </template>
            <template #label>Cantidad de ventas</template>
          </StatCard>
        </router-link>
        <router-link :to="`/org/${route.params.orgId}/sales`">
          <StatCard>
            <template #icon><BanknotesIcon class="w-6 h-6" /></template>
            <template #stat>
              <template
                v-if="isDefined(salesPricesQuery.data.value?.sale_price_total)"
                >{{
                  currencyFormatter.parse(
                    salesPricesQuery.data.value?.sale_price_total
                  )
                }}
              </template>
              <Skeleton class="h-6 w-[64px]" v-else :count="1" />
            </template>
            <template #label>Total de ventas</template>
          </StatCard>
        </router-link>
        <router-link :to="`/org/${route.params.orgId}/sales`">
          <StatCard>
            <template #icon><CurrencyDollarIcon class="w-6 h-6" /></template>
            <template #stat>
              <template
                v-if="isDefined(salesPricesQuery.data.value?.profit_total)"
                >{{
                  currencyFormatter.parse(
                    salesPricesQuery.data.value?.profit_total
                  )
                }}
              </template>
              <Skeleton class="h-6 w-[64px]" v-else :count="1" />
            </template>
            <template #label>Ganancia de ventas</template>
          </StatCard>
        </router-link>
        <router-link :to="`/org/${route.params.orgId}/customers`">
          <StatCard>
            <template #icon><UserGroupIcon class="w-6 h-6" /></template>
            <template #stat>
              <template v-if="isDefined(totalCustomersQuery.data.value)"
                >{{ totalCustomersQuery.data.value }}
              </template>
              <Skeleton class="h-6 w-[64px]" v-else :count="1" />
            </template>
            <template #label>Total de clientes</template>
          </StatCard>
        </router-link>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div class="text-slate-500 dark:text-slate-400 font-semibold">
        Productos en stock
      </div>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table
          ref="tableRef"
          class="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400"
        >
          <thead
            class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400"
          >
            <tr>
              <th scope="col" class="px-6 py-3">Nombre</th>
              <th scope="col" class="px-6 py-3 text-center">Cantidad</th>
              <th scope="col" class="px-6 py-3 text-center">Precio unitario</th>
              <th scope="col" class="px-6 py-3 text-center">Precio de venta</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in productsInStockQuery.data.value?.data"
              :key="product.id"
              class="bg-white border-b dark:bg-slate-900 dark:border-slate-800"
            >
              <th
                scope="row"
                class="flex items-center px-6 py-4 text-slate-900 whitespace-nowrap dark:text-white"
              >
                <img
                  v-if="product.image_url"
                  class="w-12 h-12 rounded-full"
                  :src="product.image_url"
                  alt="Rounded avatar"
                />
                <img
                  v-else
                  class="w-12 h-12 rounded-full"
                  src="/product-placeholder.png"
                  alt="Rounded avatar"
                />
                <div class="ps-3">
                  <div class="text-base font-semibold">{{ product.name }}</div>
                  <div
                    v-if="product.description"
                    class="font-normal text-slate-500"
                  >
                    {{ product.description }}
                  </div>
                </div>
              </th>
              <td class="text-center">
                {{ product.current_stock }}
              </td>
              <td class="text-center">
                {{ currencyFormatter.parse(product.unit_price) ?? "-" }}
              </td>
              <td class="text-center">
                {{ currencyFormatter.parse(product.retail_price) ?? "-" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
