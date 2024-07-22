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
  FormDescription,
  Switch,
  Separator,
} from "@/components/ui";
import { computed, watch } from "vue";
import { z } from "zod";
import {
  CreateSale,
  SALE_STATUS,
  Sale,
  useSaleHelpers,
  useSaleServices,
} from "../composables";
import { Customer } from "@/features/customers";
import { PlusCircleIcon } from "@heroicons/vue/24/outline";
import { useCurrencyFormatter } from "@/features/products";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { useRoute } from "vue-router";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { analytics } from "@/config/analytics";
import { notifyIfHasError, useLayerManager } from "@/features/global";
import { UserPlusIcon } from "lucide-vue-next";
import { useOrganizationStore } from "@/stores";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
  activeCustomer: Customer | null;
  activeProducts: Map<
    string,
    Pick<
      Sale["i_sale_products"][number],
      "product_id" | "price" | "unit_price" | "qty" | "name" | "image_url"
    >
  >;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const initialForm: CreateSale = {
  redeem_cashback: false,
  status: "in_progress",
  sale_date: new Date().toISOString(),
  products: [],
  shipping_cost: 0,
  notes: "",
  cancellation_notes: "",
};

const route = useRoute();
const queryClient = useQueryClient();
const saleHelpers = useSaleHelpers();
const saleServices = useSaleServices();
const organizationStore = useOrganizationStore();
const currencyFormatter = useCurrencyFormatter();
const createSaleMutation = useMutation({
  mutationFn: async (formValues: CreateSale) => {
    const { error } = await saleServices.createSale(
      route.params.orgId.toString(),
      formValues
    );
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["sales"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });

    if (organizationStore.canTriggerLowStockAlert) {
      await saleHelpers.notifyLowOnStockProducts(
        route.params.orgId.toString(),
        formValues,
        organizationStore.currentUserOrganization?.i_organizations
          ?.low_stock_threshold ?? 0
      );
    }

    openModel.value = false;
    analytics.event("create-sale", formValues);
  },
});

const formSchema = toTypedSchema(
  z.object({
    redeem_cashback: z.boolean(),
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
              .nonnegative({ message: "Ingrese un número positivo" })
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

const formInstance = useForm<CreateSale>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const sumProductPrices = computed(
  () =>
    formInstance.values.products.reduce(
      (acc, formProduct) =>
        acc +
        (formProduct.qty ?? 0) *
          (currencyFormatter.toCents(formProduct.price) ?? 0),
      0
    ) ?? 0
);

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  const modifiedProducts = formValues.products.map((formProduct) => ({
    ...formProduct,
    price: currencyFormatter.toCents(formProduct.price),
  }));
  const nextShippingCost = currencyFormatter.toCents(formValues.shipping_cost);

  const modifiedFormValues = {
    ...formValues,
    shipping_cost: nextShippingCost ?? 0,
    products: modifiedProducts,
  };
  createSaleMutation.mutate(modifiedFormValues);
});

function openSidebar(name: string) {
  props.layerManager.setCurrentLayerState({
    formValues: { ...formInstance.values },
  });
  props.layerManager.openLayer(name);
}

watch(openModel, (nextOpenValue) => {
  if (!nextOpenValue) return;

  formInstance.resetForm(
    {
      values: {
        ...initialForm,
        ...(props.layerManager.currentLayer.value.state?.formValues as Record<
          string,
          unknown
        >),
        customer_id: props.activeCustomer?.id,
        products: props.activeProducts
          ? Array.from(props.activeProducts.values()).map((product) => ({
              ...product,
              price: currencyFormatter.parseRaw(product.price ?? 0),
            }))
          : [],
      },
    },
    { force: true }
  );
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Crear venta </SheetTitle>
        <SheetDescription>
          Crea rápidamente una nueva venta para tu inventario.
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
        <FormField name="customer_id">
          <FormItem class="flex flex-col">
            <FormLabel>Cliente</FormLabel>
            <div class="flex gap-3">
              <Button
                class="h-12 w-full"
                variant="outline"
                type="button"
                @click="openSidebar('customer-picker')"
              >
                <span v-if="formInstance.values.customer_id">
                  {{ activeCustomer?.name }} <br />
                  <span class="text-xs">
                    {{ activeCustomer?.phone }}
                  </span>
                </span>
                <span v-else>Seleccionar cliente</span>
              </Button>
              <Button
                type="button"
                class="shrink-0 size-12"
                variant="ghost"
                size="icon"
                @click="openSidebar('create-customer')"
              >
                <UserPlusIcon class="size-4" />
              </Button>
            </div>

            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-if="
            activeCustomer &&
            organizationStore.currentUserOrganization?.i_organizations
              ?.is_cashback_enabled &&
            (activeCustomer.cashback_balance ?? 0) > 0
          "
          v-slot="{ value, handleChange }"
          name="redeem_cashback"
        >
          <FormItem class="flex flex-row items-center justify-between">
            <div class="space-y-0.5">
              <FormLabel class="text-base">
                {{ activeCustomer?.name }} tiene
                {{ currencyFormatter.parse(activeCustomer.cashback_balance) }}
                cashback disponible, ¿Deseas aplicarlo en esta compra?
              </FormLabel>
              <FormDescription>
                El monto actualizado se vera disponible después de que esta
                venta se marque como completada.
              </FormDescription>
            </div>
            <FormControl>
              <Switch :checked="value" @update:checked="handleChange" />
            </FormControl>
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
                    <div>
                      <div>
                        <div
                          v-if="
                            formInstance.values.redeem_cashback &&
                            sumProductPrices <
                              (activeCustomer?.cashback_balance ?? 0)
                          "
                        >
                          GRATIS
                        </div>
                        <div v-else>
                          {{ currencyFormatter.parse(sumProductPrices) }}
                        </div>
                      </div>
                      <template v-if="formInstance.values.redeem_cashback">
                        <template
                          v-if="
                            sumProductPrices >
                            (activeCustomer?.cashback_balance ?? 0)
                          "
                        >
                          <div>
                            {{
                              `-${currencyFormatter.parse(
                                activeCustomer?.cashback_balance
                              )}`
                            }}
                          </div>
                          <Separator />
                          <div>
                            {{
                              currencyFormatter.parse(
                                sumProductPrices -
                                  (activeCustomer?.cashback_balance ?? 0)
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

            <Button
              v-if="formInstance.values.status === 'in_progress'"
              type="button"
              @click="openSidebar('product-picker')"
              variant="outline"
            >
              <PlusCircleIcon class="w-5 h-5 mr-2" /> Agregar productos
            </Button>
            <FormMessage />
          </FormItem>
        </FormField>

        <div
          v-if="
            activeCustomer &&
            organizationStore.currentUserOrganization?.i_organizations
              ?.is_cashback_enabled &&
            !formInstance.values.redeem_cashback
          "
          class="text-xs text-muted-foreground"
        >
          Tus clientes acumulan el
          {{
            organizationStore.currentUserOrganization?.i_organizations
              ?.cashback_percent
          }}% por cada compra.
        </div>

        <SheetFooter class="flex flex-row gap-2">
          <Button
            :disabled="createSaleMutation.isPending.value"
            @click="openModel = false"
            variant="outline"
            type="button"
            class="w-full"
            >Cancelar</Button
          >
          <Button
            :disabled="createSaleMutation.isPending.value"
            type="submit"
            class="w-full"
            >Guardar</Button
          >
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
