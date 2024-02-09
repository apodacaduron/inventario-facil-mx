<script setup lang="ts">
import {
  Sheet,
  Button,
  Input,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  Textarea,
  SheetFooter,
} from "@/components/ui";
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
  current_stock: null,
  unit_price: null,
  retail_price: null,
};

const currencyFormatter = useCurrencyFormatter();

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Nombre de producto es requerido"),
    description: z.string().optional(),
    image_url: z.string().optional(),
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
    product_id: z.string().uuid().optional(),
  })
);

const formInstance = useForm<CreateProduct | UpdateProduct>({
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  if (typeof formValues.product_id === "undefined") {
    delete formValues.product_id;
  }

  const nextUnitPrice = currencyFormatter.toCents(formValues?.unit_price ?? 0);
  const nextRetailPrice = currencyFormatter.toCents(
    formValues?.retail_price ?? 0
  );

  const modifiedFormValues = {
    ...formValues,
    unit_price: nextUnitPrice,
    retail_price: nextRetailPrice,
  };

  emit("save", modifiedFormValues);
});

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
  forceCloseSidebar();
}
function forceCloseSidebar() {
  formInstance.resetForm();
  emit("close");
}

watch([() => props.open, () => props.product], ([nextIsOpen, nextProduct]) => {
  if (!nextIsOpen) return;
  if (!nextProduct) {
    formInstance.resetForm({ values: initialForm }, { force: true });
  }
  if (nextProduct) {
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
});
</script>

<template>
  <Sheet :open="open" @update:open="closeSidebar">
    <SheetContent side="right" class="overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          {{ locale[mode].title }}
        </SheetTitle>
        <SheetDescription>
          {{ locale[mode].subtitle }}
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
        <FormField v-slot="{ componentField }" name="image_url">
          <FormItem v-auto-animate>
            <FormLabel>Imagen de producto</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="URL de la imagen de tu producto"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormLabel>Nombre de producto</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Ingresa el nombre de producto"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="description">
          <FormItem v-auto-animate>
            <FormLabel>Descripción de producto</FormLabel>
            <FormControl>
              <Textarea
                type="text"
                placeholder="Ingresa la descripción de producto"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="current_stock">
          <FormItem v-auto-animate>
            <FormLabel>Unidades disponibles</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ingresa las unidades disponibles de producto"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="unit_price">
          <FormItem v-auto-animate>
            <FormLabel>Precio unitario</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ingresa el costo unitario de producto"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="retail_price">
          <FormItem v-auto-animate>
            <FormLabel>Precio de venta</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ingresa el precio de venta del producto"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <SheetFooter class="gap-4 sm:gap-0">
          <Button :disabled="isLoading" type="submit" class="w-full"
            >Guardar</Button
          >
          <Button
            :disabled="isLoading"
            @click="forceCloseSidebar"
            variant="outline"
            type="button"
            >Cancelar</Button
          >
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
