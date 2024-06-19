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
} from "@/components/ui";
import { Customer, useCustomerServices } from "../composables";
import { useMediaQuery } from "@vueuse/core";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { analytics } from "@/config/analytics";
import { notifyIfHasError } from "@/features/global";

type DeleteCustomerDialogProps = {
  customer: Customer | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<DeleteCustomerDialogProps>();

const isDesktop = useMediaQuery("(min-width: 768px)");
const queryClient = useQueryClient();
const customerServices = useCustomerServices();
const deleteCustomerMutation = useMutation({
  mutationFn: async () => {
  const customerId = props.customer?.id;
  if (!customerId) throw new Error("Customer id required to perform delete");
  const { error } = await customerServices.deleteCustomer(customerId);
  notifyIfHasError(error);
  openModel.value = false;
  await queryClient.invalidateQueries({ queryKey: ["customers"] });
  analytics.event("delete-customer", props.customer);
  },
});
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar {{ customer?.name }}</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente a este cliente. ¿Estás seguro de
          que deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          :disabled="deleteCustomerMutation.isPending.value"
          type="button"
          variant="destructive"
          @click="deleteCustomerMutation.mutate"
        >
          Si, eliminar
        </Button>
        <Button
          :disabled="deleteCustomerMutation.isPending.value"
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
          <DrawerTitle>Eliminar {{ customer?.name }}</DrawerTitle>
          <DrawerDescription>
            Esta acción eliminará permanentemente a este cliente. ¿Estás seguro
            de que deseas proceder con la eliminación?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            :disabled="deleteCustomerMutation.isPending.value"
            type="button"
            variant="destructive"
            @click="deleteCustomerMutation.mutate"
          >
            Si, eliminar
          </Button>
          <Button
            :disabled="deleteCustomerMutation.isPending.value"
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
