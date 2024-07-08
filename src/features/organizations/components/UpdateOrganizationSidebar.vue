<script setup lang="ts">
import { watchEffect } from "vue";

import {
  Button,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from "@/components/ui";
import { createReusableTemplate } from "@vueuse/core";
import { UserOrganization } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { UpdateOrganization, useOrganizationServices } from "../composables";
import { useForm } from "vee-validate";
import { PercentIcon } from "lucide-vue-next";

type Props = {
  userOrganization: UserOrganization | null | undefined;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const initialForm: UpdateOrganization = {
  name: "",
};
const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Nombre de organización es requerido"),
    cashback_percent: z.coerce
      .number({ invalid_type_error: "Ingresa un número válido" })
      .positive({ message: "Ingrese un número positivo" })
      .finite()
      .safe()
      .min(0.0000000001)
      .max(5),
    is_cashback_enabled: z.boolean(),
    is_low_stock_alert_enabled: z.boolean(),
    low_stock_threshold: z.coerce
      .number({ invalid_type_error: "Ingresa un número válido" })
      .nonnegative({ message: "Ingrese un número positivo" })
      .finite()
      .safe(),
  })
);

const [ModalBodyTemplate, ModalBody] = createReusableTemplate();
const queryClient = useQueryClient();
const organizationServices = useOrganizationServices();
const updateOrganizationMutation = useMutation({
  mutationFn: async (formValues: UpdateOrganization) => {
    if (!props.userOrganization?.org_id)
      throw new Error("Cannot update since organization id was not provided");

    await organizationServices.updateOrganization({
      organizationId: props.userOrganization?.org_id,
      values: formValues,
    });

    await queryClient.invalidateQueries({ queryKey: ["organization"] });

    openModel.value = false;
  },
});

const formInstance = useForm<UpdateOrganization>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  updateOrganizationMutation.mutate(formValues);
});

watchEffect(() => {
  if (!openModel.value) return;
  formInstance.setValues({
    name: props.userOrganization?.i_organizations?.name ?? "",
    cashback_percent:
      props.userOrganization?.i_organizations?.cashback_percent ?? 1,
    is_cashback_enabled: Boolean(
      props.userOrganization?.i_organizations?.is_cashback_enabled
    ),
    low_stock_threshold:
      props.userOrganization?.i_organizations?.low_stock_threshold ?? 0,
    is_low_stock_alert_enabled: Boolean(
      props.userOrganization?.i_organizations?.is_low_stock_alert_enabled
    ),
  });
});
</script>

<template>
  <ModalBodyTemplate>
    <div>
      <div class="space-y-4 pt-2 pb-8">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormLabel>Nombre de organización</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Acme Inc."
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <template
          v-if="userOrganization?.i_organizations?.plans?.name === 'premium'"
        >
          <Separator class="my-6" />
          <FormField
            v-slot="{ value, handleChange }"
            name="is_cashback_enabled"
          >
            <FormItem class="flex flex-row items-center justify-between">
              <div class="space-y-0.5">
                <FormLabel class="text-base">
                  Habilitar monedero electrónico
                </FormLabel>
                <FormDescription>
                  Tus clientes acumulan un porcentaje por cada compra.
                </FormDescription>
              </div>
              <FormControl>
                <Switch :checked="value" @update:checked="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="cashback_percent">
            <FormItem
              v-if="formInstance.values.is_cashback_enabled"
              v-auto-animate
            >
              <FormLabel>Porcentaje por compra</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input
                    type="text"
                    placeholder="Ingresa un porcentaje"
                    class="pr-10"
                    v-bind="componentField"
                  />
                  <span
                    class="absolute end-0 inset-y-0 flex items-center justify-center px-2"
                  >
                    <PercentIcon class="size-4" />
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Separator class="my-6" />
          <FormField
            v-slot="{ value, handleChange }"
            name="is_low_stock_alert_enabled"
          >
            <FormItem class="flex flex-row items-center justify-between">
              <div class="space-y-0.5">
                <FormLabel class="text-base">
                  Habilitar alertas de stock bajo
                </FormLabel>
                <FormDescription>
                  Activa esta opción para recibir alertas cuando el stock de
                  este producto esté por debajo del límite especificado.
                </FormDescription>
              </div>
              <FormControl>
                <Switch :checked="value" @update:checked="handleChange" />
              </FormControl>
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField }" name="low_stock_threshold">
            <FormItem
              v-if="formInstance.values.is_low_stock_alert_enabled"
              v-auto-animate
            >
              <div class="space-y-0.5">
                <FormLabel class="text-base"> Límite de stock bajo </FormLabel>
                <FormDescription>
                  Especifica la cantidad mínima de este producto antes de que se
                  dispare una alerta de stock bajo.
                </FormDescription>
              </div>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Ingresa un porcentaje"
                  class="pr-10"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </template>
      </div>
    </div>
  </ModalBodyTemplate>

  <Sheet v-model:open="openModel">
    <SheetContent class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle>Actualiza tu organización</SheetTitle>
        <SheetDescription>
          Ajusta tu organización acorde a tus preferencias.
        </SheetDescription>
      </SheetHeader>

      <form @submit="onSubmit">
        <ModalBody />

        <SheetFooter class="flex flex-row gap-2">
          <Button variant="outline" @click="openModel = false" class="w-full">
            Cancelar
          </Button>
          <Button
            :disabled="updateOrganizationMutation.isPending.value"
            type="submit"
            class="w-full"
          >
            Actualizar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
