<script setup lang="ts">
import { useProductServices } from "@/features/products";
import { onMounted, ref } from "vue";
import {
  Button,
  Input,
  Slideover,
  InputGroup,
} from "@flavorly/vanilla-components";
import {
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/vue/24/outline";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import { z } from "zod";
import { useAsyncState } from "@vueuse/core";

const productSearch = ref("");
const isCreateProductSidebarOpen = ref(false);
const productList = ref<Awaited<ReturnType<typeof productServices.loadList>>>();
const productServices = useProductServices();
const asyncCreateProduct = useAsyncState(productServices.createProduct, null);

const { register, handleSubmit, errors } = useForm({
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
    asyncCreateProduct.execute(0, formValues);
  },
});
const { value: name, attrs: nameAttrs } = register("name");
const { value: description, attrs: descriptionAttrs } = register("description");
const { value: imageUrl, attrs: imageUrlAttrs } = register("image_url");
const { value: currentStock, attrs: currentStockAttrs } =
  register("current_stock");

onMounted(async () => {
  productList.value = await productServices.loadList();
});
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
        @click="isCreateProductSidebarOpen = true"
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
    <label for="table-search" class="sr-only">Search</label>
    <div class="relative">
      <Input v-model="productSearch" placeholder="Search products">
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
          <th scope="col" class="px-6 py-3">Name</th>
          <th scope="col" class="px-6 py-3">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(product, index) in productList?.data"
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
          <td class="px-6 py-4">
            <Button>
              <template #default>
                <EllipsisVerticalIcon class="w-5 h-5 stroke-[2px]" />
              </template>
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Slideover
    v-model="isCreateProductSidebarOpen"
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
            />
          </div>
        </InputGroup>
      </form>
    </div>
  </Slideover>
</template>
