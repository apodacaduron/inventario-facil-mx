<script setup lang="ts">
import {
  Sheet,
  Button,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui";
import { watch } from "vue";
import { z } from "zod";
import {
  Product,
  UpdateProduct,
  useCurrencyFormatter,
  useProductServices,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { analytics } from "@/config/analytics";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import SharedProductFormValues from "./SharedProductFormValues.vue";
import { notifyIfHasError } from "@/features/global";

type UpdateProductSidebarProps = {
  product?: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = withDefaults(defineProps<UpdateProductSidebarProps>(), {
  product: null,
});

const initialForm: UpdateProduct = {
  name: "",
  description: "",
  current_stock: null,
  unit_price: null,
  retail_price: null,
};

const currencyFormatter = useCurrencyFormatter();
const formSchema = toTypedSchema(
  z
    .object({
      name: z.string().min(1, "Nombre de producto es requerido"),
      description: z.string().optional(),
      current_stock: z
        .number({ invalid_type_error: "Ingresa un número válido" })
        .nonnegative({ message: "Ingrese un número mayor o igual a cero" })
        .finite()
        .safe(),
      unit_price: z.coerce
        .number({ invalid_type_error: "Ingresa un número válido" })
        .positive({ message: "Ingrese un número positivo" })
        .finite()
        .safe(),
      retail_price: z.coerce
        .number({ invalid_type_error: "Ingresa un número válido" })
        .positive({ message: "Ingrese un número positivo" })
        .finite()
        .safe(),
    })
    .refine((data) => data.unit_price < data.retail_price, {
      message: "Precio de venta debe de ser mayor al precio unitario",
      path: ["retail_price"],
    })
);

const queryClient = useQueryClient();
const productServices = useProductServices();
const updateProductMutation = useMutation({
  mutationFn: async (formValues: UpdateProduct) => {
    if (!props.product?.id)
      throw new Error("Product id required to perform update");
    const { error } = await productServices.updateProduct(
      props.product?.id,
      formValues
    );
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    openModel.value = false;
    analytics.event("update-product-stock", formValues);
  },
});
const formInstance = useForm<UpdateProduct>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  const nextUnitPrice = currencyFormatter.toCents(formValues?.unit_price ?? 0);
  const nextRetailPrice = currencyFormatter.toCents(
    formValues?.retail_price ?? 0
  );

  const modifiedFormValues = {
    ...formValues,
    unit_price: nextUnitPrice,
    retail_price: nextRetailPrice,
  };

  updateProductMutation.mutate(modifiedFormValues);
});

watch(openModel, (nextOpenValue) => {
  if (nextOpenValue && props.product) {
    formInstance.resetForm({
      values: {
        name: props.product.name ?? "",
        description: props.product.description ?? "",
        current_stock: props.product.current_stock ?? 0,
        unit_price: currencyFormatter.parseRaw(props.product.unit_price) ?? 0,
        retail_price:
          currencyFormatter.parseRaw(props.product.retail_price) ?? 0,
      },
    });
  }
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Actualizar producto </SheetTitle>
        <SheetDescription>
          Actualiza rápidamente un producto de tu inventario.
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
        <SharedProductFormValues />

        <SheetFooter class="flex flex-row gap-2">
          <Button
            :disabled="updateProductMutation.isPending.value"
            @click="openModel = false"
            variant="outline"
            type="button"
            class="w-full"
            >Cancelar</Button
          >
          <Button
            :disabled="updateProductMutation.isPending.value"
            type="submit"
            class="w-full"
            >Guardar</Button
          >
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
