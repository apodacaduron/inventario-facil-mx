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
import { ref, watch } from "vue";
import { z } from "zod";
import { CreateSale, SALE_STATUS, Sale, UpdateSale } from "../composables";

type CreateOrEditSidebarProps = {
  mode?: "create" | "update";
  open?: boolean;
  isLoading?: boolean;
  sale?: Sale | null;
};

const props = withDefaults(defineProps<CreateOrEditSidebarProps>(), {
  mode: "create",
  open: false,
  isLoading: false,
});
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formValues: CreateSale | UpdateSale): void;
}>();

const locale = {
  create: {
    title: "Crear venta",
    subtitle: "Crea rápidamente una nueva venta para tu inventario.",
  },
  update: {
    title: "Actualizar venta",
    subtitle: "Actualiza rápidamente una venta de tu inventario.",
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

const test = ref("");
const initialForm: CreateSale | UpdateSale = {
  status: "pending",
  sale_date: "",
  products: [],
  customer_id: "",
};
const formInstance = useForm<CreateSale | UpdateSale>({
  initialValues: initialForm,
  validate: zodResolver(
    z.object({
      sale_id: z.string().uuid().optional(),
      status: z.enum(SALE_STATUS),
      sale_date: z.coerce.date(),
      customer_id: z.string().uuid(),
      products: z.array(
        z.object({
          sale_detail_id: z.string().uuid().optional(),
          product_id: z.string().uuid(),
          price: z.number().positive().finite().safe(),
          qty: z.number().int().positive().finite().safe(),
        })
      ),
    })
  ),
  async onSubmit(formValues) {
    console.log(formValues);
    emit("save", formValues);
  },
});
const { value: status, attrs: statusAttrs } = formInstance.register("status");
// const { value: saleDate, attrs: saleDateAttrs } =
//   formInstance.register("sale_date");

function closeSidebar(isOpen: boolean) {
  if (isOpen) return;
  formInstance.resetForm();
  emit("close");
}

const fetchOptions = (query?: string, nextPage?: number) => {
  const url = `https://www.omdbapi.com/?apikey=dac6304b&s=${query}&page=${
    nextPage || 1
  }`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return {
        results: data.Search as Record<string, any>[],
        hasMorePages:
          data.Search &&
          data.totalResults > data.Search.length * (nextPage || 1) * 10,
      };
    });
};

watch(
  () => props.open,
  (nextIsOpen) => {
    if (nextIsOpen) return;
    formInstance.resetForm({
      values: initialForm,
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
        <InputGroup label="Status de venta" name="status">
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
        <InputGroup label="Status de venta" name="status">
          {{ test }}
          {{ formInstance.values }}
          <RichSelect
            v-model="test"
            feedback="Type a movie name to search"
            placeholder="Ex: Search for the Matrix or Pokemon"
            :fetch-options="fetchOptions"
            :minimum-input-length="3"
            value-attribute="imdbID"
            text-attribute="Title"
            multiple
          >
            <template
              #option="{ option: { raw: movie }, className, isSelected }"
            >
              <div class="px-3 py-2" :class="className">
                <div class="relative">
                  <div
                    :class="[isSelected ? 'font-medium' : 'font-normal']"
                    class="flex items-center space-x-2 text-sm block"
                  >
                    <div
                      class="flex-shrink-0 w-10 h-10 bg-gray-500 bg-center bg-cover rounded-lg"
                      :style="{ backgroundImage: `url(${movie?.Poster})` }"
                    />
                    <span
                      class="block whitespace-nowrap truncate"
                      v-html="`${movie?.imdbID} - ${movie?.Title}`"
                    />
                  </div>
                </div>
                <div
                  v-if="movie?.Year"
                  class="w-100 text-xs text-left mt-1"
                  :class="[
                    isSelected ? 'font-normal opacity-60' : 'opacity-60',
                  ]"
                  v-html="
                    `This movie was released in the year of ${movie?.Year}`
                  "
                />
              </div>
            </template>
          </RichSelect>
        </InputGroup>
        <InputGroup>
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
