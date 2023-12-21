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
import { CreateCustomer, Customer, UpdateCustomer } from "../composables";

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

const initialForm = {
  name: "",
  phone: "",
  email: "",
};

const formInstance = useForm<CreateCustomer | UpdateCustomer>({
  initialValues: initialForm,
  validate: zodResolver(
    z.object({
      name: z.string().min(1, "Nombre de cliente es requerido"),
      phone: z.string().length(10, "Telefono es requerido"),
      email: z.string().email("Debe ser un correo valido").or(z.literal("")),
    })
  ),
  async onSubmit(formValues) {
    emit("save", formValues);
  },
});
const { value: name, attrs: nameAttrs } = formInstance.register("name");
const { value: phone, attrs: phoneAttrs } = formInstance.register("phone");
const { value: email, attrs: emailAttrs } = formInstance.register("email");

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
  () => props.customer,
  (nextCustomer) => {
    if (!nextCustomer) return;
    formInstance.resetForm({
      values: {
        name: nextCustomer.name,
        phone: nextCustomer.phone,
        email: nextCustomer.email,
        customer_id: nextCustomer.id,
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
        <InputGroup label="Nombre de cliente" name="name">
          <Input
            placeholder="Ingresa el nombre de cliente"
            v-model="name"
            :errors="formInstance.errors.value.name"
            v-bind="nameAttrs"
          />
        </InputGroup>
        <InputGroup label="Teléfono de cliente" name="phone">
          <Input
            placeholder="Ingresa el telefono del cliente"
            v-model="phone"
            :errors="formInstance.errors.value.phone"
            v-bind="phoneAttrs"
          />
        </InputGroup>
        <InputGroup label="Correo de cliente" name="email">
          <Input
            placeholder="Ingresa el correo del cliente"
            v-model="email"
            :errors="formInstance.errors.value.email"
            v-bind="emailAttrs"
          />
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
