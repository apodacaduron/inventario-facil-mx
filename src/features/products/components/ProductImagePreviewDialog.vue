<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  Avatar,
  AvatarImage,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui";
import { computed, toRef } from "vue";
import { createReusableTemplate } from "@vueuse/core";
import { useLayerManager } from "@/features/global";
import { Tables } from "../../../../types_db";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const [ModalBodyTemplate, ModalBody] = createReusableTemplate();
const product = computed(
  () =>
    props.layerManager.currentLayer.value?.state
      ?.product as Tables<"i_products">
);
const imageUrl = toRef(() => product.value?.image_url);
</script>

<template>
  <ModalBodyTemplate>
    <div class="text-center m-2 flex justify-between items-center">
      <Avatar class="rounded-md h-auto max-w-full w-full aspect-square">
        <AvatarImage :src="imageUrl ?? 'unknown'" class="object-cover" />
      </Avatar>
    </div>
  </ModalBodyTemplate>

  <Dialog v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ product?.name }}</DialogTitle>
        <DialogDescription
          >Esta es la imagen principal de tu producto</DialogDescription
        >
      </DialogHeader>
      <ModalBody />
    </DialogContent>
  </Dialog>
</template>
