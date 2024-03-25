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
} from "@/components/ui";
import { useProductsInStockQuery } from "@/features/dashboard";
import { CheckIcon, ShareIcon } from "@heroicons/vue/24/outline";
import {
  createReusableTemplate,
  useClipboard,
  useMediaQuery,
} from "@vueuse/core";
import { computed, ref, toRef } from "vue";

const openModel = defineModel<boolean>("open");

const showCurrentStock = ref(false);
const hasBeenCopied = ref(false);

const [ModalBodyTemplate, ModalBody] = createReusableTemplate();
const isDesktop = useMediaQuery("(min-width: 768px)");
const clipboard = useClipboard();
const productsInStockQuery = useProductsInStockQuery({
  options: {
    enabled: toRef(() => Boolean(openModel.value)),
  },
});

const inventoryString = computed(
  () =>
    productsInStockQuery.data.value?.data
      ?.map((product) => {
        if (showCurrentStock.value) {
          return `${product.name}: ${product.current_stock}`;
        }
        return product.name;
      })
      .join("\r\n") ?? ""
);

function copyText() {
  if (hasBeenCopied.value) return;
  clipboard.copy(inventoryString.value);
  hasBeenCopied.value = true;
  setTimeout(() => (hasBeenCopied.value = false), 2_000);
}
</script>

<template>
  <ModalBodyTemplate>
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
        <div class="mt-2">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            A continuación se muestra una lista de productos disponibles
            actualmente en stock. Puedes copiar y compartir esta lista según sea
            necesario.
          </p>
        </div>
        <div class="my-2">
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
    </div>
  </ModalBodyTemplate>

  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <ModalBody />
      <div class="mt-5 sm:mt-6 flex flex-col gap-3">
        <Button
          :disabled="hasBeenCopied"
          type="button"
          class="w-full"
          @click="copyText"
        >
          <CheckIcon v-if="hasBeenCopied" class="mr-2 w-4 h-4" />
          {{ hasBeenCopied ? "Copied" : "Copy" }}
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
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <ModalBody />
        <div class="mt-5 sm:mt-6 flex flex-col gap-3">
          <Button
            :disabled="hasBeenCopied"
            type="button"
            class="w-full"
            @click="copyText"
          >
            <CheckIcon v-if="hasBeenCopied" class="mr-2 w-4 h-4" />
            {{ hasBeenCopied ? "Copied" : "Copy" }}
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
    </DrawerContent>
  </Drawer>
</template>
