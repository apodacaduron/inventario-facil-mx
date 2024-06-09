<script setup lang="ts">
import { useAuthStore, useOrganizationStore } from "@/stores";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import { useDark, useToggle } from "@vueuse/core";
import {
  ArrowLeftOnRectangleIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  MoonIcon,
  SunIcon,
  UsersIcon,
} from "@heroicons/vue/24/outline";
import { toRef } from "vue";

const isDark = useDark();
const toggleDark = useToggle(isDark);
const authStore = useAuthStore();
const organizationStore = useOrganizationStore();

const orgId = toRef(
  () => organizationStore.userOrganizations?.find(Boolean)?.org_id
);

const menuList = {
  subscriptions: {
    path: `/admin/subscriptions`,
    text: "Suscripciones",
    icon: CalendarDaysIcon,
  },
  users: {
    path: `/admin/users`,
    text: "Usuarios",
    icon: UsersIcon,
  },
};
</script>

<template>
  <nav class="fixed top-0 z-20 w-full border-b border-border bg-background">
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
            </SheetContent>
          </Sheet>

          <router-link :to="menuList.users.path" class="flex ms-2 md:me-24">
            <span
              class="self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
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
                    aria-expanded="false"
                    data-dropdown-toggle="dropdown-user"
                  >
                    <span class="sr-only">Open user menu</span>
                    <Avatar>
                      <AvatarImage :src="authStore.avatar" />
                      <AvatarFallback>{{
                        `${authStore.session?.user.email
                          ?.substring(0, 1)
                          .toLocaleUpperCase()}`
                      }}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <router-link :to="`/org/${orgId}/dashboard`">
                    <DropdownMenuItem>
                      <BuildingStorefrontIcon class="w-4 h-4 mr-2" />
                      <span>Volver a organización</span>
                    </DropdownMenuItem>
                  </router-link>
                  <DropdownMenuItem @click="authStore.signOut">
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
    class="fixed top-0 left-0 z-10 w-64 h-screen pt-20 transition-transform -translate-x-full border-r sm:translate-x-0 border-border"
    aria-label="Sidebar"
  >
    <div class="flex flex-col justify-between h-full px-3 pb-4 overflow-y-auto">
      <ul class="space-y-2">
        <li v-for="(menuItem, index) in menuList" :key="index">
          <router-link
            :to="menuItem.path"
            class="w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-3 text-md justify-start"
            active-class="active-link"
          >
            <component
              :is="menuItem.icon"
              v-if="menuItem.icon"
              class="size-5"
            />
            <span class="ms-2">{{ menuItem.text }}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </aside>

  <div class="sm:ml-64">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.active-link {
  @apply bg-primary text-primary-foreground shadow hover:bg-primary/90 dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white;
}
</style>
