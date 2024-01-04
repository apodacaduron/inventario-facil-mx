<script setup lang="ts">
// import {
//   Slideover,
//   Button,
//   InputGroup,
//   Input,
// } from "@/components/ui";
import { watch } from "vue";
import { z } from "zod";
import {
  CreateProduct,
  Product,
  UpdateProduct,
  useCurrencyFormatter,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

type CreateOrEditSidebarProps = {
  mode?: "create" | "update";
  open?: boolean;
  isLoading?: boolean;
  product?: Product | null;
};

const props = withDefaults(defineProps<CreateOrEditSidebarProps>(), {
  mode: "create",
  open: false,
  isLoading: false,
});
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formValues: CreateProduct | UpdateProduct): void;
}>();

const locale = {
  create: {
    title: "Crear producto",
    subtitle: "Crea rápidamente un nuevo producto para tu inventario.",
  },
  update: {
    title: "Actualizar producto",
    subtitle: "Actualiza rápidamente un producto de tu inventario.",
  },
};

const initialForm = {
  name: "",
  description: "",
  image_url: "",
  current_stock: 0,
  unit_price: 0,
  retail_price: 0,
};

const currencyFormatter = useCurrencyFormatter();

const formSchema = toTypedSchema(z.object({
  name: z.string().min(1, "Nombre de producto es requerido"),
  description: z.string(),
  image_url: z.string(),
  current_stock: z
    .number({ invalid_type_error: "Ingresa un número válido" })
    .nonnegative()
    .finite()
    .safe(),
  unit_price: z
    .number({ invalid_type_error: "Ingresa un número válido" })
    .nonnegative()
    .finite()
    .safe(),
  retail_price: z
    .number({ invalid_type_error: "Ingresa un número válido" })
    .nonnegative()
    .finite()
    .safe(),
}))

const formInstance = useForm<CreateProduct | UpdateProduct>({
  validationSchema: formSchema,
})

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  const nextUnitPrice = currencyFormatter.toCents(formValues.unit_price);
  const nextRetailPrice = currencyFormatter.toCents(formValues.retail_price);

  const modifiedFormValues = {
    ...formValues,
    unit_price: nextUnitPrice,
    retail_price: nextRetailPrice,
  };
  emit("save", modifiedFormValues);
})

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
  forceCloseSidebar();
}
function forceCloseSidebar() {
  formInstance.resetForm();
  emit("close");
}

watch(
  () => props.open,
  (nextIsOpen) => {
    if (nextIsOpen) return;
    formInstance.resetForm({values: initialForm });
  }
);
watch(
  () => props.product,
  (nextProduct) => {
    if (!nextProduct) return;
    formInstance.resetForm({
      values: {
        name: nextProduct.name ?? "",
        description: nextProduct.description ?? "",
        image_url: nextProduct.image_url ?? "",
        current_stock: nextProduct.current_stock ?? 0,
        product_id: nextProduct.id,
        unit_price: currencyFormatter.parseRaw(nextProduct.unit_price) ?? 0,
        retail_price: currencyFormatter.parseRaw(nextProduct.retail_price) ?? 0,
      },
    });
  }
);
</script>

<template>
  <!-- <Slideover
    :modelValue="open"
    @update:modelValue="closeSidebar"
    position="right"
    :title="locale[mode].title"
    :subtitle="locale[mode].subtitle"
  >
    <div class="space-y-6 pb-16">
      <form @submit="onSubmit">
        <InputGroup label="Imagen de producto" name="image_url" class="!px-0">
          <Input
            placeholder="URL de la imagen de tu producto"
            v-model="imageUrl"
            :errors="formInstance.errors.value.image_url"
            v-bind="imageUrlAttrs"
          />
        </InputGroup>
        <InputGroup label="Nombre de producto" name="name" class="!px-0">
          <Input
            placeholder="Ingresa el nombre de producto"
            v-model="name"
            :errors="formInstance.errors.value.name"
            v-bind="nameAttrs"
          />
        </InputGroup>
        <InputGroup
          label="Descripción de producto"
          name="description"
          class="!px-0"
        >
          <Input
            placeholder="Ingresa la descripción de producto"
            v-model="description"
            :errors="formInstance.errors.value.description"
            v-bind="descriptionAttrs"
          />
        </InputGroup>
        <InputGroup
          label="Unidades disponibles"
          name="current_stock"
          class="!px-0"
        >
          <Input
            placeholder="Ingresa las unidades disponibles de producto"
            type="number"
            v-model="currentStock"
            :errors="formInstance.errors.value.current_stock"
            v-bind="currentStockAttrs"
          />
        </InputGroup>
        <InputGroup label="Precio unitario" name="unit_price" class="!px-0">
          <Input
            placeholder="Ingresa el costo unitario de producto"
            type="number"
            v-model="unitPrice"
            :errors="formInstance.errors.value.unit_price"
            v-bind="unitPriceAttrs"
          />
        </InputGroup>
        <InputGroup label="Precio de venta" name="retail_price" class="!px-0">
          <Input
            placeholder="Ingresa el precio de venta del producto"
            type="number"
            v-model="retailPrice"
            :errors="formInstance.errors.value.retail_price"
            v-bind="retailPriceAttrs"
          />
        </InputGroup>
        <InputGroup class="!px-0">
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
              @click="forceCloseSidebar"
            />
          </div>
        </InputGroup>
      </form>
    </div>
  </Slideover> -->
</template>
