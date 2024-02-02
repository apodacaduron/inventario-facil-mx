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
import StatCard from "./StatCard.vue";
import { Skeleton } from "@/components/ui";

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
          <template v-if="isDefined(salesPricesQuery.data.value?.profit_total)"
            >{{
              currencyFormatter.parse(salesPricesQuery.data.value?.profit_total)
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
</template>
