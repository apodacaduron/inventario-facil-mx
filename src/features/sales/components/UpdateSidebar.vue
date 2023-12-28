<script setup lang="ts">
import {
  Slideover,
  Button,
  InputGroup,
  RichSelect,
  RichSelectOptionIndicator,
} from "@flavorly/vanilla-components";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import { watch } from "vue";
import { z } from "zod";
import { SALE_STATUS, Sale, UpdateSale } from "../composables";

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
const formInstance = useForm<UpdateSale>({
  initialValues: initialForm,
  validate: zodResolver(
    z.object({
      sale_id: z.string().uuid(),
      status: z.enum(SALE_STATUS),
    })
  ),
  async onSubmit(formValues) {
    emit("save", formValues);
  },
});

const { value: status, attrs: statusAttrs } = formInstance.register("status");

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
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
  <Slideover
    :modelValue="open"
    @update:modelValue="closeSidebar"
    position="right"
    :title="locale.update.title"
    :subtitle="locale.update.subtitle"
  >
    {{ formInstance.errors }}
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
