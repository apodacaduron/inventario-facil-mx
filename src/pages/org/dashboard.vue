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
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  InboxStackIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";
import {
  Skeleton,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui";
import { isDefined } from "@vueuse/core";
import { useCurrencyFormatter } from "@/features/products";
import { useRoute } from "vue-router";
import { ref, toRef, watch } from "vue";

const monthNumber = ref(new Date().getMonth());
const fullYearNumber = ref(new Date().getFullYear());
const yearDropdownMonthOptions = ref(
  generateMonthOptions(fullYearNumber.value)
);
const firstDayOfTheSelectedMonth = toRef(
  () => new Date(fullYearNumber.value, monthNumber.value, 1)
);
const lastDayOfTheSelectedMonth = toRef(
  () => new Date(fullYearNumber.value, monthNumber.value + 1, 0)
);
const selectedMonthName = toRef(() =>
  generateMonthName({ year: fullYearNumber.value, month: monthNumber.value })
);

const route = useRoute();
const currencyFormatter = useCurrencyFormatter();
const totalCustomersQuery = useTotalCustomersQuery({
  options: {
    range: toRef(() => ({
      from: firstDayOfTheSelectedMonth.value.toISOString(),
      to: lastDayOfTheSelectedMonth.value.toISOString(),
    })),
  },
});
const totalSalesQuery = useTotalSalesQuery({
  options: {
    range: toRef(() => ({
      from: firstDayOfTheSelectedMonth.value.toISOString(),
      to: lastDayOfTheSelectedMonth.value.toISOString(),
    })),
  },
});
const salesPricesQuery = useSalesPricesQuery({
  options: {
    range: toRef(() => ({
      from: firstDayOfTheSelectedMonth.value.toISOString(),
      to: lastDayOfTheSelectedMonth.value.toISOString(),
    })),
  },
});
const productsInStockQuery = useProductsInStockQuery();

function generateMonthName(data: { year: number; month: number }) {
  return new Date(data.year, data.month, 1)
    .toLocaleString("es-MX", {
      month: "long",
    })
    .toLocaleUpperCase();
}

function generateMonthOptions(year: number) {
  const MONTHS_OF_YEAR = 12;

  const nextArrayLength =
    year === new Date().getFullYear()
      ? new Date().getMonth() + 1
      : MONTHS_OF_YEAR;

  return Array.from({
    length: nextArrayLength,
  }).map((_v, index) => ({
    monthName: generateMonthName({ year, month: index }),
    monthNumber: index,
  }));
}

watch(fullYearNumber, (nextFullYearNumber) => {
  yearDropdownMonthOptions.value = generateMonthOptions(nextFullYearNumber);
});
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-3">
      <div class="text-slate-500 dark:text-slate-400 font-semibold">
        Estadísticas
        <Badge variant="secondary">MENSUAL</Badge>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost"
              ><Badge>{{ selectedMonthName }}</Badge></Button
            >
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-[200px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel class="flex justify-between items-center">
                <Button @click="fullYearNumber--" size="sm">
                  <ChevronLeftIcon class="h-4 w-4" />
                </Button>
                {{ fullYearNumber }}
                <Button
                  size="sm"
                  :disabled="fullYearNumber === new Date().getFullYear()"
                  @click="fullYearNumber++"
                >
                  <ChevronRightIcon class="h-4 w-4" />
                </Button>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                v-for="option in yearDropdownMonthOptions"
                :key="option.monthNumber"
                @click="monthNumber = option.monthNumber"
              >
                <CheckIcon
                  v-if="option.monthNumber === monthNumber"
                  class="mr-2 h-4 w-4"
                />
                {{ option.monthName }}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
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
