<script setup lang="ts">
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  Input,
  Label,
} from "@/components/ui";
import { UserOrganization } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useMediaQuery } from "@vueuse/core";
import { useOrganizationServices } from "../composables";
import { ref } from "vue";
import { notifyIfHasError } from "@/features/global";

type DeleteUserOrganizationDialogProps = {
  userOrganization: UserOrganization | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<DeleteUserOrganizationDialogProps>();

const organizationName = ref("");

const queryClient = useQueryClient();
const organizationServices = useOrganizationServices();
const isDesktop = useMediaQuery("(min-width: 768px)");
const deleteUserOrganizationMutation = useMutation({
  mutationFn: async () => {
    if (!props.userOrganization?.org_id)
      throw new Error("Cannot delete since organization id was not provided");
    const { error } = await organizationServices.deleteOrganization(
      props.userOrganization?.org_id
    );
    notifyIfHasError(error);
    await queryClient.invalidateQueries({ queryKey: ["organization"] });
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    openModel.value = false;
  },
});
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle
          >Eliminar {{ userOrganization?.i_organizations?.name }}</DialogTitle
        >
        <DialogDescription>
          Esta acción eliminará permanentemente a esta organización y toda la
          información relacionada a ella. ¿Estás seguro de que deseas proceder
          con la eliminación?
        </DialogDescription>
      </DialogHeader>

      <Label class="leading-normal mb-2 block"
        >Escribe el nombre de tu organización para poder eliminar:
        <b>{{ userOrganization?.i_organizations?.name }}</b></Label
      >
      <Input
        v-model="organizationName"
        placeholder="Los nombres deben coincidir"
      />

      <DialogFooter>
        <Button
          :disabled="
            deleteUserOrganizationMutation.isPending.value ||
            organizationName !== userOrganization?.i_organizations?.name
          "
          type="button"
          variant="destructive"
          @click="deleteUserOrganizationMutation.mutate"
        >
          Si, eliminar
        </Button>
        <Button
          :disabled="deleteUserOrganizationMutation.isPending.value"
          type="button"
          variant="secondary"
          @click="openModel = false"
        >
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle
            >Eliminar {{ userOrganization?.i_organizations?.name }}</DrawerTitle
          >
          <DrawerDescription>
            Esta acción eliminará permanentemente a esta organización y toda la
            información relacionada a ella. ¿Estás seguro de que deseas proceder
            con la eliminación?
          </DrawerDescription>
        </DrawerHeader>

        <Label class="leading-normal mb-2 block"
          >Escribe el nombre de tu organización para poder eliminar:
          <b>{{ userOrganization?.i_organizations?.name }}</b></Label
        >
        <Input
          v-model="organizationName"
          placeholder="Los nombres deben coincidir"
        />

        <DrawerFooter>
          <Button
            :disabled="
              deleteUserOrganizationMutation.isPending.value ||
              organizationName !== userOrganization?.i_organizations?.name
            "
            type="button"
            variant="destructive"
            @click="deleteUserOrganizationMutation.mutate"
          >
            Si, eliminar
          </Button>
          <Button
            :disabled="deleteUserOrganizationMutation.isPending.value"
            type="button"
            variant="secondary"
            @click="openModel = false"
          >
            Cancelar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
