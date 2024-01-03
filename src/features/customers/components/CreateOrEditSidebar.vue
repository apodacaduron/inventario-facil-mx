<script setup lang="ts">
import {
  Slideover,
  Button,
  InputGroup,
  Input,
  Select,
} from "@flavorly/vanilla-components";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import { watch } from "vue";
import { z } from "zod";
import {
  CreateCustomer,
  Customer,
  TRUST_STATUS,
  UpdateCustomer,
} from "../composables";

type CreateOrEditSidebarProps = {
  mode?: "create" | "update";
  open?: boolean;
  isLoading?: boolean;
  customer?: Customer | null;
};

const props = withDefaults(defineProps<CreateOrEditSidebarProps>(), {
  mode: "create",
  open: false,
  isLoading: false,
});
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formValues: CreateCustomer | UpdateCustomer): void;
}>();

const locale = {
  create: {
    title: "Crear cliente",
    subtitle: "Crea rápidamente un nuevo cliente para tu inventario.",
  },
  update: {
    title: "Actualizar cliente",
    subtitle: "Actualiza rápidamente un cliente de tu inventario.",
  },
};

const initialForm: CreateCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  map_url: "",
  trust_status: "trusted",
  notes: "",
};

const formInstance = useForm<CreateCustomer | UpdateCustomer>({
  initialValues: initialForm,
  validate: zodResolver(
    z.object({
      name: z.string().min(1, "Nombre de cliente es requerido"),
      phone: z.coerce.string().length(10, "Telefono es requerido"),
      email: z.string().email("Debe ser un correo valido").or(z.literal("")),
      address: z.string().or(z.literal("")),
      map_url: z.string().url("Debe ser un url valido").or(z.literal("")),
      notes: z.string().or(z.literal("")),
      trust_status: z.enum(TRUST_STATUS),
    })
  ),
  async onSubmit(formValues) {
    emit("save", formValues);
  },
});
const { value: name, attrs: nameAttrs } = formInstance.register("name");
const { value: phone, attrs: phoneAttrs } = formInstance.register("phone");
const { value: email, attrs: emailAttrs } = formInstance.register("email");
const { value: address, attrs: addressAttrs } =
  formInstance.register("address");
const { value: mapUrl, attrs: mapUrlAttrs } = formInstance.register("map_url");
const { value: trustStatus, attrs: trustStatusAttrs } =
  formInstance.register("trust_status");
const { value: notes, attrs: notesAttrs } = formInstance.register("notes");

function closeSidebar(isOpen: boolean, forced: boolean) {
  if (isOpen && !forced) return;
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
    formInstance.resetForm({
      values: initialForm,
    });
  }
);
watch(
  () => props.customer,
  (nextCustomer) => {
    if (!nextCustomer) return;
    formInstance.resetForm({
      values: {
        name: nextCustomer.name ?? "",
        phone: nextCustomer.phone ?? "",
        email: nextCustomer.email ?? "",
        address: nextCustomer.address ?? "",
        map_url: nextCustomer.map_url ?? "",
        customer_id: nextCustomer.id,
        trust_status: nextCustomer.trust_status ?? "trusted",
        notes: nextCustomer.notes ?? "",
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
        <InputGroup label="Nombre de cliente" name="name" class="!px-0">
          <Input
            placeholder="Ingresa el nombre de cliente"
            v-model="name"
            :errors="formInstance.errors.value.name"
            v-bind="nameAttrs"
          />
        </InputGroup>
        <InputGroup label="Teléfono de cliente" name="phone" class="!px-0">
          <Input
            placeholder="Ingresa el telefono del cliente"
            v-model="phone"
            type="number"
            :errors="formInstance.errors.value.phone"
            v-bind="phoneAttrs"
          />
        </InputGroup>
        <InputGroup label="Correo de cliente" name="email" class="!px-0">
          <Input
            placeholder="Ingresa el correo del cliente"
            v-model="email"
            :errors="formInstance.errors.value.email"
            v-bind="emailAttrs"
          />
        </InputGroup>
        <InputGroup label="Dirección de cliente" name="address" class="!px-0">
          <Input
            placeholder="Ingresa la dirección del cliente"
            v-model="address"
            :errors="formInstance.errors.value.address"
            v-bind="addressAttrs"
          />
        </InputGroup>
        <InputGroup label="URL de mapa" name="map_url" class="!px-0">
          <Input
            placeholder="Ingresa la dirección del cliente"
            v-model="mapUrl"
            :errors="formInstance.errors.value.map_url"
            v-bind="mapUrlAttrs"
          />
        </InputGroup>
        <InputGroup label="Notas" name="notes" class="!px-0">
          <Input
            placeholder="Notas de cliente"
            v-model="notes"
            :errors="formInstance.errors.value.notes"
            v-bind="notesAttrs"
          />
        </InputGroup>
        <InputGroup
          label="Estado de confianza"
          name="trust_status"
          class="!px-0"
        >
          <Select
            v-model="trustStatus"
            placeholder="Escoge un estado de confiabilidad"
            :options="[
              { value: 'trusted', text: 'Confiable' },
              { value: 'not_trusted', text: 'No confiable' },
            ]"
            v-bind="trustStatusAttrs"
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
              type="button"
              :disabled="isLoading"
              label="Cancelar"
              @click="forceCloseSidebar"
            />
          </div>
        </InputGroup>
      </form>
    </div>
  </Slideover>
</template>
