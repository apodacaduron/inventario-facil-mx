<script setup lang="ts">
import {
  Slideover,
  Button,
  InputGroup,
  Input,
} from "@flavorly/vanilla-components";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import { watch } from "vue";
import { z } from "zod";
import { CreateProduct, Product, UpdateProduct } from "../composables";

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
};

const formInstance = useForm<CreateProduct | UpdateProduct>({
  initialValues: initialForm,
  validate: zodResolver(
    z.object({
      name: z.string().min(1, "Nombre de producto es requerido"),
      description: z.string(),
      image_url: z.string(),
      current_stock: z.number().int().nonnegative().finite().safe(),
    })
  ),
  async onSubmit(formValues) {
    emit("save", formValues);
  },
});
const { value: name, attrs: nameAttrs } = formInstance.register("name");
const { value: description, attrs: descriptionAttrs } =
  formInstance.register("description");
const { value: imageUrl, attrs: imageUrlAttrs } =
  formInstance.register("image_url");
const { value: currentStock, attrs: currentStockAttrs } =
  formInstance.register("current_stock");

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
  formInstance.resetForm();
  emit("close");
}

watch(
  () => props.open,
  (nextIsOpen) => {
    if (nextIsOpen) return;
    formInstance.resetForm({
      values: initialForm,
    });
  }
);
watch(
  () => props.product,
  (nextProduct) => {
    if (!nextProduct) return;
    const stock = nextProduct.i_stock.find(Boolean);
    const stockId = stock?.id;
    const currentStock = stock?.current_stock;

    if (!stockId) throw new Error("StockId is required to fill update sidebar");
    if (typeof currentStock !== "number" || !isFinite(currentStock))
      throw new Error("currentStock is required to fill update sidebar");

    formInstance.resetForm({
      values: {
        name: nextProduct.name,
        description: nextProduct.description,
        image_url: nextProduct.image_url,
        current_stock: currentStock,
        product_id: nextProduct.id,
        stock_id: stockId,
      },
    });
  }
);
</script>

<template>
  <Slideover
    :modelValue="open"
    @update:modelValue="closeSidebar"
    position="right"
    :title="locale[mode].title"
    :subtitle="locale[mode].subtitle"
  >
    <div class="space-y-6 pb-16">
      <form @submit="formInstance.handleSubmit">
        <InputGroup label="Imagen de producto" name="image_url" class="px-0">
          <Input
            placeholder="URL de la imagen de tu producto"
            v-model="imageUrl"
            :errors="formInstance.errors.value.image_url"
            v-bind="imageUrlAttrs"
          />
        </InputGroup>
        <InputGroup label="Nombre de producto" name="name" class="px-0">
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
          class="px-0"
        >
          <Input
            placeholder="Ingresa la descripción de producto"
            v-model="description"
            :errors="formInstance.errors.value.description"
            v-bind="descriptionAttrs"
          />
        </InputGroup>
        <InputGroup
          label="Cantidad de producto"
          name="current_stock"
          class="px-0"
        >
          <Input
            placeholder="Ingresa la cantidad de producto"
            type="number"
            v-model="currentStock"
            :errors="formInstance.errors.value.current_stock"
            v-bind="currentStockAttrs"
          />
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
