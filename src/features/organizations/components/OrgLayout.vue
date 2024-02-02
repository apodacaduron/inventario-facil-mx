<script setup lang="ts">
import { useAuthStore } from "@/stores";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui";
import { useDark, useToggle } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  HomeIcon,
  MoonIcon,
  ShoppingBagIcon,
  SunIcon,
  UserGroupIcon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const router = useRouter();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const authStore = useAuthStore();

function signOut() {
  authStore.signOut();
  router.push("/");
}

const menuList = {
  dashboard: {
    path: `/org/${route.params.orgId}/dashboard`,
    text: "Inicio",
    icon: HomeIcon,
  },
  products: {
    path: `/org/${route.params.orgId}/products`,
    text: "Productos",
    icon: ShoppingBagIcon,
  },
  customers: {
    path: `/org/${route.params.orgId}/customers`,
    text: "Clientes",
    icon: UserGroupIcon,
  },
  sales: {
    path: `/org/${route.params.orgId}/sales`,
    text: "Ventas",
    icon: BanknotesIcon,
  },
};
</script>

<template>
  <nav
    class="fixed top-0 z-20 w-full bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800"
  >
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
          <Sheet>
            <SheetTrigger>
              <button
                class="inline-flex items-center p-2 text-sm text-slate-500 rounded-lg sm:hidden hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:focus:ring-slate-600"
              >
                <span class="sr-only">Open sidebar</span>
                <svg
                  class="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clip-rule="evenodd"
                    fill-rule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="left" class="overflow-y-auto">
              <SheetHeader class="text-left">
                <SheetTitle>Explora</SheetTitle>
                <SheetDescription>
                  Navega por las funciones disponibles y encuentra lo que
                  necesitas fácilmente.
                </SheetDescription>
              </SheetHeader>

              <div class="space-y-6 pb-16 mt-8">
                <div
                  class="flex flex-col justify-between h-full pb-4 overflow-y-auto"
                >
                  <ul class="space-y-2">
                    <li v-for="(menuItem, index) in menuList" :key="index">
                      <SheetClose class="w-full">
                        <router-link
                          :to="menuItem.path"
                          class="flex items-center p-2 rounded-lg"
                          active-class="active-link"
                        >
                          <component
                            :is="menuItem.icon"
                            v-if="menuItem.icon"
                            class="w-6 h-6 stroke-[2px] duration-75"
                          />
                          <span class="ms-3 font-semibold">{{
                            menuItem.text
                          }}</span>
                        </router-link>
                      </SheetClose>
                    </li>
                  </ul>

                  <div
                    id="dropdown-cta"
                    class="p-4 mt-6 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-700"
                    role="alert"
                  >
                    <div class="flex items-center mb-3">
                      <span
                        class="bg-orange-100 text-orange-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900"
                        >Alpha</span
                      >
                    </div>
                    <p class="mb-3 text-sm text-slate-800 dark:text-slate-400">
                      Este producto se encuentra en fase alpha. ¡Gracias por
                      probarlo y ser parte de su desarrollo inicial!
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <router-link :to="menuList.dashboard.path" class="flex ms-2 md:me-24">
            <span
              class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white"
              >inventariofacil.mx
            </span>
          </router-link>
        </div>
        <div class="flex items-center">
          <div class="flex items-center ms-3 gap-4">
            <Button
              @click="toggleDark()"
              variant="outline"
              class="dark:text-white"
            >
              <MoonIcon class="w-4 h-4 stroke-[2px]" v-if="isDark" />
              <SunIcon class="w-4 h-4 stroke-[2px]" v-else />
            </Button>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <button
                    type="button"
                    class="flex text-sm bg-slate-800 rounded-full focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600"
                    aria-expanded="false"
                    data-dropdown-toggle="dropdown-user"
                  >
                    <span class="sr-only">Open user menu</span>
                    <img
                      class="w-8 h-8 rounded-full"
                      :src="authStore.avatar"
                      alt="user photo"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem @click="signOut">
                    <ArrowLeftOnRectangleIcon class="w-4 h-4 mr-2" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <aside
    id="logo-sidebar"
    class="fixed top-0 left-0 z-10 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-slate-200 sm:translate-x-0 dark:bg-slate-900 dark:border-slate-800"
    aria-label="Sidebar"
  >
    <div
      class="flex flex-col justify-between h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-slate-900"
    >
      <ul class="space-y-2">
        <li v-for="(menuItem, index) in menuList" :key="index">
          <router-link
            :to="menuItem.path"
            class="flex items-center p-2 rounded-lg text-slate-500 dark:text-slate-300"
            active-class="active-link"
          >
            <component
              :is="menuItem.icon"
              v-if="menuItem.icon"
              class="w-6 h-6 stroke-[2px]"
            />
            <span class="ms-3 font-semibold">{{ menuItem.text }}</span>
          </router-link>
        </li>
      </ul>

      <div
        id="dropdown-cta"
        class="p-4 mt-6 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-700"
        role="alert"
      >
        <div class="flex items-center mb-3">
          <span
            class="bg-orange-100 text-orange-800 text-sm font-semibold me-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900"
            >Alpha</span
          >
        </div>
        <p class="mb-3 text-sm text-slate-800 dark:text-slate-400">
          Este producto se encuentra en fase alpha. ¡Gracias por probarlo y ser
          parte de su desarrollo inicial!
        </p>
      </div>
    </div>
  </aside>

  <div class="sm:ml-64">
    <div class="p-4 md:p-8 mt-20 md:mt-14">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">
.active-link {
  @apply text-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-slate-50;
}
</style>
