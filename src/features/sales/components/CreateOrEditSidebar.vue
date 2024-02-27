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
  FormDescription,
  FormMessage,
  Textarea,
  Card,
  CardContent,
  CardFooter,
  Avatar,
  AvatarImage,
  AvatarFallback,
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
  Badge,
} from "@/components/ui";
import { ref, toRef, watch } from "vue";
import { z } from "zod";
import { CreateSale, SALE_STATUS, Sale, UpdateSale } from "../composables";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { Customer, useCustomersQuery } from "@/features/customers";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import {
  Product,
  useCurrencyFormatter,
  useProductsQuery,
} from "@/features/products";
import { toTypedSchema } from "@vee-validate/zod";
import { useFieldArray, useForm } from "vee-validate";
import { useOrganizationStore } from "@/stores";

type CreateOrEditSidebarProps = {
  viewOnly?: boolean;
  isLoading?: boolean;
  sale?: Sale | null;
};

const openModel = defineModel<boolean>("open");
const props = withDefaults(defineProps<CreateOrEditSidebarProps>(), {
  viewOnly: false,
  isLoading: false,
  sale: null,
});
const emit = defineEmits<{
  (e: "save", formValues: CreateSale): void;
}>();

const WHATSAPP_URL = import.meta.env.VITE_WHATSAPP_URL;
const LOCALE = {
  CREATE: {
    TITLE: "Crear venta",
    SUBTITLE: "Crea rápidamente una nueva venta para tu inventario.",
  },
  UPDATE: {
    TITLE: "Actualizar venta",
    SUBTITLE: "Actualiza rápidamente una venta de tu inventario.",
  },
  VIEW: {
    TITLE: "Detalle de venta",
    SUBTITLE: "Ve más a detalle tu venta",
  },
  SELECT_PRODUCTS: {
    TITLE: "Selecciona productos",
    SUBTITLE: "Selecciona facilmente productos para agregar a tu venta",
  },
  SELECT_CUSTOMERS: {
    TITLE: "Selecciona cliente",
    SUBTITLE: "Selecciona facilmente un cliente para tu venta",
  },
};
const statusOptions = [
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
const initialForm: CreateSale = {
  status: "in_progress",
  sale_date: new Date().toISOString(),
  products: [],
  customer_id: "",
  shipping_cost: 0,
  notes: "",
};

const saleSidebarMode = ref<"sales" | "products" | "customers">("sales");
const activeCustomer = ref<Customer | null>(null);
const productsRef = ref<HTMLElement | null>(null);
const customersRef = ref<HTMLElement | null>(null);
const customerSearch = ref("");
const productSearch = ref("");
const customerSearchDebounced = refDebounced(customerSearch, 400);
const productSearchDebounced = refDebounced(productSearch, 400);

const organizationStore = useOrganizationStore();
const currencyFormatter = useCurrencyFormatter();
const customersQuery = useCustomersQuery({
  options: {
    enabled: toRef(() => organizationStore.hasOrganizations),
    search: customerSearchDebounced,
    filters: [{ column: "trust_status", operator: "eq", value: "trusted" }],
    order: ["name", "asc"],
  },
});
const productsQuery = useProductsQuery({
  options: {
    enabled: toRef(() => organizationStore.hasOrganizations),
    search: productSearchDebounced,
    filters: [
      {
        column: "current_stock",
        operator: "gt",
        value: 0,
      },
    ],
    order: ["name", "asc"],
  },
});
useInfiniteScroll(
  customersRef,
  () => {
    if (customersQuery.isFetching.value) return;
    customersQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => customersQuery.hasNextPage.value }
);
useInfiniteScroll(
  productsRef,
  () => {
    if (productsQuery.isFetching.value) return;
    productsQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => productsQuery.hasNextPage.value }
);

const sidebarMode = toRef(() => (props.sale ? "UPDATE" : "CREATE"));

const formSchema = toTypedSchema(
  z.object({
    sale_id: z.string().uuid().optional(),
    status: z.enum(SALE_STATUS),
    sale_date: z.string().datetime(),
    customer_id: z.string().uuid("Por favor seleccione a un cliente"),
    shipping_cost: z
      .number({ invalid_type_error: "Ingresa un número válido" })
      .nonnegative()
      .finite()
      .safe(),
    notes: z.string().optional(),
    products: z
      .array(
        z.object({
          sale_detail_id: z.string().uuid().optional(),
          product_id: z.string().uuid(),
          price: z.number().positive().finite().safe(),
          unit_price: z.number().positive().finite().safe(),
          qty: z.number().int().positive().finite().safe(),
          name: z.string(),
          image_url: z.string(),
        })
      )
      .min(1, "Por favor seleccione al menos un producto"),
  })
);

const formInstance = useForm<CreateSale | UpdateSale>({
  initialValues: initialForm,
  validationSchema: formSchema,
});
const productsFormFieldArray = useFieldArray("products");

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
  emit("save", modifiedFormValues);
});

function formatProductToSaleDetail(
  product: Product | null
): CreateSale["products"][number] {
  if (!product) throw new Error("Cannot add product to sale missing data");

  return {
    product_id: product.id,
    name: product.name,
    image_url: product.image_url,
    price: currencyFormatter.parseRaw(product.retail_price),
    unit_price: product.unit_price,
    qty: 1,
  };
}

function hasProductInFieldList(product: Product | null) {
  return productsFormFieldArray.fields.value.some(
    (productField) =>
      (productField.value as CreateSale["products"][number])?.product_id ===
      product?.id
  );
}

function findIndexProductInFieldList(product: Product | null) {
  return productsFormFieldArray.fields.value.findIndex(
    (productField) =>
      (productField.value as CreateSale["products"][number])?.product_id ===
      product?.id
  );
}

function handleAddToProductsForm(product: Product | null) {
  if (hasProductInFieldList(product)) {
    const productFieldIdx = findIndexProductInFieldList(product);
    productsFormFieldArray.remove(productFieldIdx);
  } else {
    productsFormFieldArray.push(formatProductToSaleDetail(product));
  }
}

function handleCloseSidebar() {
  if (saleSidebarMode.value !== "sales") {
    return (saleSidebarMode.value = "sales");
  }
  openModel.value = false;
}

watch(
  () => props.sale,
  (nextSale) => {
    if (nextSale) {
      formInstance.resetForm({
        values: {
          sale_id: nextSale?.id,
          notes: nextSale?.notes ?? "",
          products:
            nextSale?.i_sale_products.map((saleProduct) => ({
              sale_detail_id: saleProduct.id,
              image_url: saleProduct.image_url ?? "",
              product_id: saleProduct.product_id ?? "",
              name: saleProduct.name ?? "",
              price: currencyFormatter.parseRaw(saleProduct?.price ?? 0),
              unit_price: saleProduct?.unit_price ?? 0,
              qty: saleProduct.qty,
            })) ?? [],
          customer_id: nextSale?.customer_id ?? "",
          sale_date: nextSale?.sale_date
            ? new Date(nextSale.sale_date).toISOString()
            : new Date().toISOString(),
          shipping_cost:
            currencyFormatter.parseRaw(nextSale?.shipping_cost) ?? 0,
          status: nextSale?.status ?? "in_progress",
        },
      });
    } else {
      formInstance.resetForm({ values: initialForm }, { force: true });
    }
  }
);
</script>

<template>
  <Sheet :open="openModel" @update:open="handleCloseSidebar">
    <SheetContent v-if="!viewOnly" side="right" class="overflow-y-auto">
      <div v-show="saleSidebarMode === 'sales'">
        <SheetHeader>
          <SheetTitle>
            {{ LOCALE[sidebarMode].TITLE }}
          </SheetTitle>
          <SheetDescription>
            {{ LOCALE[sidebarMode].SUBTITLE }}
          </SheetDescription>
        </SheetHeader>
        <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
          <FormField v-if="sale?.id" v-slot="{ componentField }" name="status">
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
                      v-for="(status, index) in statusOptions"
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
          <FormField v-if="!sale?.id" name="customer_id">
            <FormItem class="flex flex-col">
              <FormLabel>Cliente</FormLabel>
              <Button
                class="h-12"
                variant="outline"
                type="button"
                @click="saleSidebarMode = 'customers'"
              >
                <span v-if="formInstance.values.customer_id">
                  {{ activeCustomer?.name }} <br />
                  <span class="text-xs">
                    {{ activeCustomer?.phone }}
                  </span>
                </span>
                <span v-else>Seleccionar cliente</span>
              </Button>
              <FormDescription>
                Por favor, registra al cliente antes de proceder con la venta,
                en caso de que no esté registrado en nuestra base de datos.
              </FormDescription>
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
              <FormLabel>Costo de envio</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ingresa el costo de envio"
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
                    <TableHead
                      v-if="formInstance.values.status === 'in_progress'"
                      class="text-center"
                      >-</TableHead
                    >
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
                    <TableCell class="text-center flex justify-center">
                      <FormField
                        v-slot="{ componentField }"
                        :name="`products.${idx}.qty`"
                      >
                        <FormItem v-auto-animate>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Cantidad"
                              v-bind="componentField"
                              class="w-16"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </TableCell>
                    <TableCell class="text-center">
                      <FormField
                        v-slot="{ componentField }"
                        :name="`products.${idx}.price`"
                      >
                        <FormItem v-auto-animate>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Precio"
                              v-bind="componentField"
                              class="w-20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      </FormField>
                    </TableCell>
                    <TableCell
                      v-if="formInstance.values.status === 'in_progress'"
                      class="text-center"
                    >
                      <Button
                        @click="productsFormFieldArray.remove(idx)"
                        size="icon"
                        variant="ghost"
                        type="button"
                      >
                        <XMarkIcon class="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell class="font-medium min-w-[80px]"> </TableCell>
                    <TableCell class="text-center flex justify-center">
                      {{
                        formInstance.values.products.reduce(
                          (acc, formProduct) => acc + (formProduct.qty ?? 0),
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
                @click="saleSidebarMode = 'products'"
                variant="outline"
              >
                <PlusCircleIcon class="w-5 h-5 mr-2" /> Agregar productos
              </Button>
              <FormMessage />
            </FormItem>
          </FormField>
          <SheetFooter class="gap-4 sm:gap-0">
            <Button :disabled="isLoading" type="submit" class="w-full"
              >Guardar</Button
            >
            <Button
              :disabled="isLoading"
              @click="
                openModel = false;
                saleSidebarMode = 'sales';
              "
              variant="outline"
              type="button"
              >Cancelar</Button
            >
          </SheetFooter>
        </form>
      </div>
      <div ref="productsRef" v-show="saleSidebarMode === 'products'">
        <SheetHeader class="mb-6">
          <SheetTitle>{{ LOCALE.SELECT_PRODUCTS.TITLE }}</SheetTitle>
          <SheetDescription>
            {{ LOCALE.SELECT_PRODUCTS.SUBTITLE }}
          </SheetDescription>
        </SheetHeader>
        <Input
          v-model="productSearch"
          type="search"
          placeholder="Busca productos..."
        />
        <div class="grid grid-cols-2 gap-3 mt-4 mb-10">
          <Card
            v-for="product in productsQuery.data.value?.pages.flatMap(
              (page) => page.data
            )"
            :key="product?.id"
            class="flex flex-col"
          >
            <CardContent class="p-4 text-center">
              <Avatar>
                <AvatarImage :src="product?.image_url ?? ''" />
                <AvatarFallback>{{
                  `${product?.name?.substring(0, 1).toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div class="text-sm font-semibold line-clamp-2">
                {{ product?.name }}
              </div>
            </CardContent>
            <CardFooter class="p-2 mt-auto">
              <Button
                @click="handleAddToProductsForm(product)"
                class="w-full"
                type="button"
                :variant="
                  hasProductInFieldList(product) ? 'default' : 'outline'
                "
                >{{
                  hasProductInFieldList(product)
                    ? "Seleccionado"
                    : "Seleccionar"
                }}</Button
              >
            </CardFooter>
          </Card>
        </div>

        <SheetFooter>
          <Button
            @click="saleSidebarMode = 'sales'"
            variant="outline"
            class="w-full"
            type="button"
          >
            Cerrar
          </Button>
        </SheetFooter>
      </div>
      <div ref="customersRef" v-show="saleSidebarMode === 'customers'">
        <SheetHeader class="mb-6">
          <SheetTitle>{{ LOCALE.SELECT_CUSTOMERS.TITLE }}</SheetTitle>
          <SheetDescription>
            {{ LOCALE.SELECT_CUSTOMERS.SUBTITLE }}
          </SheetDescription>
        </SheetHeader>
        <Input
          v-model="customerSearch"
          type="search"
          placeholder="Busca clientes..."
        />
        <div class="grid grid-cols-2 gap-3 mt-4 mb-10">
          <Card
            v-for="customer in customersQuery.data.value?.pages.flatMap(
              (page) => page.data
            )"
            :key="customer?.id"
            class="flex flex-col"
          >
            <CardContent class="p-4 text-center">
              <Avatar>
                <AvatarFallback>{{
                  `${customer?.name?.substring(0, 1).toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div class="text-sm font-semibold line-clamp-2">
                {{ customer?.name }}
              </div>
            </CardContent>
            <CardFooter class="p-2 mt-auto">
              <Button
                @click="
                  formInstance.setFieldValue('customer_id', customer?.id ?? '');
                  activeCustomer = customer;
                  saleSidebarMode = 'sales';
                "
                class="w-full text-left"
                type="button"
                :variant="
                  formInstance.values.customer_id === customer?.id
                    ? 'default'
                    : 'outline'
                "
                >{{
                  formInstance.values.customer_id === customer?.id
                    ? "Seleccionado"
                    : "Seleccionar"
                }}</Button
              >
            </CardFooter>
          </Card>
        </div>
      </div>
    </SheetContent>
    <SheetContent v-else slide="right">
      <SheetHeader>
        <SheetTitle>
          {{ LOCALE.VIEW.TITLE }}
          <Badge>{{ sale?.status?.toUpperCase() }}</Badge>
        </SheetTitle>
        <SheetDescription>
          {{ LOCALE.VIEW.SUBTITLE }}
        </SheetDescription>
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
            Costo de envio
          </div>
          <div class="flex items-center text-slate-900 dark:text-white">
            {{ currencyFormatter.parse(sale?.shipping_cost) }}
          </div>
        </div>
        <div>
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
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
