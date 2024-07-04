<script setup lang="ts">
import { ref, watchEffect } from "vue";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Switch,
} from "@/components/ui";
import { createReusableTemplate, useMediaQuery } from "@vueuse/core";
import { UserOrganization } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { UpdateOrganization, useOrganizationServices } from "../composables";
import { useForm } from "vee-validate";
import { PercentIcon } from "lucide-vue-next";

type Props = {
  userOrganization: UserOrganization | undefined;
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
      .min(0)
      .max(5),
    is_cashback_enabled: z.boolean(),
  })
);

const [ModalBodyTemplate, ModalBody] = createReusableTemplate();
const queryClient = useQueryClient();
const organizationServices = useOrganizationServices();
const isDesktop = useMediaQuery("(min-width: 768px)");
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
  });
});
</script>

<template>
  <ModalBodyTemplate>
    <div>
      <div class="space-y-4 py-2 pb-8">
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
          <FormItem v-auto-animate>
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
      </div>
    </div>
  </ModalBodyTemplate>

  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Actualiza tu organización</DialogTitle>
        <DialogDescription>
          Ajusta tu organización acorde a tus preferencias.
        </DialogDescription>
      </DialogHeader>

      <form @submit="onSubmit">
        <ModalBody />

        <DialogFooter>
          <Button variant="outline" @click="openModel = false">
            Cancelar
          </Button>
          <Button
            :disabled="updateOrganizationMutation.isPending.value"
            type="submit"
          >
            Actualizar
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>Actualiza tu organización</DrawerTitle>
          <DrawerDescription>
            Ajusta tu organización acorde a tus preferencias.
          </DrawerDescription>
        </DrawerHeader>

        <form @submit="onSubmit">
          <ModalBody />

          <DrawerFooter>
            <Button variant="outline" @click="openModel = false">
              Cancelar
            </Button>
            <Button
              :disabled="updateOrganizationMutation.isPending.value"
              type="submit"
            >
              Actualizar
            </Button>
          </DrawerFooter>
        </form>
      </div>
    </DrawerContent>
  </Drawer>
</template>
