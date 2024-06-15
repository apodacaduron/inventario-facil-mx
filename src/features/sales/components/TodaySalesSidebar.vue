<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Skeleton,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from '@/components/ui';
import { Sale, useSalesQuery, useSalesTotalIncomeQuery } from '../composables';
import { useDashboardDates } from '@/features/dashboard';
import { toRef } from 'vue';
import { useCurrencyFormatter } from '@/features/products';
import { FeedbackCard, useTableStates } from '@/features/global';
import { FaceFrownIcon } from '@heroicons/vue/24/outline';
import { useRoute } from 'vue-router';

const openModel = defineModel<boolean>('open');

const route = useRoute();
const currencyFormatter = useCurrencyFormatter();
const dashboardDates = useDashboardDates({
  period: 'daily',
});

const salesQuery = useSalesQuery({
  options: {
    enabled: toRef(() => Boolean(openModel.value)),
    orgId: toRef(() => route.params.orgId.toString()),
    filters: toRef(() => {
      return [
        {
          column: 'and(completed_at',
          operator: 'gte',
          value: dashboardDates.dateRangeFromPeriod.value?.from.toISOString(),
          filterType: 'or'
        },
        {
          column: 'completed_at',
          operator: 'lte',
          value: `${dashboardDates.dateRangeFromPeriod.value?.to.toISOString()})`,
          filterType: 'or'
        },
        {
          column: 'and(created_at',
          operator: 'gte',
          value: dashboardDates.dateRangeFromPeriod.value?.from.toISOString(),
          filterType: 'or',
        },
        {
          column: 'created_at',
          operator: 'lte',
          value: `${dashboardDates.dateRangeFromPeriod.value?.to.toISOString()})`,
          filterType: 'or'
        },
      ];
    }),
  },
});
const tableLoadingStates = useTableStates(salesQuery, '');
const salesTotalIncomeQuery = useSalesTotalIncomeQuery({
  options: {
    orgId: toRef(() => route.params.orgId.toString()),
    range: toRef(() => ({
      from: dashboardDates.dateRangeFromPeriod.value?.from.toISOString() ?? '',
      to: dashboardDates.dateRangeFromPeriod.value?.to.toISOString() ?? '',
    })),
  },
});

function getBadgeColorFromStatus(status: Sale['status']) {
  switch (status) {
    case 'cancelled':
      return 'destructive';
    case 'in_progress':
      return 'outline';
    case 'completed':
      return 'default';
    default:
      return 'outline';
  }
}
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Ventas del día </SheetTitle>
        <SheetDescription>
          Consulta las ventas realizadas durante el día de hoy
        </SheetDescription>
      </SheetHeader>

      <FeedbackCard class="mt-8" v-if="tableLoadingStates.showEmptyState.value">
        <template #icon>
          <FaceFrownIcon class="w-10 h-10 stroke-[1px]" />
        </template>
        <template #title>
          ¡Sin Ventas Hoy!
        </template>
        <template #description>
          ¡Comienza un Nuevo Día de Oportunidades!
        </template>
      </FeedbackCard>

      <Table v-else class="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead class="pl-4"> Nombre </TableHead>
            <TableHead class="text-center">Productos</TableHead>
            <TableHead class="text-center">Cantidad</TableHead>
            <TableHead class="text-center"> Total </TableHead>
            <TableHead class="text-center"> Costo de envio </TableHead>
            <TableHead class="text-center"> Estatus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody v-if="tableLoadingStates.showLoadingState.value">
          <TableRow
            v-for="(_, index) in Array.from({ length: 15 })"
            :key="index"
          >
            <TableCell
              class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
            >
              <Skeleton class="w-[40px] h-[40px] rounded-full" />
              <div class="ps-3 flex flex-col gap-1">
                <div class="text-base font-semibold">
                  <Skeleton class="h-[20px] w-[180px]" />
                </div>
                <div class="font-normal text-slate-500">
                  <Skeleton class="h-4 w-[160px]" />
                </div>
              </div>
            </TableCell>
            <TableCell class="text-center items-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center items-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
            <TableCell class="text-center">
              <Skeleton class="h-4 w-[180px]" />
            </TableCell>
          </TableRow>
        </TableBody>
        <TableBody>
          <!-- @vue-ignore -->
          <template
            v-for="(page, index) in salesQuery.data.value?.pages"
            :key="index"
          >
            <TableRow v-for="sale in page.data" :key="sale.id">
              <TableCell
                class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
              >
                <Avatar>
                  <AvatarFallback>{{
                    `${sale.i_customers?.name
                      ?.substring(0, 1)
                      .toLocaleUpperCase()}`
                  }}</AvatarFallback>
                </Avatar>
                <div class="ps-3">
                  <div class="text-base font-semibold">
                    {{ sale.i_customers?.name }}
                  </div>
                  <div
                    v-if="sale.i_customers?.phone"
                    class="font-normal text-slate-500"
                  >
                    <a target="_blank" rel="noopener noreferrer" class="block">
                      {{ sale.i_customers.phone }}
                    </a>
                  </div>
                </div>
              </TableCell>
              <TableCell class="text-center"
                ><div
                  class="flex -space-x-4 rtl:space-x-reverse w-fit mx-auto cursor-pointer"
                >
                  <Avatar
                    v-for="saleProduct in sale.i_sale_products.slice(0, 3)"
                    :key="saleProduct.id"
                    class="border-muted border-2"
                  >
                    <AvatarImage :src="saleProduct.image_url ?? ''" />
                    <AvatarFallback>{{
                      `${saleProduct.name?.substring(0, 1).toLocaleUpperCase()}`
                    }}</AvatarFallback>
                  </Avatar>
                  <div
                    v-if="sale.i_sale_products.length > 3"
                    class="flex items-center justify-center w-10 h-10 text-xs font-medium border-2 rounded-full bg-background border-muted"
                  >
                    {{ sale.i_sale_products.length - 3 }}
                  </div>
                </div></TableCell
              >
              <TableCell class="text-center">{{
                sale.i_sale_products.reduce(
                  (acc, saleProduct) => acc + (saleProduct.qty ?? 0),
                  0
                )
              }}</TableCell>
              <TableCell class="text-center">
                {{
                  currencyFormatter.parse(
                    sale.i_sale_products.reduce(
                      (acc, saleProduct) =>
                        acc + (saleProduct.qty ?? 0) * (saleProduct.price ?? 0),
                      0
                    )
                  )
                }}
              </TableCell>
              <TableCell class="text-center">
                {{ currencyFormatter.parse(sale.shipping_cost) }}
              </TableCell>
              <TableCell class="text-center">
                <Badge :variant="getBadgeColorFromStatus(sale.status)"
                  >{{ sale.status?.toLocaleUpperCase() }}
                </Badge>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>

      <SheetFooter class="mt-4">
        <div class="text-right">
          <span class="text-muted-foreground">Total</span>
          <div class="text-4xl font-medium">
            {{ currencyFormatter.parse(salesTotalIncomeQuery.data.value) }}
          </div>
          <span class="text-xs text-muted-foreground">Solo se suman las ventas completadas hoy</span>
        </div>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
