<script setup lang="ts">
import { StatsGrid, useDashboardDates } from '@/features/dashboard';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline';
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
} from '@/components/ui';
import { useStorage } from '@vueuse/core';
import { toRef } from 'vue';

const locale = {
  DAILY: 'Diario',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
  YEARLY: 'Anual'
}

const statsFiltersRef = useStorage<{
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}>('dashboard-stats-filters', { period: 'monthly' });
const dashboardDates = useDashboardDates({
  period: toRef(() => statsFiltersRef.value.period),
});

function toUpperCase<T extends string>(text: T) {
  return text.toUpperCase() as Uppercase<T>
}
</script>

<template>
  <div class="flex flex-col gap-8 mx-4 md:mx-0 mb-6">
    <div class="flex flex-col gap-3">
      <div class="text-slate-500 dark:text-slate-400 font-semibold">
        Estadísticas
        <DropdownMenu>
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

        <DropdownMenu v-if="statsFiltersRef.period === 'monthly'">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost">
              <Badge>{{ dashboardDates.selectedMonthName.value }}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-[200px]">
            <DropdownMenuGroup>
              <DropdownMenuLabel class="flex justify-between items-center">
                <Button @click="dashboardDates.selectedYear.value--" size="sm">
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
                @click="dashboardDates.selectedMonth.value = option.monthNumber"
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
    </div>
  </div>
</template>
