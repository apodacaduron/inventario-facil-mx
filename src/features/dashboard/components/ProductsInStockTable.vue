<script setup lang="ts">
import { useCurrencyFormatter } from "@/features/products";
import { useProductsInStockQuery } from "..";

const currencyFormatter = useCurrencyFormatter();
const productsInStockQuery = useProductsInStockQuery();
</script>

<template>
  <table
    ref="tableRef"
    class="w-full text-sm text-left rtl:text-right text-slate-500 dark:text-slate-400"
  >
    <thead
      class="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400"
    >
      <tr>
        <th scope="col" class="px-6 py-3">Nombre</th>
        <th scope="col" class="px-6 py-3 text-center">Cantidad</th>
        <th scope="col" class="px-6 py-3 text-center">Precio unitario</th>
        <th scope="col" class="px-6 py-3 text-center">Precio de venta</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="product in productsInStockQuery.data.value?.data"
        :key="product.id"
        class="bg-white border-b dark:bg-slate-900 dark:border-slate-800"
      >
        <th
          scope="row"
          class="flex items-center px-6 py-4 text-slate-900 whitespace-nowrap dark:text-white"
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
            <div v-if="product.description" class="font-normal text-slate-500">
              {{ product.description }}
            </div>
          </div>
        </th>
        <td class="text-center">
          {{ product.current_stock }}
        </td>
        <td class="text-center">
          {{ currencyFormatter.parse(product.unit_price) ?? "-" }}
        </td>
        <td class="text-center">
          {{ currencyFormatter.parse(product.retail_price) ?? "-" }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
