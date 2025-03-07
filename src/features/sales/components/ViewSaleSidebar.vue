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
  Separator,
} from "@/components/ui";
import { Sale } from "../composables";
import { useCurrencyFormatter } from "@/features/products";
import { WHATSAPP_URL } from "@/config/constants";

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
const currencyFormatter = useCurrencyFormatter();
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
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
        <div v-if="sale?.i_customers?.name ?? sale?.customer_name">
          <div class="font-medium text-sm tracking-tight text-foreground">
            Cliente
          </div>
          <div class="flex items-center text-slate-900 dark:text-white">
            <Avatar>
              <AvatarFallback>{{
                `${
                  sale?.i_customers?.name
                    ?.substring(0, 1)
                    .toLocaleUpperCase() ??
                  sale?.customer_name?.substring(0, 1).toLocaleUpperCase()
                }`
              }}</AvatarFallback>
            </Avatar>
            <div class="ps-3">
              <div class="text-base font-semibold">
                {{ sale?.i_customers?.name ?? sale?.customer_name }}
                <span v-if="!sale?.i_customers">(Deleted)</span>
              </div>
              <div
                v-if="sale?.i_customers?.phone"
                class="font-normal text-slate-500"
              >
                <a
                  :href="`${WHATSAPP_URL}/${
                    sale.i_customers.phone ?? sale?.customer_phone
                  }`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block"
                >
                  {{ sale?.i_customers?.phone ?? sale?.customer_phone }}
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
                <TableCell class="text-center">
                  {{ saleProduct.qty }}
                </TableCell>
                <TableCell class="text-center">
                  <div>
                    <div>
                      {{
                        currencyFormatter.parse(
                          (saleProduct.price ?? 0) * (saleProduct.qty ?? 0)
                        )
                      }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                      {{ saleProduct.qty }} x
                      {{
                        currencyFormatter.parse(saleProduct.price ?? 0, {
                          signDisplay: "never",
                        })
                      }}
                    </div>
                  </div>
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
                  <div>
                    <div>
                      <div
                        v-if="
                          sale?.redeem_cashback &&
                          (sale?.total ?? 0) <
                            ((sale.cashback_redeemed ||
                              sale.i_customers?.cashback_balance) ??
                              0)
                        "
                      >
                        GRATIS
                      </div>
                      <div v-else>
                        {{ currencyFormatter.parse(sale?.total ?? 0) }}
                      </div>
                    </div>
                    <template
                      v-if="
                        sale?.redeem_cashback &&
                        (sale.cashback_redeemed ||
                          sale.i_customers?.cashback_balance)
                      "
                    >
                      <template
                        v-if="
                          (sale?.total ?? 0) >
                          ((sale.cashback_redeemed ||
                            sale.i_customers?.cashback_balance) ??
                            0)
                        "
                      >
                        <div>
                          {{
                            `-${currencyFormatter.parse(
                              sale.cashback_redeemed ||
                                sale.i_customers?.cashback_balance
                            )}`
                          }}
                        </div>
                        <Separator />
                        <div>
                          {{
                            currencyFormatter.parse(
                              (sale?.total ?? 0) -
                                ((sale.cashback_redeemed ||
                                  sale.i_customers?.cashback_balance) ??
                                  0)
                            )
                          }}
                        </div>
                      </template>
                    </template>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div
            v-if="sale?.redeem_cashback && sale.status === 'in_progress'"
            class="text-xs text-muted-foreground"
          >
            El total de esta venta sera ajustado con el monedero del cliente una
            vez que la venta se marque como completada
          </div>
          <div
            v-if="
              sale?.redeem_cashback &&
              sale.status === 'completed' &&
              sale.cashback_redeemed === 0
            "
            class="text-xs text-muted-foreground"
          >
            El cliente ya no cuenta con dinero en su monedero, por lo que el
            precio se mantiene.
          </div>

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
