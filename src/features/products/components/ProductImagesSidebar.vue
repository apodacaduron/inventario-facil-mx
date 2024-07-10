<script setup lang="ts">
import {
  Sheet,
  Button,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import { useLayerManager } from "@/features/global";
import { ImagePlusIcon } from "lucide-vue-next";
import { Product, useProductImagesQuery } from "../composables";
import { toRef } from "vue";
import { useRoute } from "vue-router";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const route = useRoute();
const productImagesQuery = useProductImagesQuery({
  options: {
    enabled: toRef(() => Boolean(props.product?.id)),
    orgId: toRef(() => route.params.orgId.toString()),
    search: "",
    filters: toRef(() => [
      {
        column: "product_id",
        operator: "eq",
        value: props.product?.id,
      },
    ]),
  },
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Actualizar producto </SheetTitle>
        <SheetDescription>
          Actualiza rápidamente un producto de tu inventario.
        </SheetDescription>
      </SheetHeader>

      <div class="my-6">
        <Button
          variant="outline"
          class="w-full mb-6"
          @click="layerManager.openLayer('upload-product-images')"
          ><ImagePlusIcon class="size-4 mr-2" /> Upload more images</Button
        >

        <div>
          <div
            class="grid grid-cols-2 gap-4"
            v-for="productImage in productImagesQuery.data.value?.pages.flatMap(
              (page) => page.data
            )"
          >
            <Avatar class="rounded-md h-auto max-w-full w-full">
              <AvatarImage
                v-if="productImage?.url"
                :src="productImage?.url"
                class="object-cover"
              />
              <AvatarFallback>
                {{ productImage?.filename || "Desconocido" }}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <SheetFooter class="flex flex-row gap-2">
        <Button
          @click="openModel = false"
          variant="outline"
          type="button"
          class="w-full"
          >Cerrar</Button
        >
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
