<script setup lang="ts">
import {
  ProductsInStockTable,
  StatsGrid,
  useDashboardDates,
} from "@/features/dashboard";
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
} from "@/components/ui";

const dashboardDates = useDashboardDates();
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
              ><Badge>{{ dashboardDates.selectedMonthName.value }}</Badge>
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
        :from="dashboardDates.firstDayOfTheSelectedMonth.value.toISOString()"
        :to="dashboardDates.lastDayOfTheSelectedMonth.value.toISOString()"
      />
    </div>

    <div class="flex flex-col gap-3">
      <div class="text-slate-500 dark:text-slate-400 font-semibold">
        Productos en stock
      </div>

      <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <ProductsInStockTable />
      </div>
    </div>
  </div>
</template>
