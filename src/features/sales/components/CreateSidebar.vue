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
} from "@/components/ui";
import { computed, ref, watch } from "vue";
import { z } from "zod";
import { CreateSale, PAGINATION_LIMIT, SALE_STATUS } from "../composables";
import { refDebounced, useDebounceFn } from "@vueuse/core";
import { useCustomerServices, useCustomersQuery } from "@/features/customers";
import { CheckIcon, ChevronDoubleDownIcon } from "@heroicons/vue/24/outline";
import {
  Product,
  useCurrencyFormatter,
  useProductServices,
  useProductsByIdsQuery,
} from "@/features/products";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
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

const locale = {
  create: {
    title: "Crear venta",
    subtitle: "Crea rápidamente una nueva venta para tu inventario.",
  },
};

const productIds = ref<string[]>([]);
const productServices = useProductServices();
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
        })
      )
      .min(1, "Por favor seleccione al menos un producto"),
  })
);

const formInstance = useForm<CreateSale>({
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
    products: modifiedProducts,
  };

  emit("save", modifiedFormValues);
});
const productsByIdsQuery = useProductsByIdsQuery({
  options: {
    enabled: computed(() => Boolean(productIds.value.length)),
    productIds: productIds,
  },
});

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
  forceCloseSidebar();
}
function forceCloseSidebar() {
  formInstance.resetForm();
  emit("close");
}

function updateProductIds(nextProductIds: string[]) {
  productIds.value = nextProductIds;

  const basicFormProducts = nextProductIds.map((productId) => ({
    product_id: productId,
    price: null,
    unit_price: null,
    qty: null,
  }));

  formInstance.setFieldValue("products", basicFormProducts);
}

function updateProductRow(data: {
  newValue: string;
  product: Product;
  field: "qty" | "price";
}) {
  const formProductsCopy = [...formInstance.values.products];
  const matchingProduct = formProductsCopy.find(
    (formProduct) => formProduct.product_id === data.product.id
  );
  if (!matchingProduct) return;
  const matchingIndex = formProductsCopy.indexOf(matchingProduct);
  formProductsCopy.splice(matchingIndex, 1, {
    ...matchingProduct,
    [data.field]: data.newValue,
  });
  formInstance.setFieldValue("products", formProductsCopy);
}

const organizationStore = useOrganizationStore();
const customerSearch = ref("");
const customerSearchDebounced = refDebounced(customerSearch, 400);
const customersQuery = useCustomersQuery({
  options: {
    enabled: computed(() => organizationStore.hasOrganizations),
    search: customerSearchDebounced,
  },
});

function comboboxCustomerFilter(list: string[], search: string) {
  customerSearch.value = search;

  return list;
}

const debouncedFetchProductsOptions = useDebounceFn(
  async (query: string = "", nextPage: number = 0) => {
    const productsResponse = await productServices.loadList({
      offset: nextPage,
      search: query,
    });

    return {
      results:
        productsResponse.data?.filter(
          (product) => (product.current_stock ?? 0) >= 1
        ) || [],
      hasMorePages: (productsResponse.count ?? 0) >= PAGINATION_LIMIT,
    };
  },
  400
);

watch(
  () => props.open,
  (nextIsOpen) => {
    if (nextIsOpen) return;
    formInstance.resetForm({
      values: initialForm,
    });
    productIds.value = [];
  }
);
watch(
  () => productsByIdsQuery.data.value,
  (nextProductsByIdsQueryData) => {
    const formProductsWithPricing: CreateSale["products"] = [];
    const formProductsWithoutPricing: CreateSale["products"] = [];

    formInstance.values.products.forEach((formProduct) => {
      if (formProduct.price === null) {
        formProductsWithoutPricing.push(formProduct);
      } else {
        formProductsWithPricing.push(formProduct);
      }
    });

    const nextFormProducts = formProductsWithoutPricing.map((formProduct) => {
      const matchingProduct = nextProductsByIdsQueryData?.pages
        .flatMap((page) => page.data)
        .find((product) => product?.id === formProduct.product_id);

      return {
        ...formProduct,
        unit_price: matchingProduct?.unit_price ?? null,
        price: currencyFormatter.parseRaw(
          matchingProduct?.retail_price ?? null
        ),
      };
    });

    formInstance.setFieldValue("products", [
      ...formProductsWithPricing,
      ...nextFormProducts,
    ]);
  }
);
</script>

<template>
  <Sheet :open="open" @update:open="closeSidebar">
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>
          {{ locale.create.title }}
        </SheetTitle>
        <SheetDescription>
          {{ locale.create.subtitle }}
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
                                customer.id === formInstance.values.customer_id
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
              Por favor, registra al cliente antes de proceder con la venta, en
              caso de que no esté registrado en nuestra base de datos.
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
        <!-- <InputGroup label="Seleccione productos" name="products" class="!px-0">
          <RichSelect
            :modelValue="productIds"
            @update:modelValue="updateProductIds"
            placeholder="Seleccione productos"
            :fetchOptions="debouncedFetchProductsOptions"
            :minimum-input-length="2"
            value-attribute="id"
            text-attribute="name"
            multiple
            tags
            clearable
            :errors="formInstance.errors.value.products"
            feedback="Si el producto no está visible, probablemente no se encuentra en existencia en el inventario en este momento."
          >
            <template
              #option="{ option: { raw: product }, className, isSelected }"
            >
              <div
                class="px-3 py-2 relative flex items-center"
                :class="className"
              >
                {{ product.name }}
                <div v-if="isSelected" class="absolute right-3">
                  <CheckIcon class="w-4 h-4 stroke-[2px]" />
                </div>
              </div>
            </template>
          </RichSelect>

          <div
            v-if="formInstance.values.products.length"
            class="relative overflow-x-auto shadow-md sm:rounded-lg"
          >
            <table
              class="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400"
            >
              <thead
                class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400"
              >
                <tr>
                  <th scope="col" class="px-6 py-3">Nombre</th>
                  <th scope="col" class="px-6 py-3 text-center">Cantidad</th>
                  <th scope="col" class="px-6 py-3">Precio</th>
                </tr>
              </thead>
              <tbody>
                <template
                  v-for="(page, index) in productsByIdsQuery.data.value?.pages"
                  :key="index"
                >
                  <tr
                    v-for="product in page.data"
                    :key="product.id"
                    class="bg-white border-b dark:bg-slate-900 dark:border-slate-800"
                  >
                    <th
                      scope="row"
                      class="flex items-center px-6 py-4 text-slate-900 whitespace-nowrap dark:text-white"
                    >
                      <img
                        v-if="product.image_url"
                        class="w-8 h-8 rounded-full"
                        :src="product.image_url"
                        alt="Rounded avatar"
                      />
                      <img
                        v-else
                        class="w-8 h-8 rounded-full"
                        src="/product-placeholder.png"
                        alt="Rounded avatar"
                      />
                      <div class="ps-3">
                        <div class="text-sm font-semibold">
                          {{ product.name }}
                        </div>
                      </div>
                    </th>
                    <td>
                      <div class="mx-auto w-fit">
                        <Input
                          :modelValue="
                            formInstance.values.products.find(
                              (_product) => _product.product_id === product.id
                            )?.qty
                          "
                          @update:modelValue="
                            updateProductRow({
                              newValue: $event,
                              product,
                              field: 'qty',
                            })
                          "
                          class="w-[80px]"
                          required
                          type="number"
                        />
                      </div>
                    </td>
                    <td>
                      <div class="mx-auto w-fit">
                        <Input
                          :modelValue="
                            formInstance.values.products.find(
                              (_product) => _product.product_id === product.id
                            )?.price
                          "
                          @update:modelValue="
                            updateProductRow({
                              newValue: $event,
                              product,
                              field: 'price',
                            })
                          "
                          class="w-[80px]"
                          required
                          step=".01"
                          type="number"
                          :errors="formInstance.errors.value.products"
                        />
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </InputGroup> -->
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
    </SheetContent>
  </Sheet>
</template>
