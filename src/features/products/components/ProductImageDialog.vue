<script setup lang="ts">
import {
  Dialog,
  Button,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerHeader,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Input,
  Label,
  useToast,
} from "@/components/ui";
import { ArrowUpTrayIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { Product, UpdateProduct, useProductServices } from "../composables";
import { ref, toRef, watchEffect } from "vue";
import imageCompression, { Options } from "browser-image-compression";
import {
  createReusableTemplate,
  useElementHover,
  useMediaQuery,
} from "@vueuse/core";
import {
  useAssetByUrlQuery,
  useAssetServices,
} from "@/features/assets/composables";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores";
import { useRoute } from "vue-router";

type ProductImageDialogProps = {
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<ProductImageDialogProps>();
const emit = defineEmits<{
  (e: "save", formValues: UpdateProduct): void;
}>();

const inputFileRef = ref<HTMLInputElement | null>();
const hasSelectedFile = ref(false);
const selectedFile = ref<File | null>(null);
const productImageUrl = ref("");
const productHoverRef = ref();

const route = useRoute();
const authStore = useAuthStore();
const queryClient = useQueryClient();
const isHovered = useElementHover(productHoverRef);
const { toast } = useToast();
const assetServices = useAssetServices();
const productServices = useProductServices();
const uploadFileMutation = useMutation({
  mutationFn: uploadFile,
});
const [ModalBodyTemplate, ModalBody] = createReusableTemplate();
const isDesktop = useMediaQuery("(min-width: 768px)");
const assetByFilename = useAssetByUrlQuery({
  options: {
    url: toRef(() => props.product?.image_url),
    enabled: toRef(() => {
      return Boolean(openModel.value) && Boolean(props.product?.image_url);
    }),
  },
});

const isExternalAsset = toRef(() => {
  const hasAssetInStorage = Boolean(assetByFilename.data.value);

  if (hasAssetInStorage)
    return Boolean(assetByFilename.data.value?.is_external);

  return true;
});

function setPreview(event: Event): void {
  hasSelectedFile.value = true;
  const inputElement = event.target as HTMLInputElement;
  const reader = new FileReader();
  reader.onload = function () {
    productImageUrl.value = reader.result?.toString() ?? "";
  };
  const firstFileFound = inputElement.files?.[0];
  if (!firstFileFound) return;
  selectedFile.value = firstFileFound;
  reader.readAsDataURL(firstFileFound);
}

function resetImage() {
  productImageUrl.value = "";
  if (!inputFileRef.value?.value) return;
  inputFileRef.value.value = "";
  hasSelectedFile.value = false;
  selectedFile.value = null;
}

async function uploadFile() {
  if (!route.params.orgId.toString()) return;
  if (!props.product?.id) return;
  if (!authStore.session?.user.id) return;

  if (!productImageUrl.value && !hasSelectedFile.value) {
    const assetByRelatedIdResponse = await assetServices.getAssetByRelatedId(
      props.product.id
    );
    const assetForThisProductExists = Boolean(
      assetByRelatedIdResponse?.data?.id
    );
    if (assetForThisProductExists && assetByRelatedIdResponse?.data?.id) {
      await assetServices.deleteAsset(assetByRelatedIdResponse?.data?.id);
      await assetServices.deleteFile({
        bucket: "product-images",
        path: `${route.params.orgId.toString()}/${props.product?.id}/${
          assetByRelatedIdResponse?.data.filename
        }`,
      });
    }
    await productServices.updateProduct({
      product_id: props.product.id,
      image_url: "",
    });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    openModel.value = false;
    return;
  }

  if (hasSelectedFile.value && selectedFile.value) {
    const compressedFile = await compressFile(selectedFile.value);
    if (!compressedFile) return;
    const extension = selectedFile.value?.name.split(".").pop();

    const response = await assetServices.uploadFile({
      bucket: "product-images",
      file: compressedFile,
      path: `${route.params.orgId.toString()}/${
        props.product?.id
      }/main.${extension}`,
    });
    if (response.error) {
      toast({
        title: "Uh oh! Algo salió mal.",
        description:
          response?.error?.message ?? "Hubo un problema con tu solicitud.",
        variant: "destructive",
      });
      return;
    }
    const imagePath = response.data?.path;
    if (!imagePath) return;
    if (!selectedFile.value?.name) return;

    const responsePublicUrl = await assetServices.getPublicUrlFromFile({
      bucket: "product-images",
      path: imagePath,
    });

    const assetByUrlResponse = await assetServices.getAssetByUrl(
      responsePublicUrl.data.publicUrl
    );
    const assetExistsInTable = Boolean(assetByUrlResponse?.data?.id);
    if (assetExistsInTable && assetByUrlResponse?.data?.id) return;

    const assetByRelatedIdResponse = await assetServices.getAssetByRelatedId(
      props.product.id
    );
    const assetForThisProductExists = Boolean(
      assetByRelatedIdResponse?.data?.id
    );
    if (assetForThisProductExists && assetByRelatedIdResponse?.data?.id) {
      await assetServices.updateAsset(assetByRelatedIdResponse?.data?.id, {
        file_type: selectedFile.value?.type ?? "image",
        filename: `main.${extension}`,
        is_external: false,
        org_id: route.params.orgId.toString(),
        path: imagePath,
        url: responsePublicUrl.data.publicUrl,
        related_id: props.product?.id,
        user_id: authStore.session?.user.id,
      });
    } else {
      await assetServices.createAsset({
        file_type: selectedFile.value?.type ?? "image",
        filename: `main.${extension}`,
        is_external: false,
        org_id: route.params.orgId.toString(),
        path: imagePath,
        url: responsePublicUrl.data.publicUrl,
        related_id: props.product?.id,
        user_id: authStore.session?.user.id,
      });
    }

    await productServices.updateProduct({
      product_id: props.product.id,
      image_url: responsePublicUrl.data.publicUrl,
    });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  } else if (productImageUrl.value) {
    if (!isValidHttpUrl(productImageUrl.value)) {
      toast({
        title: "Uh oh! Algo salió mal.",
        description: "The link provided is not a valid URL",
        variant: "destructive",
      });
      return;
    }

    const filename = productImageUrl.value.split("/").pop();
    if (!filename) return;

    const assetByUrlResponse = await assetServices.getAssetByUrl(
      productImageUrl.value
    );
    const assetUrlExistsInTable = Boolean(assetByUrlResponse?.data?.id);
    if (assetUrlExistsInTable && assetByUrlResponse?.data?.id) return;

    const assetByRelatedIdResponse = await assetServices.getAssetByRelatedId(
      props.product.id
    );
    const assetForThisProductExists = Boolean(
      assetByRelatedIdResponse?.data?.id
    );
    if (assetForThisProductExists && assetByRelatedIdResponse?.data?.id) {
      await assetServices.deleteFile({
        bucket: "product-images",
        path: `${route.params.orgId.toString()}/${props.product?.id}/${
          assetByRelatedIdResponse?.data.filename
        }`,
      });
      await assetServices.updateAsset(assetByRelatedIdResponse?.data?.id, {
        url: productImageUrl.value,
        file_type: "image",
        filename: "",
        is_external: true,
        path: "",
      });
    } else {
      await assetServices.createAsset({
        file_type: "image",
        filename: "",
        is_external: true,
        org_id: route.params.orgId.toString(),
        path: "",
        url: productImageUrl.value,
        related_id: props.product?.id,
        user_id: authStore.session?.user.id,
      });
    }

    await productServices.updateProduct({
      product_id: props.product.id,
      image_url: productImageUrl.value,
    });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  }
  openModel.value = false;
}

function isValidHttpUrl(maybeUrl: string) {
  let url;

  try {
    url = new URL(maybeUrl);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

async function compressFile(imageFile: File) {
  const options: Options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 240,
    useWebWorker: true,
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    return compressedFile;
  } catch (error) {
    toast({
      title: "Uh oh! Algo salió mal.",
      description: "There was a problem compressing your image",
      variant: "destructive",
    });
  }
}

watchEffect(() => {
  if (openModel.value) return;
  resetImage();
});
watchEffect(() => {
  if (!openModel.value && isExternalAsset && !assetByFilename.isLoading.value)
    return;
  productImageUrl.value = props.product?.image_url ?? "";
});
</script>

<template>
  <ModalBodyTemplate>
    <div class="flex flex-col items-center gap-8">
      <div class="relative w-48 h-48">
        <Button
          @click="resetImage"
          class="absolute top-0 -right-8"
          variant="outline"
          size="icon"
        >
          <TrashIcon class="w-5 h-5" />
        </Button>

        <input
          ref="inputFileRef"
          type="file"
          class="hidden"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          @change="setPreview"
        />

        <Avatar
          ref="productHoverRef"
          class="w-48 h-48 relative border border-b-muted"
          @click="inputFileRef?.click()"
        >
          <div
            v-if="isHovered"
            class="absolute bg-black bg-opacity-50 w-full h-full flex justify-center items-center cursor-pointer text-white"
          >
            <ArrowUpTrayIcon class="w-8 h-8" />
          </div>
          <AvatarImage :src="productImageUrl" class="object-cover" />
          <AvatarFallback>
            {{ `${product?.name?.substring(0, 1).toLocaleUpperCase()}` }}
          </AvatarFallback>
        </Avatar>
      </div>
      <div class="w-full" v-if="!hasSelectedFile">
        <Label>URL de imagen</Label>
        <Input
          v-model="productImageUrl"
          type="text"
          :disabled="assetByFilename.isLoading.value"
          placeholder="Ingresa la url de una imagen"
        />
      </div>
    </div>
  </ModalBodyTemplate>

  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle> Actualiza la imagen de tu producto </DialogTitle>
        <DialogDescription>
          Puedes subir una imagen de tu dispositivo haciendo click o agregando
          el link de una imagen ya existente en la caja de texto
        </DialogDescription>
      </DialogHeader>
      <ModalBody />
      <DialogFooter>
        <Button
          @click="uploadFileMutation.mutateAsync"
          :disabled="uploadFileMutation.isPending.value"
          type="button"
          class="w-full"
        >
          Guardar
        </Button>
        <Button
          :disabled="uploadFileMutation.isPending.value"
          @click="openModel = false"
          type="button"
          variant="outline"
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
          <DrawerTitle> Actualiza la imagen de tu producto </DrawerTitle>
          <DrawerDescription>
            Puedes subir una imagen de tu dispositivo haciendo click o agregando
            el link de una imagen ya existente en la caja de texto
          </DrawerDescription>
        </DrawerHeader>
        <ModalBody />
        <DrawerFooter>
          <Button
            @click="uploadFileMutation.mutateAsync"
            :disabled="uploadFileMutation.isPending.value"
            type="button"
            class="w-full"
          >
            Guardar
          </Button>
          <Button
            :disabled="uploadFileMutation.isPending.value"
            @click="openModel = false"
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
