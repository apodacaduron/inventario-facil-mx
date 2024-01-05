<script setup lang="ts">
import {
  Sheet,
  Button,
  Popover,
  PopoverTrigger,
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
  PopoverContent,
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
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
} from "@/components/ui";
import { computed, ref, watch } from "vue";
import { z } from "zod";
import { CreateSale, SALE_STATUS } from "../composables";
import { refDebounced } from "@vueuse/core";
import { useCustomersQuery } from "@/features/customers";
import {
  CheckIcon,
  ChevronDoubleDownIcon,
  PlusCircleIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import {
  Product,
  useCurrencyFormatter,
  useProductsQuery,
} from "@/features/products";
import { toTypedSchema } from "@vee-validate/zod";
import { useFieldArray, useForm } from "vee-validate";
import { cn } from "@/lib/utils";
import { useOrganizationStore } from "@/stores";

type CreateSidebarProps = {
  open: boolean;
  isLoading?: boolean;
};

const props = withDefaults(defineProps<CreateSidebarProps>(), {
  mode: "create",
  open: false,
  isLoading: false,
});
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formValues: CreateSale): void;
}>();

const LOCALE = {
  CREATE: {
    TITLE: "Crear venta",
    SUBTITLE: "Crea rápidamente una nueva venta para tu inventario.",
  },
  SELECT_PRODUCTS: {
    TITLE: "Selecciona productos",
    SUBTITLE: "Selecciona facilmente productos para agregar a tu venta",
  },
};

const isProductSelectorOpen = ref(false);
const currencyFormatter = useCurrencyFormatter();
const initialForm: CreateSale = {
  status: "in_progress",
  sale_date: new Date().toISOString(),
  products: [],
  customer_id: "",
  shipping_cost: 0,
  notes: "",
};

const formSchema = toTypedSchema(
  z.object({
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
          // This 2 field are not stored in DB
          name: z.string(),
          image_url: z.string(),
        })
      )
      .min(1, "Por favor seleccione al menos un producto"),
  })
);

const formInstance = useForm<CreateSale>({
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

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
  forceCloseSidebar();
}
function forceCloseSidebar() {
  if (isProductSelectorOpen.value) return (isProductSelectorOpen.value = false);

  formInstance.resetForm();
  emit("close");
  isProductSelectorOpen.value = false;
}

const organizationStore = useOrganizationStore();
const customerSearch = ref("");
const customerSearchDebounced = refDebounced(customerSearch, 400);
const productSearch = ref("");
const productSearchDebounced = refDebounced(customerSearch, 400);
const customersQuery = useCustomersQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
    search: customerSearchDebounced,
  },
});
const productsQuery = useProductsQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
    search: productSearchDebounced,
  },
});

function comboboxCustomerFilter(list: string[], search: string) {
  customerSearch.value = search;

  return list;
}

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

watch(
  () => props.open,
  () => {
    formInstance.resetForm({
      values: initialForm,
    });
  }
);
</script>

<template>
  <Sheet :open="open" @update:open="closeSidebar">
    <SheetContent side="right" class="overflow-y-auto">
      <div v-show="!isProductSelectorOpen">
        <SheetHeader>
          <SheetTitle>
            {{ LOCALE.CREATE.TITLE }}
          </SheetTitle>
          <SheetDescription>
            {{ LOCALE.CREATE.SUBTITLE }}
          </SheetDescription>
        </SheetHeader>
        <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
          <FormField name="customer_id">
            <FormItem class="flex flex-col">
              <FormLabel>Cliente</FormLabel>
              <Popover>
                <PopoverTrigger as-child>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      :class="
                        cn(
                          'justify-between',
                          !formInstance.values.customer_id &&
                            'text-muted-foreground'
                        )
                      "
                    >
                      {{
                        formInstance.values.customer_id
                          ? customersQuery.data.value?.pages
                              .find(Boolean)
                              ?.data?.find(
                                (customer) =>
                                  customer.id ===
                                  formInstance.values.customer_id
                              )?.name
                          : "Seleccione un cliente..."
                      }}
                      <ChevronDoubleDownIcon
                        class="ml-2 h-4 w-4 shrink-0 opacity-50"
                      />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent class="w-[200px] p-0">
                  <!-- @vue-ignore -->
                  <Command :filterFunction="comboboxCustomerFilter">
                    <CommandInput placeholder="Busque un cliente..." />
                    <CommandEmpty>{{
                      customersQuery.isPending.value ||
                      customersQuery.isLoading.value ||
                      customersQuery.isFetching.value
                        ? "Cargando..."
                        : "Sin resultados."
                    }}</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          v-for="customer in customersQuery.data.value?.pages.find(
                            Boolean
                          )?.data"
                          :key="customer.id"
                          :value="customer.id"
                          @select="
                            () => {
                              formInstance.setValues({
                                customer_id: customer.id,
                              });
                            }
                          "
                        >
                          <CheckIcon
                            :class="
                              cn(
                                'mr-2 h-4 w-4',
                                customer.id === formInstance.values.customer_id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )
                            "
                          />
                          {{ customer.name }}
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

          <Table v-if="formInstance.values.products?.length">
            <TableHeader>
              <TableRow>
                <TableHead class="w-[100px]"> Producto </TableHead>
                <TableHead class="text-center">Cantidad</TableHead>
                <TableHead class="text-center">Precio</TableHead>
                <TableHead class="text-center">-</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(productField, idx) in formInstance.values.products"
                :key="productField.product_id ?? idx"
              >
                <TableCell class="font-medium">
                  {{ productField.name }}
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
                <TableCell class="text-center">
                  <Button
                    @click="productsFormFieldArray.remove(idx)"
                    size="icon"
                    variant="ghost"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button @click="isProductSelectorOpen = true" variant="outline"
            ><PlusCircleIcon class="w-5 h-5 mr-2" /> Agregar productos</Button
          >
          <SheetFooter>
            <Button :disabled="isLoading" type="submit" class="w-full"
              >Guardar</Button
            >
            <Button
              :disabled="isLoading"
              @click="forceCloseSidebar"
              variant="outline"
              >Cancelar</Button
            >
          </SheetFooter>
        </form>
      </div>
      <div v-show="isProductSelectorOpen">
        <SheetHeader class="mb-6">
          <SheetTitle>{{ LOCALE.SELECT_PRODUCTS.TITLE }}</SheetTitle>
          <SheetDescription>
            {{ LOCALE.SELECT_PRODUCTS.SUBTITLE }}
          </SheetDescription>
        </SheetHeader>
        <Input v-model="productSearch" placeholder="Busca productos..." />
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
          <Button @click="forceCloseSidebar" variant="outline" class="w-full">
            Cerrar
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  </Sheet>
</template>
