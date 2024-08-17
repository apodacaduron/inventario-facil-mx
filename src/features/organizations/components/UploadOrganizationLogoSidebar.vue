<script setup lang="ts">
import { Dropzone, Spinner } from "@/components";
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
import { ref, watchEffect } from "vue";
import {
  useOrganizationServices,
} from "../composables";
import imageCompression, { Options } from "browser-image-compression";
import { useAssetServices } from "@/features/assets";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { notifyIfHasError } from "@/features/global";
import { useAuthStore, UserOrganization } from "@/stores";

type Props = {
  userOrganization: UserOrganization | null | undefined;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const acceptedFiles = ref<File[]>([]);

const queryClient = useQueryClient();
const authStore = useAuthStore();
const { toast } = useToast();
const assetServices = useAssetServices();
const organizationServices = useOrganizationServices();
const uploadFilesMutation = useMutation({
  mutationFn: async () => {
    const orgId = props.userOrganization?.org_id;

    if (!orgId) throw new Error("Org id is required to upload files");
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
        const bucketPath = `${orgId}/logo/${nextFileName}`;

        const response = await assetServices.uploadFile({
          bucket: "organization-logos",
          file,
          path: bucketPath,
        });
        notifyIfHasError(response.error);

        const responsePublicUrl = await assetServices.getPublicUrlFromFile({
          bucket: "organization-logos",
          path: bucketPath,
        });

        if (props.userOrganization?.i_organizations?.logo) {
          const logoName = props.userOrganization?.i_organizations?.logo.split('/').pop()
          const bucketPath = `${orgId}/logo/${logoName}`;
          await assetServices.deleteFile({
            bucket: "organization-logos",
            path: bucketPath,
          });
        }

        await organizationServices.updateOrganization({
          organizationId: orgId,
          values: {
            logo: responsePublicUrl.data.publicUrl,
          },
        });

        await queryClient.invalidateQueries({ queryKey: ["organization"] });
      })
    );

    openModel.value = false;
  },
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

watchEffect(() => {
  if (openModel.value) return;
  acceptedFiles.value = [];
});
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
          :supportedExtensions="['.jpg', '.png', '.jpeg', '.webp']"
          :maxFiles="1"
          :disabled="uploadFilesMutation.isPending.value"
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
        >
          <Spinner v-if="uploadFilesMutation.isPending.value" class="mr-3" />
          Subir
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
