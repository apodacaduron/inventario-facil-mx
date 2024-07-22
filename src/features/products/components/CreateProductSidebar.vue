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
  CreateProduct,
  useCurrencyFormatter,
  useProductServices,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { analytics } from "@/config/analytics";
import { notifyIfHasError } from "@/features/global";
import { useRoute } from "vue-router";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import SharedProductFormValues from "./SharedProductFormValues.vue";

const openModel = defineModel<boolean>("open");

const initialForm: CreateProduct = {
  name: "",
  description: "",
  current_stock: null,
  unit_price: null,
  retail_price: null,
  image_url: null,
};

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
        .nonnegative({ message: "Ingrese un número positivo" })
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

const route = useRoute();
const queryClient = useQueryClient();
const productServices = useProductServices();
const createProductMutation = useMutation({
  mutationFn: async (formValues: CreateProduct) => {
    const { error } = await productServices.createProduct(
      route.params.orgId.toString(),
      formValues
    );
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    openModel.value = false;
    analytics.event("create-product", formValues);
  },
});
const currencyFormatter = useCurrencyFormatter();
const formInstance = useForm<CreateProduct>({
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

  createProductMutation.mutate(modifiedFormValues);
});

watch(openModel, (nextOpenValue) => {
  if (!nextOpenValue) return;
  formInstance.resetForm({ values: initialForm }, { force: true });
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Crear producto </SheetTitle>
        <SheetDescription>
          Crea rápidamente un nuevo producto para tu inventario.
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
        <SharedProductFormValues />

        <SheetFooter class="flex flex-row gap-2">
          <Button
            :disabled="createProductMutation.isPending.value"
            @click="openModel = false"
            variant="outline"
            type="button"
            class="w-full"
            >Cancelar</Button
          >
          <Button
            :disabled="createProductMutation.isPending.value"
            type="submit"
            class="w-full"
            >Guardar</Button
          >
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
