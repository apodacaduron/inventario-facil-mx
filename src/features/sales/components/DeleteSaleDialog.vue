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
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui";
import { Sale, useSaleServices } from "../composables";
import { useMediaQuery } from "@vueuse/core";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { analytics } from "@/config/analytics";

type DeleteSaleDialogProps = {
  sale: Sale | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<DeleteSaleDialogProps>();

const queryClient = useQueryClient();
const saleServices = useSaleServices();
const isDesktop = useMediaQuery("(min-width: 768px)");
const deleteSaleMutation = useMutation({ mutationFn: async () => {
  const saleId = props.sale?.id;
  if (!saleId) throw new Error('Sale id required to perform delete');
  await saleServices.deleteSale(saleId);
  openModel.value = false;
  await queryClient.invalidateQueries({ queryKey: ['sales'] });
  await queryClient.invalidateQueries({ queryKey: ['products'] });
  analytics.event('delete-sale', props.sale);
} });
</script>

<template>
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Eliminar venta {{ sale?.id }}</DialogTitle>
        <DialogDescription>
          Esta acción eliminará permanentemente esta venta. ¿Estás seguro de que
          deseas proceder con la eliminación?
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button
          :disabled="deleteSaleMutation.isPending.value"
          type="button"
          variant="destructive"
          @click="deleteSaleMutation.mutate"
        >
          Si, eliminar
        </Button>
        <Button
          :disabled="deleteSaleMutation.isPending.value"
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
          <DrawerTitle>Eliminar venta {{ sale?.id }}</DrawerTitle>
          <DrawerDescription>
            Esta acción eliminará permanentemente esta venta. ¿Estás seguro de
            que deseas proceder con la eliminación?
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            :disabled="deleteSaleMutation.isPending.value"
            type="button"
            variant="destructive"
            @click="deleteSaleMutation.mutate"
          >
            Si, eliminar
          </Button>
          <Button
            :disabled="deleteSaleMutation.isPending.value"
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
