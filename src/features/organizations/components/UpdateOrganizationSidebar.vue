<script setup lang="ts">
import { ref, watchEffect } from "vue";

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
import { CheckIcon, PercentIcon } from "lucide-vue-next";

type Props = {
  userOrganization: UserOrganization | null | undefined;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const primaryColors = [
  // Cool Colors
  "197 71% 73%", // Sky Blue
  "180 62% 50%", // Teal
  "174 62% 56%", // Turquoise
  "235 89% 41%", // Indigo
  "259 67% 85%", // Lavender
  "282 64% 58%", // Violet

  // Neutral Colors
  "219 44% 27%", // Navy
  "6 93% 71%", // Salmon

  // Warm Colors
  "16 68% 60%", // Coral
  "328 76% 52%", // Deep Pink
  "348 83% 47%", // Crimson
  "350 80% 70%", // Rose

  // Yellowish Colors
  "74 70% 55%", // Lime Green
  "45 89% 60%", // Gold
  "79 61% 43%", // Olive
  "42 100% 50%", // Amber
];
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

const themeColor = ref(
  props.userOrganization?.i_organizations?.theme_color ?? null
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
      values: {
        ...formValues,
        theme_color: themeColor.value,
      },
    });

    if (themeColor.value === null && props.userOrganization.i_organizations?.theme_color) {
      window.location.reload()
    }

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

  if (openModel.value) {
    themeColor.value =
      props.userOrganization?.i_organizations?.theme_color ?? null;
  } else {
    themeColor.value = null;
  }

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
              <Input type="text" placeholder="Acme Inc." v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <template v-if="userOrganization?.i_organizations?.plans?.name === 'premium'">
          <Separator class="my-6" />
          <FormField v-slot="{ value, handleChange }" name="is_cashback_enabled">
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
            <FormItem v-if="formInstance.values.is_cashback_enabled" v-auto-animate>
              <FormLabel>Porcentaje por compra</FormLabel>
              <FormControl>
                <div class="relative w-full items-center">
                  <Input type="text" placeholder="Ingresa un porcentaje" class="pr-10" v-bind="componentField" />
                  <span class="absolute end-0 inset-y-0 flex items-center justify-center px-2">
                    <PercentIcon class="size-4" />
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Separator class="my-6" />
          <FormField v-slot="{ value, handleChange }" name="is_low_stock_alert_enabled">
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
            <FormItem v-if="formInstance.values.is_low_stock_alert_enabled" v-auto-animate>
              <div class="space-y-0.5">
                <FormLabel class="text-base"> Límite de stock bajo </FormLabel>
                <FormDescription>
                  Especifica la cantidad mínima de este producto antes de que se
                  dispare una alerta de stock bajo.
                </FormDescription>
              </div>
              <FormControl>
                <Input type="text" placeholder="Ingresa un porcentaje" class="pr-10" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Separator class="my-6" />
          <h4 class="text-base">Límite de stock bajo</h4>
          <p class="text-[0.8rem] text-muted-foreground">
            Especifica la cantidad mínima de este producto antes de que se dispare
            una alerta de stock bajo.
          </p>
          <div class="space-y-2 py-2 pb-4">
            <div class="space-y-1">
              <Button type="button" :key="index" v-for="(color, index) in primaryColors" variant="ghost" class="px-2"
                @click="themeColor = color">
                <CheckIcon v-if="color === themeColor" class="size-4 absolute" />
                <div class="size-6 rounded-full" :style="{ backgroundColor: `hsl(${color})` }" />
              </Button>
              <Button variant="ghost" type="button" @click="themeColor = null">
                Reiniciar tema
              </Button>
            </div>
          </div>
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
          <Button :disabled="updateOrganizationMutation.isPending.value" type="submit" class="w-full">
            Actualizar
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
