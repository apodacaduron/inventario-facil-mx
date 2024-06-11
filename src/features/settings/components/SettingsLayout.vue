<script setup lang="ts">
import { useAuthStore, useOrganizationStore } from "@/stores";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator,
} from "@/components/ui";
import { useDark, useToggle } from "@vueuse/core";
import { useRouter } from "vue-router";
import { ArrowLeft } from 'lucide-vue-next'
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
const organizationStore = useOrganizationStore();

const menuList = {
  billing: {
    path: `/settings/billing`,
    text: "Pagos",
    icon: HomeIcon,
  },
  organizations: {
    path: `/settings/organizations`,
    text: "Organizaciones",
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
            class="ms-2 self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
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

  <div class="mt-[70px] space-y-6 p-6 md:p-10 pb-16">
    <div class="flex gap-4">
      <router-link :to="`/org/${organizationStore.userOrganizations?.find(Boolean)?.org_id}/dashboard`">

        <Button variant="outline" size="icon"> <ArrowLeft class="size-4" /> </Button>
      </router-link>
      <div class="space-y-0.5">
        <h2 class="text-2xl font-bold tracking-tight">Configuracion</h2>
        <p class="text-muted-foreground">
          Configuracion de tu cuenta.
        </p>
      </div>
    </div>
    <Separator class="my-6" />
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside class="lg:w-1/5">
        <nav class="flex mx-3 lg:flex-col lg:mx-2 lg:my-1 gap-2">
          <router-link
            v-for="(menuItem, index) in menuList"
            :key="index"
            :to="menuItem.path"
          >
            <Button
              variant="ghost"
              :class="`w-full text-left justify-start ${
                router.currentRoute.value.path === menuItem.path &&
                'bg-muted hover:bg-muted'
              }`"
              >{{ menuItem.text }}</Button
            >
          </router-link>
        </nav>
      </aside>
      <div class="flex-1">
        <div class="space-y-6">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.active-link {
  @apply font-semibold text-foreground dark:bg-slate-800;
}
</style>
