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
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui";
import {
  FeedbackCard,
  notifyIfHasError,
  useLayerManager,
  useTableStates,
} from "@/features/global";
import {
  EllipsisVerticalIcon,
  ImagePlusIcon,
  ImagesIcon,
  SquareMousePointerIcon,
  TrashIcon,
} from "lucide-vue-next";
import {
  Product,
  ProductImage,
  useProductImagesQuery,
  useProductServices,
} from "../composables";
import { computed, toRef } from "vue";
import { useRoute } from "vue-router";
import { useOrganizationStore } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { Spinner } from "@/components";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
  product: Product | null;
};

const openModel = defineModel<boolean>("open");
const props = defineProps<Props>();

const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
const productServices = useProductServices();
const route = useRoute();
const productImagesQuery = useProductImagesQuery({
  options: {
    enabled: toRef(() => Boolean(props.product?.id)),
    orgId: toRef(() => route.params.orgId.toString()),
    search: "",
    order: ["created_at", "asc"],
    filters: toRef(() => [
      {
        column: "product_id",
        operator: "eq",
        value: props.product?.id,
      },
    ]),
  },
});
const tableLoadingStates = useTableStates(productImagesQuery, "");
const updatePrimaryImageMutation = useMutation({
  mutationFn: async (productImage: ProductImage | null) => {
    if (!productImage)
      throw new Error("Product image is required to update primary image");
    if (!props.product?.id)
      throw new Error("Product id is required to update primary image");

    const currentPrimaryImage = productImagesQuery.data.value?.pages
      .flatMap((page) => page.data)
      .find((image) => Boolean(image?.is_primary));

    if (currentPrimaryImage) {
      const response = await productServices.updateProductImage(
        currentPrimaryImage.id,
        { is_primary: false }
      );
      notifyIfHasError(response.error);
    }
    const responseProductImage = await productServices.updateProductImage(
      productImage.id,
      {
        is_primary: true,
      }
    );
    notifyIfHasError(responseProductImage.error);
    const response = await productServices.updateProduct(props.product.id, {
      image_url: productImage.url,
    });
    notifyIfHasError(response.error);
    await queryClient.invalidateQueries({ queryKey: ["product-images"] });
    await queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

const productImageCount = computed(
  () => productImagesQuery.data.value?.pages.flatMap((page) => page.data).length
);
const maxFiles = toRef(() => {
  const imagesCount = Number(productImageCount.value);

  return organizationStore.maxProductImageUploads - imagesCount;
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle> Imágenes del producto </SheetTitle>
        <SheetDescription>
          Gestiona y sube imágenes para este producto.
        </SheetDescription>
      </SheetHeader>

      <div class="relative">
        <Spinner
          v-if="updatePrimaryImageMutation.isPending.value"
          class="absolute m-auto top-0 bottom-0 right-0 left-0"
        />
        <div
          :class="[
            'my-6',
            {
              'opacity-50 pointer-events-none':
                updatePrimaryImageMutation.isPending.value,
            },
          ]"
        >
          <Button
            v-if="maxFiles > 0"
            variant="outline"
            class="w-full mb-6"
            @click="
              layerManager.openLayer('upload-product-images', {
                imagesCount: productImageCount,
              })
            "
            ><ImagePlusIcon class="size-4 mr-2" /> Subir imagenes</Button
          >

          <FeedbackCard
            v-if="tableLoadingStates.showEmptyState.value"
            class="my-24"
          >
            <template #icon>
              <ImagesIcon class="size-10" />
            </template>
            <template #title>No hay imágenes del producto</template>
            <template #description
              >Añade una imagen para mostrar este producto.
            </template>
          </FeedbackCard>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="productImage in productImagesQuery.data.value?.pages.flatMap(
                (page) => page.data
              )"
            >
              <div
                :class="[
                  'flex justify-center items-center rounded-md relative',
                  { 'ring-4 ring-primary p-2': productImage?.is_primary },
                ]"
              >
                <Avatar
                  class="rounded-md h-auto max-w-full w-full aspect-square"
                  @click="
                    layerManager.openLayer('product-image-preview', {
                      imageUrl: productImage?.url,
                    })
                  "
                >
                  <AvatarImage
                    :src="productImage?.url ?? 'unknown'"
                    class="object-cover"
                  />
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      class="absolute top-2 right-2"
                      size="icon"
                      variant="outline"
                    >
                      <EllipsisVerticalIcon class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      v-if="!productImage?.is_primary"
                      @click="updatePrimaryImageMutation.mutate(productImage)"
                    >
                      <SquareMousePointerIcon class="size-4 mr-2" />
                      Convertir en primaria
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="
                        layerManager.openLayer('delete-product-image', {
                          productImage,
                        })
                      "
                      class="text-red-500"
                    >
                      <TrashIcon class="size-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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
