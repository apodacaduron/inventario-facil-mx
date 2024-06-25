<script setup lang="ts">
import {
  Sheet,
  Button,
  SheetFooter,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui";
import { watch } from "vue";
import { z } from "zod";
import {
  CreateCustomer,
  Customer,
  TRUST_STATUS,
  useCustomerServices,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { notifyIfHasError } from "@/features/global";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { analytics } from "@/config/analytics";
import SharedCustomerFormValues from "./SharedCustomerFormValues.vue";

const openModel = defineModel<boolean>("open");
const emits = defineEmits<{
  (e: "createCustomer", customer: Customer | null): void;
}>();

const initialForm: CreateCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  map_url: "",
  trust_status: "trusted",
  notes: "",
};
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Nombre de cliente es requerido"),
    phone: z.coerce
      .string()
      .length(10, "Teléfono debe tener 10 dígitos")
      .or(z.literal("")),
    email: z.string().email("Debe ser un correo valido").or(z.literal("")),
    address: z.string().or(z.literal("")),
    map_url: z.string().url("Debe ser un url valido").or(z.literal("")),
    notes: z.string().or(z.literal("")),
    trust_status: z.enum(TRUST_STATUS),
    customer_id: z.string().uuid().optional(),
  })
);

const route = useRoute();
const queryClient = useQueryClient();
const customerServices = useCustomerServices();
const createCustomerMutation = useMutation({
  mutationFn: async (formValues: CreateCustomer) => {
    const { data, error } = await customerServices.createCustomer(
      route.params.orgId.toString(),
      formValues
    );
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["customers"] });
    emits("createCustomer", data);
    openModel.value = false;
    analytics.event("create-customer", formValues);
  },
});
const formInstance = useForm<CreateCustomer>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  createCustomerMutation.mutate(formValues);
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
        <SheetTitle>Crear cliente</SheetTitle>
        <SheetDescription
          >Crea rápidamente un nuevo cliente para tu
          inventario.</SheetDescription
        >
      </SheetHeader>
      <div class="space-y-6 pb-16">
        <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
          <SharedCustomerFormValues />

          <SheetFooter class="gap-4 sm:gap-0">
            <Button
              :disabled="createCustomerMutation.isPending.value"
              type="submit"
              class="w-full"
              >Guardar</Button
            >
            <Button
              type="button"
              :disabled="createCustomerMutation.isPending.value"
              @click="openModel = false"
              variant="outline"
              >Cancelar</Button
            >
          </SheetFooter>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</template>
