<script setup lang="ts">
import { ref, toRef } from "vue";
import { useTableOrder } from "@/features/global";
import {
  Input,
  Avatar,
  AvatarFallback,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/outline";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useUsersQuery } from "@/features/admin";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";

const tableRef = ref<HTMLElement | null>(null);
const userSearch = ref("");
const userSearchDebounced = refDebounced(userSearch, 400);
const usersTableOrder = useTableOrder({
  options: {
    initialOrder: ["created_at", "desc"],
  },
});
const usersQuery = useUsersQuery({
  options: {
    enabled: true,
    search: userSearchDebounced,
    order: toRef(() => usersTableOrder.tableOrder.value),
  },
});
useInfiniteScroll(
  tableRef,
  () => {
    if (usersQuery.isFetching.value) return;
    usersQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => usersQuery.hasNextPage.value }
);
</script>

<template>
  <div class="flex justify-between flex-col md:flex-row mx-4 md:mx-0">
    <div class="mb-6">
      <h2
        class="mb-0 md:mb-2 text-3xl font-extrabold leading-none tracking-tight text-slate-900 md:text-4xl dark:text-white"
      >
        Usuarios
      </h2>
      <p class="hidden md:block max-w-xl">
        Tus clientes, tu control. Gestiona fácilmente tu lista de clientes.
      </p>
    </div>
  </div>

  <div class="flex items-center justify-between pb-4 gap-4 mx-4 md:mx-0">
    <Input
      v-model="userSearch"
      type="search"
      placeholder="Buscar clientes"
      class="max-w-[256px]"
    />
  </div>

  <div ref="tableRef" class="overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            @click="usersTableOrder.toggleTableOrder('name')"
            class="cursor-pointer pl-4"
          >
            <span class="flex items-center gap-2">
              Nombre
              <template v-if="usersTableOrder.tableOrder.value[0] === 'name'">
                <ChevronUpIcon
                  v-if="usersTableOrder.tableOrder.value[1] === 'desc'"
                  class="h-4 w-4"
                />
                <ChevronDownIcon
                  v-if="usersTableOrder.tableOrder.value[1] === 'asc'"
                  class="h-4 w-4"
                />
              </template>
            </span>
          </TableHead>
          <TableHead class="text-center">ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <!-- @vue-ignore -->
        <template
          v-for="(page, index) in usersQuery.data.value?.pages"
          :key="index"
        >
          <TableRow v-for="user in page.data" :key="user.id">
            <TableCell
              class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
            >
              <Avatar>
                <AvatarImage :src="user?.avatar_url ?? ''" />
                <AvatarFallback>{{
                  `${(user?.full_name ?? user.id)
                    ?.substring(0, 1)
                    .toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div class="ps-3">
                <div class="text-base font-semibold">
                  {{ user.full_name ?? "-" }}
                </div>
              </div>
            </TableCell>
            <TableCell class="text-center">{{ user.id || "-" }}</TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
