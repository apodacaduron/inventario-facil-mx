<script setup lang="ts">
import {
  Button,
  Dialog,
  DialogContent,
  Textarea,
  Switch,
  Label,
  Drawer,
  DrawerContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
} from "@/components/ui";
import { CheckIcon, ShareIcon } from "@heroicons/vue/24/outline";
import {
  createReusableTemplate,
  refDebounced,
  useClipboard,
  useMediaQuery,
} from "@vueuse/core";
import { computed, onMounted, ref, toRef, watch } from "vue";
import { useProductsQuery } from "../composables";
import { useRoute } from "vue-router";
import QRCode from "qrcode";
import { useOrganizationStore } from "@/stores";
import { useMutation } from "@tanstack/vue-query";
import { useOrganizationServices } from "@/features/organizations";

const openModel = defineModel<boolean>("open");


const organizationStore = useOrganizationStore();
const isPublicProductsPageEnabled = ref(
  organizationStore.currentUserOrganization?.i_organizations
  ?.is_public_products_page_enabled ?? false
);
const isPublicProductsPageEnabledRefDebounced = refDebounced(isPublicProductsPageEnabled, 400);
const productsPageQrCodeUrl = ref("");
const showCurrentStock = ref(false);
const hasBeenCopied = ref(false);

const [ModalListContentTemplate, ModalListContent] = createReusableTemplate();
const [ModalLinkContentTemplate, ModalLinkContent] = createReusableTemplate();
const isDesktop = useMediaQuery("(min-width: 768px)");
const clipboard = useClipboard();
const route = useRoute();
const organizationServices = useOrganizationServices();
const updateOrganizationMutation = useMutation({mutationFn: organizationServices.updateOrganization}) 

const productsQuery = useProductsQuery({
  options: {
    enabled: toRef(() => Boolean(openModel.value)),
    search: "",
    organization_id: toRef(() => route.params.orgId.toString()),
    filters: toRef(() => {
      return [
        {
          column: "current_stock",
          operator: "gt",
          value: 0,
        },
      ];
    }),
  },
});

const publicProductsPageUrl = toRef(
  () => `${window.location.origin}/p/org/${route.params.orgId}/products`
);

const inventoryString = computed(() => {
  const productsList = productsQuery.data.value?.pages.flatMap(
    (page) => page.data
  );
  return (
    productsList
      ?.map((product) => {
        if (showCurrentStock.value) {
          return `${product?.name}: ${product?.current_stock}`;
        }
        return product?.name ?? "";
      })
      .join("\r\n") ?? ""
  );
});

function copyText(text: string) {
  if (hasBeenCopied.value) return;
  clipboard.copy(text);
  hasBeenCopied.value = true;
  setTimeout(() => (hasBeenCopied.value = false), 2_000);
}

function downloadQrCode() {
  const link = document.createElement("a");
  link.download = "Codigo QR";
  link.href = productsPageQrCodeUrl.value;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function openLinkInNewTab(url: string) {
  window.open(url, '_blank')
}

onMounted(async () => {
  productsPageQrCodeUrl.value = await QRCode.toDataURL(
    publicProductsPageUrl.value,
    { scale: 8, width: 800, margin: 2 }
  );
});

watch(isPublicProductsPageEnabledRefDebounced, (nextIsPublicProductsPageEnabled) => {
  updateOrganizationMutation.mutate({
    organizationId: route.params.orgId.toString(),
    values: {
      is_public_products_page_enabled: nextIsPublicProductsPageEnabled
    }
  })
})
</script>

<template>
  <ModalListContentTemplate>
    <div>
      <div
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100"
      >
        <ShareIcon
          class="h-6 w-6 stroke-[2px] text-green-600"
          aria-hidden="true"
        />
      </div>
      <div class="mt-3 text-center sm:mt-5">
        <h3
          class="text-lg font-medium leading-6 text-slate-900 dark:text-white"
        >
          🎉 Lista de Productos disponibles
        </h3>
        <div class="my-2">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            A continuación se muestra una lista de productos disponibles
            actualmente en stock. Puedes copiar y compartir esta lista según sea
            necesario.
          </p>
        </div>
        <div class="my-4">
          <Textarea
            class="min-h-[128px]"
            autosize
            :modelValue="inventoryString"
            readonly
          />
        </div>
        <div class="flex items-center gap-2 mt-4">
          <Switch v-model:checked="showCurrentStock" id="show-current-stock" />
          <Label for="show-current-stock">Mostrar stock actual</Label>
        </div>
      </div>
      <div class="mt-5 sm:mt-6 flex flex-col gap-3">
        <Button
          :disabled="hasBeenCopied"
          type="button"
          class="w-full"
          @click="copyText(inventoryString)"
        >
          <CheckIcon v-if="hasBeenCopied" class="mr-2 w-4 h-4" />
          {{ hasBeenCopied ? "Copiado" : "Copiar" }}
        </Button>
        <Button
          type="button"
          class="w-full"
          variant="outline"
          @click="openModel = false"
        >
          Close
        </Button>
      </div>
    </div>
  </ModalListContentTemplate>
  <ModalLinkContentTemplate>
    <div class="flex items-center gap-2 mt-8 mb-4">
      <Switch
        id="toggle-public-products-page"
        v-model:checked="isPublicProductsPageEnabled"
      />
      <Label for="toggle-public-products-page">Habilitar link publico</Label>
    </div>
    <div class="flex w-full max-w-sm items-center gap-1.5">
      <Input :defaultValue="publicProductsPageUrl" readonly />
      <Button
        variant="outline"
        @click="openLinkInNewTab(publicProductsPageUrl)"
      >
        Abrir
      </Button>
      <Button
        :disabled="hasBeenCopied"
        type="button"
        @click="copyText(publicProductsPageUrl)"
      >
        <CheckIcon v-if="hasBeenCopied" class="mr-2 w-4 h-4" />
        {{ hasBeenCopied ? "Copiado" : "Copiar" }}
      </Button>
    </div>
    <div class="mt-4">
      <img :src="productsPageQrCodeUrl" class="w-full rounded-md mb-4" />
      <Button class="w-full" @click="downloadQrCode"> Descargar QR </Button>
    </div>
  </ModalLinkContentTemplate>

  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px] pt-12">
      <Tabs default-value="list">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="list"> Lista </TabsTrigger>
          <TabsTrigger
            value="link"
            v-if="organizationStore.canEnablePublicProductsPage"
          >
            Link publico
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <ModalListContent />
        </TabsContent>
        <TabsContent
          value="link"
          v-if="organizationStore.canEnablePublicProductsPage"
        >
          <ModalLinkContent />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <Tabs default-value="list">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="list"> Lista </TabsTrigger>
            <TabsTrigger
              value="link"
              v-if="organizationStore.canEnablePublicProductsPage"
            >
              Link publico
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <ModalListContent />
          </TabsContent>
          <TabsContent
            value="link"
            v-if="organizationStore.canEnablePublicProductsPage"
          >
            <ModalLinkContent />
          </TabsContent>
        </Tabs>
      </div>
    </DrawerContent>
  </Drawer>
</template>
