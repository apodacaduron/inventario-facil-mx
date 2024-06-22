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
  Input,
  Label,
} from "@/components/ui";
import { useMediaQuery } from "@vueuse/core";
import { UserOrganization } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/config/supabase";

type UpdateUserOrganizationDialogProps = {
  userOrganization: UserOrganization | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<UpdateUserOrganizationDialogProps>();

const organizationName = ref(props.userOrganization?.i_organizations?.name ?? '');

const queryClient = useQueryClient();
const isDesktop = useMediaQuery("(min-width: 768px)");
const updateOrganizationMutation = useMutation({
  mutationFn: async () => {
    if (!props.userOrganization?.org_id) throw new Error('Cannot update since organization id was not provided')

    await supabase
      .from("i_organizations")
      .update({
        name: organizationName.value,
      })
      .eq('id', props.userOrganization?.org_id);

    await queryClient.invalidateQueries({ queryKey: ["organization"] });

    openModel.value = false;
  },
});

watchEffect(() => {
  if (openModel.value) {
    organizationName.value = props.userOrganization?.i_organizations?.name ?? ''
  } else {
    organizationName.value = "";
  };
});
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Actualiza el nombre de tu organizacion</DialogTitle>
        <DialogDescription>
          Escribe el nuevo nombre.
        </DialogDescription>
      </DialogHeader>
      <div>
        <div class="space-y-4 py-2 pb-4">
          <div class="space-y-2">
            <Label for="name">Nombre de organizacion</Label>
            <Input
              v-model="organizationName"
              id="name"
              placeholder="Acme Inc."
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="openModel = false">
          Cancelar
        </Button>
        <Button
          :disabled="updateOrganizationMutation.isPending.value"
          type="submit"
          @click="updateOrganizationMutation.mutate"
        >
          Actualizar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>Actualiza el nombre de tu organizacion</DrawerTitle>
          <DrawerDescription>
            Escribe el nuevo nombre.
          </DrawerDescription>
        </DrawerHeader>
        <div>
          <div class="space-y-4 py-2 pb-4 px-4">
            <div class="space-y-2">
              <Label for="name">Nombre de organizacion</Label>
              <Input
                v-model="organizationName"
                id="name"
                placeholder="Acme Inc."
              />
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button variant="outline" @click="openModel = false">
            Cancelar
          </Button>
          <Button
            :disabled="updateOrganizationMutation.isPending.value"
            type="submit"
            @click="updateOrganizationMutation.mutate"
          >
            Actualizar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
