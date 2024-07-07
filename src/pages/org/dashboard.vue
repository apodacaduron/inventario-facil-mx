<script setup lang="ts">
import { StatsGrid, useDashboardDates } from "@/features/dashboard";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  AreaChart,
  CardContent,
  CardHeader,
  CardTitle,
  Card,
} from "@/components/ui";
import { useStorage } from "@vueuse/core";
import { computed, toRef } from "vue";
import { useYearMonthlySalesQuery } from "@/features/sales";
import { useRoute } from "vue-router";
import { useCurrencyFormatter } from "@/features/products";
import { useOrganizationStore } from "@/stores";

const locale = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
};

const organizationStore = useOrganizationStore();
const currencyFormatter = useCurrencyFormatter();
const route = useRoute();
const statsFiltersRef = useStorage<{
  period: "daily" | "weekly" | "monthly" | "yearly";
}>("dashboard-stats-filters", { period: "monthly" });
const dashboardDates = useDashboardDates({
  period: toRef(() => statsFiltersRef.value.period),
});

function toUpperCase<T extends string>(text: T) {
  return text.toUpperCase() as Uppercase<T>;
}

const yearMonthlySalesQuery = useYearMonthlySalesQuery({
  options: {
    orgId: toRef(() => route.params.orgId.toString()),
  },
});

const yearMonthlySalesData = computed(() => {
  return yearMonthlySalesQuery.data.value?.map((monthData) => ({
    name: dashboardDates.generateMonthName({
      month: monthData.month_number - 1,
      year: new Date().getFullYear(),
    }),
    total: currencyFormatter.parseRaw(monthData.total_sales),
  }));
});
</script>

<template>
  <div class="py-6 mt-[71px] md:px-6 h-[calc(100vh-71px)] overflow-y-auto">
    <div class="flex flex-col gap-8 mx-4 md:mx-0 mb-6">
      <div class="flex flex-col gap-5">
        <div class="text-slate-500 dark:text-slate-400 font-semibold">
          Estadísticas
          <DropdownMenu v-if="organizationStore.isPremium">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost">
                <Badge variant="secondary">
                  {{ locale[toUpperCase(statsFiltersRef.period)] }}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
              <DropdownMenuLabel>Periodo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup v-model="statsFiltersRef.period">
                <DropdownMenuRadioItem value="daily">
                  Diario
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="weekly">
                  Semanal
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="monthly">
                  Mensual
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="yearly">
                  Anual
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu
            v-if="
              organizationStore.isPremium &&
              statsFiltersRef.period === 'monthly'
            "
          >
            <DropdownMenuTrigger as-child>
              <Button variant="ghost">
                <Badge>{{ dashboardDates.selectedMonthName.value }}</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[200px]">
              <DropdownMenuGroup>
                <DropdownMenuLabel class="flex justify-between items-center">
                  <Button
                    @click="dashboardDates.selectedYear.value--"
                    size="sm"
                  >
                    <ChevronLeftIcon class="h-4 w-4" />
                  </Button>
                  {{ dashboardDates.selectedYear.value }}
                  <Button
                    size="sm"
                    :disabled="
                      dashboardDates.selectedYear.value ===
                      new Date().getFullYear()
                    "
                    @click="dashboardDates.selectedYear.value++"
                  >
                    <ChevronRightIcon class="h-4 w-4" />
                  </Button>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  v-for="option in dashboardDates.dropdownOptions.value"
                  :key="option.monthNumber"
                  @click="
                    dashboardDates.selectedMonth.value = option.monthNumber
                  "
                >
                  <CheckIcon
                    v-if="
                      option.monthNumber === dashboardDates.selectedMonth.value
                    "
                    class="mr-2 h-4 w-4"
                  />
                  {{ option.monthName }}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <StatsGrid
          :period="statsFiltersRef.period"
          :from="dashboardDates.dateRangeFromPeriod.value!.from.toISOString()"
          :to="dashboardDates.dateRangeFromPeriod.value!.to.toISOString()"
        />

        <Card>
          <CardHeader>
            <CardTitle class="font-medium">
              Total de ventas del año en curso
            </CardTitle>
          </CardHeader>
          <CardContent class="overflow-x-auto">
            <div class="min-w-[1580px]">
              <AreaChart
                v-if="yearMonthlySalesData?.length"
                :data="yearMonthlySalesData"
                :yFormatter="
                  (tick) =>
                    currencyFormatter.parse(Number(tick) * 100) ??
                    tick.toString()
                "
                index="name"
                :categories="['total']"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
