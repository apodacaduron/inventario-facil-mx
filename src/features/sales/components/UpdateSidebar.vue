<script setup lang="ts">
import {
  Sheet,
  Button,
  Select,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  FormControl,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  FormMessage,
  FormItem,
  FormField,
  FormLabel,
} from "@/components/ui";
import { watch } from "vue";
import { z } from "zod";
import { SALE_STATUS, Sale, UpdateSale } from "../composables";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";

type UpdateSidebarProps = {
  open: boolean;
  isLoading?: boolean;
  sale?: Sale | null;
};

const props = withDefaults(defineProps<UpdateSidebarProps>(), {
  open: false,
  isLoading: false,
});
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formValues: UpdateSale): void;
}>();

const locale = {
  update: {
    title: "Actualizar venta",
    subtitle: "Actualiza rápidamente una venta de tu inventario.",
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

const initialForm: UpdateSale = {
  sale_id: props.sale?.id ?? "",
  status: "in_progress",
};

const formSchema = toTypedSchema(
  z.object({
    sale_id: z.string().uuid(),
    status: z.enum(SALE_STATUS),
  })
);

const formInstance = useForm<UpdateSale>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  emit("save", formValues);
});

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
  () => {
    formInstance.resetForm({
      values: {
        sale_id: props.sale?.id ?? "",
        status: "in_progress",
      },
    });
  }
);
</script>

<template>
  <Sheet :open="open" @update:open="closeSidebar">
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>
          {{ locale.update.title }}
        </SheetTitle>
        <SheetDescription>
          {{ locale.update.subtitle }}
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
        <FormField v-slot="{ componentField }" name="status">
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
                    >{{ status.text }}</SelectItem
                  >
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

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
