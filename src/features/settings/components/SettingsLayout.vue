<script setup lang="ts">
import { useAuthStore } from "@/stores";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui";
import { useDark, useToggle } from "@vueuse/core";
import { useRouter } from "vue-router";
import {
  ArrowLeftOnRectangleIcon,
  BuildingOffice2Icon,
  HomeIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const authStore = useAuthStore();

function signOut() {
  authStore.signOut();
  router.push("/");
}

const menuList = {
  general: {
    path: `/settings/general`,
    text: "General",
    icon: HomeIcon,
  },
  billing: {
    path: `/settings/billing`,
    text: "Pagos",
    icon: HomeIcon,
  },
};
</script>

<template>
  <nav class="fixed top-0 z-20 w-full border-b border-border bg-background">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
          <span
            class="self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
            >inventariofacil.mx
          </span>
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
                  <router-link
                    v-if="authStore.userRole === 'admin'"
                    to="/admin/users"
                  >
                    <DropdownMenuItem>
                      <BuildingOffice2Icon class="w-4 h-4 mr-2" />
                      <span>Ir al panel de administrador</span>
                    </DropdownMenuItem>
                  </router-link>
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

  <div class="mt-[96px] max-w-3xl mx-auto">
    <div class="flex gap-4 overflow-x-auto">
      <router-link
        v-for="(menuItem, index) in menuList"
        :key="index"
        :to="menuItem.path"
        >
        <Button :variant="router.currentRoute.value.path === menuItem.path ? 'default' : 'ghost'">{{ menuItem.text }}</Button>
        </router-link
      >
    </div>
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.active-link {
  @apply font-semibold text-foreground dark:bg-slate-800;
}
</style>
