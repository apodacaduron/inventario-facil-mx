<script setup lang="ts">
import {
  Sheet,
  Button,
  Input,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Textarea,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Select,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectContent,
  SelectGroup,
} from "@/components/ui";
import { watch } from "vue";
import { z } from "zod";
import { SALE_STATUS, Sale, UpdateSale, useSaleServices } from "../composables";
import { PlusCircleIcon } from "@heroicons/vue/24/outline";
import { useCurrencyFormatter } from "@/features/products";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { notifyIfHasError, useSidebarManager } from "@/features/global";
import { analytics } from "@/config/analytics";
import { useRoute } from "vue-router";

type Props = {
  sidebarManager: ReturnType<typeof useSidebarManager>;
  sale?: Sale | null;
  activeProducts: Map<
    string,
    Pick<
      Sale["i_sale_products"][number],
      "product_id" | "price" | "unit_price" | "qty" | "name" | "image_url"
    >
  >;
};

const openModel = defineModel<boolean>("open");
const props = withDefaults(defineProps<Props>(), {
  sale: null,
});

const STATUS_OPTIONS = [
  {
    value: "in_progress",
    text: "En progreso",
    description:
      "La venta se está procesando activamente, se están seleccionando o empaquetando los artículos.",
    status: "blue",
  },
  {
    value: "completed",
    text: "Completada",
    description: "La venta se ha procesado y completado con éxito.",
    status: "green",
  },
  {
    value: "cancelled",
    text: "Cancelada",
    description:
      "La venta fue anulada antes de completarse, posiblemente a solicitud del cliente u otras razones.",
    status: "red",
  },
];

const initialForm: UpdateSale = {
  sale_id: "",
  status: "in_progress",
  sale_date: new Date().toISOString(),
  products: [],
  shipping_cost: 0,
  notes: "",
  cancellation_notes: "",
};

const route = useRoute();
const queryClient = useQueryClient();
const saleServices = useSaleServices();
const currencyFormatter = useCurrencyFormatter();
const updateSaleMutation = useMutation({
  mutationFn: async (formValues: UpdateSale) => {
    const saleId = formValues.sale_id;
    if (!saleId) throw new Error("Sale id required to perform update");
    const { error } = await saleServices.updateSale(
      route.params.orgId.toString(),
      formValues
    );
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    openModel.value = false;
    analytics.event("update-sale", formValues);
  },
});

const formSchema = toTypedSchema(
  z.object({
    sale_id: z.string().uuid(),
    status: z.enum(SALE_STATUS),
    sale_date: z.string().datetime(),
    customer_id: z.string().uuid().optional(),
    shipping_cost: z.coerce
      .number({ invalid_type_error: "Ingresa un número válido" })
      .nonnegative({ message: "Ingrese un número mayor o igual a cero" })
      .finite()
      .safe(),
    notes: z.string().optional(),
    cancellation_notes: z.string().optional(),
    products: z
      .array(
        z
          .object({
            product_id: z.string().uuid(),
            price: z.coerce
              .number({ message: "Ingrese un número válido" })
              .positive({ message: "Ingrese un número positivo" })
              .finite()
              .safe(),
            unit_price: z.coerce
              .number({ message: "Ingrese un número válido" })
              .positive({ message: "Ingrese un número positivo" })
              .finite()
              .safe(),
            qty: z.coerce
              .number({ message: "Ingrese un número válido" })
              .int("Cantidad debe ser número entero")
              .positive({ message: "Ingrese un número positivo" })
              .finite()
              .safe(),
            name: z.string(),
            image_url: z.string().nullish().optional(),
          })
          .refine(
            (data) => {
              return (
                data.unit_price < (currencyFormatter.toCents(data.price) ?? 0)
              );
            },
            {
              message: "Precio de venta debe de ser mayor al precio unitario",
              path: ["price"],
            }
          )
      )
      .min(1, "Por favor seleccione al menos un producto"),
  })
);

const formInstance = useForm<UpdateSale>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  const modifiedProducts = formValues.products.map((formProduct) => ({
    ...formProduct,
    price: currencyFormatter.toCents(formProduct.price),
  }));
  const nextShippingCost = currencyFormatter.toCents(formValues.shipping_cost);

  const modifiedFormValues = {
    ...formValues,
    shipping_cost: nextShippingCost ?? 0,
    products: (() => {
      if (formValues.status === "cancelled") {
        return props.sale?.i_sale_products ?? [];
      }

      return modifiedProducts;
    })(),
  };
  updateSaleMutation.mutate(modifiedFormValues);
});

watch(openModel, (nextOpenValue) => {
  if (nextOpenValue && props.sale) {
    if (!props.activeProducts.size) {
      props.sale?.i_sale_products.forEach((saleProduct) => {
        if (!saleProduct.product_id) return;

        props.activeProducts.set(saleProduct.product_id, {
          image_url: saleProduct.image_url,
          name: saleProduct.name,
          price: saleProduct.price,
          product_id: saleProduct.product_id,
          qty: saleProduct.qty,
          unit_price: saleProduct.unit_price,
        });
      });
    }

    formInstance.resetForm(
      {
        values: {
          sale_id: props.sale?.id,
          notes: props.sale?.notes ?? "",
          products: props.activeProducts
            ? Array.from(props.activeProducts.values()).map((product) => ({
                ...product,
                price: currencyFormatter.parseRaw(product.price ?? 0),
              }))
            : [],
          customer_id: props.sale?.customer_id ?? undefined,
          sale_date: props.sale?.sale_date
            ? new Date(props.sale.sale_date).toISOString()
            : new Date().toISOString(),
          shipping_cost:
            currencyFormatter.parseRaw(props.sale?.shipping_cost) ?? 0,
          status: props.sale?.status ?? "in_progress",
        },
      },
      { force: true }
    );
  }
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-100">
      <SheetHeader>
        <SheetTitle> Actualizar venta </SheetTitle>
        <SheetDescription>
          Actualiza rápidamente una venta de tu inventario.
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
        <FormField v-slot="{ componentField }" name="status">
          <FormItem v-auto-animate>
            <FormLabel>Status de venta</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione status de venta" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="(status, index) in STATUS_OPTIONS"
                    :value="status.value"
                    :key="index"
                  >
                    {{ status.text }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="notes">
          <FormItem v-auto-animate>
            <FormLabel>Notas de venta</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ingresa notas de la venta"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="shipping_cost">
          <FormItem v-auto-animate>
            <FormLabel>Costo de envío</FormLabel>
            <FormControl>
              <Input
                placeholder="Ingresa el costo de envío"
                inputmode="numeric"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField name="products">
          <FormItem class="flex flex-col">
            <FormLabel>Productos</FormLabel>

            <Table v-if="formInstance.values.products?.length">
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[100px]"> Producto </TableHead>
                  <TableHead class="text-center">Cantidad</TableHead>
                  <TableHead class="text-center">Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(productField, idx) in formInstance.values.products"
                  :key="productField?.product_id ?? idx"
                >
                  <TableCell class="font-medium min-w-[80px]">
                    {{ productField?.name }}
                  </TableCell>
                  <TableCell class="text-center">
                    {{ productField?.qty }}
                  </TableCell>
                  <TableCell class="flex justify-center">
                    <FormField
                      v-slot="{ componentField }"
                      :name="`products.${idx}.price`"
                    >
                      <FormItem v-auto-animate>
                        <FormControl>
                          <Input
                            inputmode="numeric"
                            placeholder="Precio"
                            v-bind="componentField"
                            class="w-20"
                            @input="
                              productField.product_id &&
                                activeProducts.set(productField.product_id, {
                                  ...productField,
                                  price: currencyFormatter.toCents(
                                    productField.price
                                  ),
                                })
                            "
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </FormField>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium min-w-[80px]"> </TableCell>
                  <TableCell class="text-center flex justify-center">
                    {{
                      formInstance.values.products.reduce(
                        (acc, formProduct) =>
                          acc + Number(formProduct.qty ?? 0),
                        0
                      )
                    }}
                  </TableCell>
                  <TableCell class="text-center">
                    {{
                      currencyFormatter.parse(
                        formInstance.values.products.reduce(
                          (acc, formProduct) =>
                            acc +
                            (formProduct.qty ?? 0) *
                              (currencyFormatter.toCents(formProduct.price) ??
                                0),
                          0
                        ) ?? 0
                      )
                    }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Button
              v-if="formInstance.values.status === 'in_progress'"
              type="button"
              @click="sidebarManager.openSidebar('product-picker')"
              variant="outline"
            >
              <PlusCircleIcon class="w-5 h-5 mr-2" /> Agregar productos
            </Button>
            <FormMessage />
          </FormItem>
        </FormField>
        <SheetFooter class="gap-4 sm:gap-0">
          <Button
            :disabled="updateSaleMutation.isPending.value"
            type="submit"
            class="w-full"
            >Guardar</Button
          >
          <Button
            :disabled="updateSaleMutation.isPending.value"
            @click="openModel = false"
            variant="outline"
            type="button"
            >Cancelar</Button
          >
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
