<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Avatar,
  AvatarFallback,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
} from "@/components/ui";
import { Sale } from "../composables";
import { useCurrencyFormatter } from "@/features/products";

type ViewSaleSidebarProps = {
  sale?: Sale | null;
};

const openModel = defineModel<boolean>("open");
withDefaults(defineProps<ViewSaleSidebarProps>(), {
  sale: null,
});

const LOCALE = {
  in_progress: "En progreso",
  cancelled: "Cancelada",
  completed: "Completada",
};
const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL;

const currencyFormatter = useCurrencyFormatter();
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-100">
      <SheetHeader>
        <SheetTitle>
          Detalle de venta
          <Badge>{{
            LOCALE[sale?.status ?? "in_progress"]?.toUpperCase()
          }}</Badge>
        </SheetTitle>
        <SheetDescription> Ve más a detalle tu venta </SheetDescription>
      </SheetHeader>

      <div class="flex flex-col gap-6 mt-6">
        <div>
          <div class="font-medium text-sm tracking-tight text-foreground">
            Cliente
          </div>
          <div class="flex items-center text-slate-900 dark:text-white">
            <Avatar>
              <AvatarFallback>{{
                `${sale?.i_customers?.name
                  ?.substring(0, 1)
                  .toLocaleUpperCase()}`
              }}</AvatarFallback>
            </Avatar>
            <div class="ps-3">
              <div class="text-base font-semibold">
                {{ sale?.i_customers?.name }}
              </div>
              <div
                v-if="sale?.i_customers?.phone"
                class="font-normal text-slate-500"
              >
                <a
                  :href="`${WHATSAPP_URL}/${sale.i_customers.phone}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block"
                >
                  {{ sale.i_customers.phone }}
                </a>
              </div>
            </div>
          </div>
        </div>
        <div v-if="sale?.notes">
          <div class="font-medium text-sm tracking-tight text-foreground">
            Notas
          </div>
          <div class="flex items-center text-slate-900 dark:text-white">
            {{ sale?.notes }}
          </div>
        </div>
        <div v-if="sale?.shipping_cost">
          <div class="font-medium text-sm tracking-tight text-foreground">
            Costo de envío
          </div>
          <div class="flex items-center text-slate-900 dark:text-white">
            {{ currencyFormatter.parse(sale?.shipping_cost) }}
          </div>
        </div>
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[100px]"> Producto </TableHead>
                <TableHead class="text-center">Cantidad</TableHead>
                <TableHead class="text-center">Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(saleProduct, idx) in sale?.i_sale_products"
                :key="saleProduct?.id ?? idx"
              >
                <TableCell class="font-medium min-w-[80px]">
                  {{ saleProduct?.name }}
                </TableCell>
                <TableCell class="text-center flex justify-center">
                  {{ saleProduct.qty }}
                </TableCell>
                <TableCell class="text-center">
                  {{
                    currencyFormatter.parse(
                      (saleProduct.price ?? 0) * (saleProduct.qty ?? 0)
                    )
                  }}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell class="font-medium min-w-[80px]"> </TableCell>
                <TableCell class="text-center flex justify-center">
                  {{
                    sale?.i_sale_products.reduce(
                      (acc, saleProduct) => acc + (saleProduct.qty ?? 0),
                      0
                    )
                  }}
                </TableCell>
                <TableCell class="text-center">
                  {{
                    currencyFormatter.parse(
                      sale?.i_sale_products.reduce(
                        (acc, saleProduct) =>
                          acc +
                          (saleProduct.qty ?? 0) * (saleProduct.price ?? 0),
                        0
                      ) ?? 0
                    )
                  }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div
            v-if="sale?.created_at"
            class="text-muted-foreground text-xs mt-4"
          >
            Creado el
            {{
              new Date(sale.created_at).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }}
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
