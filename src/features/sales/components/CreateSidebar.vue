<script setup lang="ts">
import {
  Slideover,
  Button,
  InputGroup,
  RichSelect,
  RichSelectOptionIndicator,
  Input,
} from "@flavorly/vanilla-components";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import { computed, ref, watch } from "vue";
import { z } from "zod";
import { CreateSale, PAGINATION_LIMIT, SALE_STATUS } from "../composables";
import { useDebounceFn } from "@vueuse/core";
import { useCustomerServices } from "@/features/customers";
import { CheckIcon } from "@heroicons/vue/24/outline";
import {
  Product,
  useProductServices,
  useProductsByIdsQuery,
} from "@/features/products";

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

const statusOptions = [
  {
    value: "pending",
    text: "Pendiente",
    description:
      "El estado inicial cuando se crea una venta pero aún no se ha procesado o confirmado.",
    status: "blue",
  },
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
  {
    value: "returned",
    text: "Regresada",
    description:
      "Los artículos de la venta fueron devueltos por el cliente después de completarse la venta.",
    status: "yellow",
  },
];

const productIds = ref<string[]>([]);
const productServices = useProductServices();
const customerServices = useCustomerServices();
const initialForm: CreateSale = {
  status: "pending",
  sale_date: new Date().toISOString(),
  products: [],
  customer_id: "",
};
const formInstance = useForm<CreateSale>({
  initialValues: initialForm,
  validate: zodResolver(
    z.object({
      sale_id: z.string().uuid().optional(),
      status: z.enum(SALE_STATUS),
      sale_date: z.string().datetime(),
      customer_id: z.string().uuid("Por favor seleccione a un cliente"),
      products: z
        .array(
          z.object({
            sale_detail_id: z.string().uuid().optional(),
            product_id: z.string().uuid(),
            price: z.number().positive().finite().safe(),
            qty: z.number().int().positive().finite().safe(),
          })
        )
        .min(1, "Por favor seleccione al menos un producto"),
    })
  ),
  async onSubmit(formValues) {
    emit("save", formValues);
  },
});
const productsByIdsQuery = useProductsByIdsQuery({
  options: {
    enabled: computed(() => Boolean(productIds.value.length)),
    productIds: productIds,
  },
});

const { value: status, attrs: statusAttrs } = formInstance.register("status");
const { value: customer, attrs: customerAttrs } =
  formInstance.register("customer_id");

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
  formInstance.resetForm();
  emit("close");
}

function updateProductIds(nextProductIds: string[]) {
  productIds.value = nextProductIds;

  const basicFormProducts = nextProductIds.map((productId) => ({
    product_id: productId,
    price: 0,
    qty: 0,
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

const debouncedFetchCustomerOptions = useDebounceFn(
  async (query: string = "", nextPage: number = 0) => {
    const customersResponse = await customerServices.loadList({
      offset: nextPage,
      search: query,
    });

    return {
      results: customersResponse.data || [],
      hasMorePages: (customersResponse.count ?? 0) >= PAGINATION_LIMIT,
    };
  },
  400
);
const debouncedFetchProductsOptions = useDebounceFn(
  async (query: string = "", nextPage: number = 0) => {
    const productsResponse = await productServices.loadList({
      offset: nextPage,
      search: query,
    });

    return {
      results:
        productsResponse.data?.filter((product) =>
          product.i_stock.some((stock) => (stock.current_stock ?? 0) >= 1)
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
</script>

<template>
  <Slideover
    :modelValue="open"
    @update:modelValue="closeSidebar"
    position="right"
    :title="locale.create.title"
    :subtitle="locale.create.subtitle"
  >
    <div class="space-y-6 pb-16">
      <form @submit="formInstance.handleSubmit">
        <InputGroup label="Status de venta" name="status" class="px-0">
          <RichSelect
            v-model="status"
            :options="statusOptions"
            placeholder="Seleccione status de venta"
            clearable
            v-bind="statusAttrs"
          >
            <template
              #label="{ option: { raw: order }, className, isSelected }"
            >
              <RichSelectOptionIndicator
                :name="order.text"
                :status="order.status"
                :description="order.description"
                :selected="isSelected"
                :disabled="order.disabled"
                :parent-classes="className"
              />
            </template>
            <template
              #option="{ option: { raw: order }, className, isSelected }"
            >
              <RichSelectOptionIndicator
                class="px-3 py-2"
                :name="order?.text"
                :status="order?.status"
                :description="order?.description"
                :selected="isSelected"
                :disabled="order?.disabled"
                :parent-classes="className"
              />
            </template>
          </RichSelect>
        </InputGroup>
        <InputGroup label="Cliente" name="customer_id" class="px-0">
          <RichSelect
            v-model="customer"
            v-bind="customerAttrs"
            placeholder="Seleccione un cliente"
            :fetchOptions="debouncedFetchCustomerOptions"
            :minimum-input-length="3"
            value-attribute="id"
            text-attribute="name"
            :errors="formInstance.errors.value.customer_id"
            feedback="Por favor, registra al cliente antes de proceder con la venta, en caso de que no esté registrado en nuestra base de datos."
          >
            <template
              #option="{ option: { raw: customer }, className, isSelected }"
            >
              <div
                class="px-3 py-2 relative flex items-center"
                :class="className"
              >
                {{ customer.name }}
                <div v-if="isSelected" class="absolute right-3">
                  <CheckIcon class="w-4 h-4 stroke-[2px]" />
                </div>
              </div>
            </template>
          </RichSelect>
        </InputGroup>
        <InputGroup label="Seleccione productos" name="products" class="px-0">
          <RichSelect
            :modelValue="productIds"
            @update:modelValue="updateProductIds"
            placeholder="Seleccione productos"
            :fetchOptions="debouncedFetchProductsOptions"
            :minimum-input-length="3"
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
              class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
            >
              <thead
                class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
              >
                <tr>
                  <th scope="col" class="px-6 py-3">Nombre</th>
                  <th scope="col" class="px-6 py-3 text-center">Cantidad</th>
                  <th scope="col" class="px-6 py-3">Precio</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="page in productsByIdsQuery.data.value?.pages">
                  <tr
                    v-for="(product, index) in page.data"
                    :key="index"
                    class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <th
                      scope="row"
                      class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
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
                        />
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </InputGroup>
        <InputGroup class="px-0">
          <div class="flex flex-col gap-4">
            <Button
              :loading="isLoading"
              :disabled="isLoading"
              label="Guardar"
              variant="primary"
              type="submit"
            />
            <Button
              :disabled="isLoading"
              label="Cancelar"
              @click="closeSidebar"
            />
          </div>
        </InputGroup>
      </form>
    </div>
  </Slideover>
</template>
