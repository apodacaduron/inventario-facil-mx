<script setup lang="ts">
import { Dropzone } from "@/components";
import {
  Sheet,
  Button,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  useToast,
} from "@/components/ui";
import { ref, toRef } from "vue";
import { Product, useProductServices } from "../composables";
import imageCompression, { Options } from "browser-image-compression";
import { useAssetServices } from "@/features/assets";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { notifyIfHasError, useLayerManager } from "@/features/global";
import { useAuthStore, useOrganizationStore } from "@/stores";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const acceptedFiles = ref<File[]>([]);

const queryClient = useQueryClient();
const authStore = useAuthStore();
const organizationStore = useOrganizationStore();
const route = useRoute();
const { toast } = useToast();
const assetServices = useAssetServices();
const productServices = useProductServices();
const uploadFilesMutation = useMutation({
  mutationFn: async () => {
    const orgId = route.params.orgId.toString();
    const productId = props.product?.id;

    if (!orgId) throw new Error("Org id is required to upload files");
    if (!productId) throw new Error("Product id is required to upload files");
    if (!authStore.session?.user.id)
      throw new Error("User id is required to upload files");

    const compressedFiles = await Promise.all(
      acceptedFiles.value.map(
        async (acceptedFile) => await compressFile(acceptedFile)
      )
    );

    await Promise.all(
      compressedFiles.map(async (file) => {
        if (!file) return;
        const extension = file?.name.split(".").pop() ?? "jpg";
        const randomId = Math.random().toString(16).slice(2);
        const nextFileName = `${randomId}.${extension}`;
        const bucketPath = `${orgId}/${productId}/${nextFileName}`;

        const response = await assetServices.uploadFile({
          bucket: "product-images",
          file,
          path: bucketPath,
        });
        notifyIfHasError(response.error);

        const responsePublicUrl = await assetServices.getPublicUrlFromFile({
          bucket: "product-images",
          path: bucketPath,
        });

        await productServices.createProductImage({
          filename: nextFileName,
          is_external: false,
          org_id: orgId,
          bucket_path: bucketPath,
          url: responsePublicUrl.data.publicUrl,
          product_id: productId,
          user_id: authStore.session?.user.id || null,
          is_primary: false,
        });
      })
    );

    await queryClient.invalidateQueries({ queryKey: ["product-images"] });

    openModel.value = false;
  },
});

const maxFiles = toRef(() => {
  const imagesCount = Number(
    props.layerManager.currentLayer.value.state.imagesCount
  );

  return organizationStore.maxProductImageUploads - imagesCount;
});

async function compressFile(imageFile: File) {
  const options: Options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (error) {
    toast({
      title: "Uh oh! Algo salió mal.",
      description: "Hubo un problema comprimiendo tu imagen",
      variant: "destructive",
    });
  }
}
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Subir imágenes de productos </SheetTitle>
        <SheetDescription>
          Agrega imágenes a tus productos arrastrándolas aquí o haciendo clic.
        </SheetDescription>
      </SheetHeader>

      <div class="my-6">
        <Dropzone
          v-model:acceptedFiles="acceptedFiles"
          :supportedExtensions="['.jpg', '.png', '.jpeg']"
          :maxFiles="maxFiles"
        />
      </div>

      <SheetFooter class="flex flex-row gap-2">
        <Button
          @click="openModel = false"
          variant="outline"
          type="button"
          class="w-full"
          >Cancelar</Button
        >
        <Button
          :disabled="
            acceptedFiles.length === 0 || uploadFilesMutation.isPending.value
          "
          type="submit"
          class="w-full"
          @click="uploadFilesMutation.mutate"
          >Subir</Button
        >
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
