<script setup lang="ts">
import { useProductServices } from "@/features/products";
import { ref, watch } from "vue";
import {
  Button,
  Input,
  Slideover,
  InputGroup,
  DropdownMenu,
  DropdownOption,
  Dialog,
} from "@flavorly/vanilla-components";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import { z } from "zod";
import { useAsyncState } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";

const productSearch = ref("");
const isCreateOrUpdateProductSidebarOpen = ref(false);
const isDeleteProductDialogOpen = ref(false);
const selectedProductIdFromActions = ref<string | null>(null);
const productServices = useProductServices();
const asyncCreateProduct = useAsyncState(productServices.createProduct, null);
const asyncLoadProducts = useAsyncState(productServices.loadList, null);
const asyncDeleteProducts = useAsyncState(productServices.deleteProduct, null);
const organizationStore = useOrganizationStore();

const { register, handleSubmit, errors, resetForm } = useForm({
  initialValues: {
    name: "",
    description: "",
    image_url: "",
    current_stock: 0,
  },
  validate: zodResolver(
    z.object({
      name: z.string().min(1, "Nombre de producto es requerido"),
      description: z.string(),
      image_url: z.string(),
      current_stock: z.number().int().nonnegative().finite().safe(),
    })
  ),
  async onSubmit(formValues) {
    await asyncCreateProduct.execute(0, formValues);
    await asyncLoadProducts.execute();
  },
});
const { value: name, attrs: nameAttrs } = register("name");
const { value: description, attrs: descriptionAttrs } = register("description");
const { value: imageUrl, attrs: imageUrlAttrs } = register("image_url");
const { value: currentStock, attrs: currentStockAttrs } =
  register("current_stock");

function closeProductSidebar() {
  isCreateOrUpdateProductSidebarOpen.value = false;
  resetForm();
}

function openDeleteProductDialog(productId: string | null) {
  selectedProductIdFromActions.value = productId;
  isDeleteProductDialogOpen.value = true;
}

function openUpdateProductDialog(productId: string | null) {
  selectedProductIdFromActions.value = productId;
  isCreateOrUpdateProductSidebarOpen.value = true;
}

async function deleteProduct() {
  await asyncDeleteProducts.execute(0, selectedProductIdFromActions.value);
  isDeleteProductDialogOpen.value = false;
  selectedProductIdFromActions.value = null;
  await asyncLoadProducts.execute();
}

const cleanHasOrganizations = watch(
  () => organizationStore.hasOrganizations,
  async (nextHasOrganizations) => {
    if (!nextHasOrganizations) return;
    await asyncLoadProducts.execute();
    cleanHasOrganizations();
  }
);
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="mb-6">
      <h2
        class="mb-2 text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white"
      >
        Productos
      </h2>
      <p class="max-w-xl">
        Tus productos, tu control. Gestiona fácilmente tu inventario.
      </p>
    </div>
    <div>
      <Button
        @click="isCreateOrUpdateProductSidebarOpen = true"
        label="Crear producto"
        variant="primary"
      >
        <template #icon><PlusIcon class="w-5 h-5 stroke-[2px]" /></template>
      </Button>
    </div>
  </div>

  <div
    class="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4"
  >
    <label for="table-search" class="sr-only">Buscar</label>
    <div class="relative">
      <Input v-model="productSearch" placeholder="Buscar productos">
        <template #before>
          <MagnifyingGlassIcon class="w-5 h-5 stroke-[2px]" /> </template
      ></Input>
    </div>
  </div>

  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input
                id="checkbox-all-search"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label for="checkbox-all-search" class="sr-only">checkbox</label>
            </div>
          </th>
          <th scope="col" class="px-6 py-3">Nombre</th>
          <th scope="col" class="px-6 py-3">Cantidad</th>
          <th scope="col" class="px-6 py-3">Acción</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(product, index) in asyncLoadProducts.state.value?.data"
          :key="index"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <td class="w-4 p-4">
            <div class="flex items-center">
              <input
                id="checkbox-table-search-1"
                type="checkbox"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label for="checkbox-table-search-1" class="sr-only"
                >checkbox</label
              >
            </div>
          </td>
          <th
            scope="row"
            class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
          >
            <img
              v-if="product.image_url"
              class="w-12 h-12 rounded-full"
              :src="product.image_url"
              alt="Rounded avatar"
            />
            <img
              v-else
              class="w-12 h-12 rounded-full"
              src="/product-placeholder.png"
              alt="Rounded avatar"
            />
            <div class="ps-3">
              <div class="text-base font-semibold">{{ product.name }}</div>
              <div v-if="product.description" class="font-normal text-gray-500">
                {{ product.description }}
              </div>
            </div>
          </th>
          <td>
            {{ product.i_stock.find(Boolean).current_stock }}
          </td>
          <td class="px-6 py-4">
            <DropdownMenu>
              <template #trigger>
                <Button>
                  <template #default>
                    <EllipsisVerticalIcon class="w-5 h-5 stroke-[2px]" />
                  </template>
                </Button>
              </template>

              <DropdownOption @click="openUpdateProductDialog(product.id)">
                <PencilIcon class="w-5 h-5 mr-2" />
                <span>Actualizar</span>
              </DropdownOption>
              <DropdownOption @click="openDeleteProductDialog(product.id)">
                <TrashIcon class="w-5 h-5 mr-2" />
                <span>Eliminar</span>
              </DropdownOption>
            </DropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Dialog
    v-model="isDeleteProductDialogOpen"
    position="center"
    title="Eliminar Producto"
  >
    <div class="text-center">
      <p class="text-sm text-gray-500 dark:text-gray-200">
        Esta acción eliminará permanentemente el producto. ¿Estás seguro de que
        deseas proceder con la eliminación?
      </p>
    </div>
    <template #footer>
      <Button type="button" variant="primary" @click="deleteProduct">
        Si, eliminar
      </Button>
      <Button
        type="button"
        variant="secondary"
        @click="isDeleteProductDialogOpen = false"
      >
        Cancelar
      </Button>
    </template>
  </Dialog>

  <Slideover
    v-model="isCreateOrUpdateProductSidebarOpen"
    position="right"
    title="Crear producto"
    subtitle="Crea rápidamente un nuevo producto para tu inventario."
  >
    <div class="space-y-6 pb-16">
      <form @submit="handleSubmit">
        <InputGroup label="Imagen de producto" name="image_url">
          <Input
            placeholder="URL de la imagen de tu producto"
            v-model="imageUrl"
            :errors="errors.image_url"
            v-bind="imageUrlAttrs"
          />
        </InputGroup>
        <InputGroup label="Nombre de producto" name="name">
          <Input
            placeholder="Ingresa el nombre de producto"
            v-model="name"
            :errors="errors.name"
            v-bind="nameAttrs"
          />
        </InputGroup>
        <InputGroup label="Descripción de producto" name="description">
          <Input
            placeholder="Ingresa la descripción de producto"
            v-model="description"
            :errors="errors.description"
            v-bind="descriptionAttrs"
          />
        </InputGroup>
        <InputGroup label="Cantidad de producto" name="current_stock">
          <Input
            placeholder="Ingresa la cantidad de producto"
            type="number"
            v-model="currentStock"
            :errors="errors.current_stock"
            v-bind="currentStockAttrs"
          />
        </InputGroup>
        <InputGroup>
          <div class="flex flex-col gap-4">
            <Button
              :loading="asyncCreateProduct.isLoading.value"
              :disabled="asyncCreateProduct.isLoading.value"
              label="Guardar"
              variant="primary"
              type="submit"
            />
            <Button
              :disabled="asyncCreateProduct.isLoading.value"
              label="Cancelar"
              @click="closeProductSidebar"
            />
          </div>
        </InputGroup>
      </form>
    </div>
  </Slideover>
</template>
