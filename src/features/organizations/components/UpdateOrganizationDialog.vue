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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { createReusableTemplate, useMediaQuery } from "@vueuse/core";
import { UserOrganization } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { z } from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { UpdateOrganization, useOrganizationServices } from "../composables";
import { useForm } from "vee-validate";

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
  });
});
</script>

<template>
  <ModalBodyTemplate>
    <div>
      <div class="space-y-4 py-2 pb-4">
        <div class="space-y-2">
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
        </div>
      </div>
    </div>
  </ModalBodyTemplate>

  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Actualiza el nombre de tu organización</DialogTitle>
        <DialogDescription> Escribe el nuevo nombre. </DialogDescription>
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
          <DrawerTitle>Actualiza el nombre de tu organización</DrawerTitle>
          <DrawerDescription> Escribe el nuevo nombre. </DrawerDescription>
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
