<script setup lang="ts">
import { Dialog, DialogContent, Avatar, AvatarImage } from "@/components/ui";
import { toRef } from "vue";
import { createReusableTemplate } from "@vueuse/core";
import { useLayerManager } from "@/features/global";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const [ModalBodyTemplate, ModalBody] = createReusableTemplate();
const imageUrl = toRef(
  () => props.layerManager.currentLayer.value.state.imageUrl as string
);
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
      <ModalBody />
    </DialogContent>
  </Dialog>
</template>
