<script setup lang="ts">
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
} from "@/components/ui";
import { usePublicPageProductsQuery } from "@/features/products";
import { toRef } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const uuidv4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const productsQuery = usePublicPageProductsQuery({
  options: {
    enabled: toRef(() => uuidv4.test(route.params.orgId.toString())),
    search: "",
    orgId: toRef(() => route.params.orgId.toString()),
    order: ['name', 'asc'],
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
</script>

<template>
  <nav class="h-[56px] flex justify-center">
    <router-link to="/" class="flex">
      <span
        class="self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
        >inventariofacil.mx
      </span>
    </router-link>
  </nav>

  <main class="p-4">
    <div
      class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4 mb-10"
    >
      <Card
        v-for="product in productsQuery.data.value?.pages.flatMap(
          (page) => page.data
        )"
        :key="product?.id"
        class="flex flex-col"
      >
        <CardContent class="p-4 text-center">
          <Avatar class="w-32 h-32">
            <AvatarImage :src="product?.image_url ?? ''" />
            <AvatarFallback>{{
              `${product?.name?.substring(0, 1).toLocaleUpperCase()}`
            }}</AvatarFallback>
          </Avatar>
          <div class="text-lg font-semibold line-clamp-2">
            {{ product?.name }}
          </div>
          <div class="text-md line-clamp-1 text-muted-foreground">
            {{ product?.current_stock }} disponibles
          </div>
        </CardContent>
      </Card>
    </div>
  </main>
</template>
