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
  Customer,
  TRUST_STATUS,
  UpdateCustomer,
  useCustomerServices,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { analytics } from "@/config/analytics";
import { notifyIfHasError } from "@/features/global";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import SharedCustomerFormValues from "./SharedCustomerFormValues.vue";

type Props = {
  customer?: Customer | null;
};

const openModel = defineModel<boolean>("open");
const props = withDefaults(defineProps<Props>(), {
  customer: null,
});

const initialForm: UpdateCustomer = {
  customer_id: "",
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
const updateCustomerMutation = useMutation({
  mutationFn: async (formValues: UpdateCustomer) => {
    const customerId = formValues.customer_id;
    if (!customerId) throw new Error("Customer id required to perform update");
    const { error } = await customerServices.updateCustomer(
      route.params.orgId.toString(),
      formValues
    );
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["customers"] });
    openModel.value = false;
    analytics.event("update-customer", formValues);
  },
});
const formInstance = useForm<UpdateCustomer>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  updateCustomerMutation.mutate(formValues);
});

watch(openModel, (nextOpenValue) => {
  if (nextOpenValue && props.customer) {
    formInstance.resetForm({
      values: {
        name: props.customer.name ?? "",
        phone: props.customer.phone ?? "",
        email: props.customer.email ?? "",
        address: props.customer.address ?? "",
        map_url: props.customer.map_url ?? "",
        customer_id: props.customer.id,
        trust_status: props.customer.trust_status ?? "trusted",
        notes: props.customer.notes ?? "",
      },
    });
  }
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle>Actualizar cliente</SheetTitle>
        <SheetDescription
          >Actualiza rápidamente un cliente de tu inventario.</SheetDescription
        >
      </SheetHeader>
      <div class="space-y-6 pb-16">
        <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
          <SharedCustomerFormValues />

          <SheetFooter class="gap-4 sm:gap-0">
            <Button
              :disabled="updateCustomerMutation.isPending.value"
              type="submit"
              class="w-full"
              >Guardar</Button
            >
            <Button
              type="button"
              :disabled="updateCustomerMutation.isPending.value"
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
