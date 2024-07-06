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
  SheetClose,
  Avatar,
  AvatarImage,
  AvatarFallback,
  SheetFooter,
} from "@/components/ui";
import { useDark, useMediaQuery, useToggle } from "@vueuse/core";
import { useRoute } from "vue-router";
import {
  ArrowLeftOnRectangleIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  EnvelopeIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { CrownIcon, SettingsIcon } from "lucide-vue-next";
import GoPremiumDialog from "./GoPremiumDialog.vue";
import { computed, ref } from "vue";
import {
  BadgeDollarSign,
  BarChart2,
  ShoppingBag,
  Users,
} from "lucide-vue-next";
import OrganizationSwitcher from "./OrganizationSwitcher.vue";
import UpdateOrganizationDialog from "./UpdateOrganizationDialog.vue";

const isGoPremiumDialogOpen = ref(false);
const isUpdateDialogOpen = ref(false);

const organizationStore = useOrganizationStore();
const route = useRoute();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const authStore = useAuthStore();
const isDesktop = useMediaQuery("(min-width: 768px)");

const menuList = computed(() => ({
  dashboard: {
    path: `/org/${route.params.orgId}/dashboard`,
    text: "Inicio",
    icon: BarChart2,
  },
  products: {
    path: `/org/${route.params.orgId}/products`,
    text: "Productos",
    icon: ShoppingBag,
  },
  customers: {
    path: `/org/${route.params.orgId}/customers`,
    text: "Clientes",
    icon: Users,
  },
  sales: {
    path: `/org/${route.params.orgId}/sales`,
    text: "Ventas",
    icon: BadgeDollarSign,
  },
}));
</script>

<template>
  <GoPremiumDialog v-model:open="isGoPremiumDialogOpen" />
  <UpdateOrganizationDialog
    v-model:open="isUpdateDialogOpen"
    :userOrganization="organizationStore.currentUserOrganization"
  />

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

              <div class="space-y-6 mt-8">
                <div
                  class="flex flex-col justify-between h-full pb-4 overflow-y-auto"
                >
                  <div class="flex gap-2">
                    <OrganizationSwitcher />
                    <Button
                      size="icon"
                      variant="ghost"
                      class="shrink-0"
                      @click="isUpdateDialogOpen = true"
                    >
                      <SettingsIcon class="size-4" />
                    </Button>
                  </div>

                  <ul class="space-y-2 mt-6">
                    <li v-for="(menuItem, index) in menuList" :key="index">
                      <SheetClose class="w-full">
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
                      </SheetClose>
                    </li>
                  </ul>
                </div>
              </div>
              <SheetFooter class="flex flex-col gap-4">
                <div class="shrink-0 bg-border h-px w-full" />
                <a
                  href="mailto:inventariofacilmx@gmail.com"
                  class="w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-3 text-md justify-start"
                  active-class="active-link"
                >
                  <EnvelopeIcon class="size-5" />
                  <span class="ms-2">Soporte</span>
                </a>
                <Button
                  v-if="!organizationStore.isPremium"
                  class="w-full"
                  @click="isGoPremiumDialogOpen = !isGoPremiumDialogOpen"
                >
                  <CrownIcon class="w-4 h-4 mr-2" /> Premium
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <router-link :to="menuList.dashboard.path" class="flex ms-2 md:me-6">
            <span
              class="self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
              >inventariofacil.mx
            </span>
          </router-link>

          <div v-if="isDesktop" class="flex gap-2">
            <OrganizationSwitcher />
            <Button
              size="icon"
              variant="ghost"
              class="shrink-0"
              @click="isUpdateDialogOpen = true"
            >
              <SettingsIcon class="size-4" />
            </Button>
          </div>
        </div>
        <div class="flex items-center">
          <div class="flex items-center ms-3 gap-4">
            <Button
              @click="toggleDark()"
              variant="outline"
              size="icon"
              class="md:visible dark:text-white"
            >
              <MoonIcon class="size-4 stroke-[2px]" v-if="isDark" />
              <SunIcon class="size-4 stroke-[2px]" v-else />
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
                  <router-link to="/settings/billing">
                    <DropdownMenuItem>
                      <Cog6ToothIcon class="w-4 h-4 mr-2" />
                      <span>Configuración</span>
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

      <div class="w-full flex flex-col gap-4">
        <a
          href="mailto:inventariofacilmx@gmail.com"
          class="w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-3 text-md justify-start"
          active-class="active-link"
        >
          <EnvelopeIcon class="size-5" />
          <span class="ms-2">Soporte</span>
        </a>
        <Button
          v-if="!organizationStore.isPremium"
          class="w-full"
          @click="isGoPremiumDialogOpen = !isGoPremiumDialogOpen"
        >
          <CrownIcon class="w-4 h-4 mr-2" /> Premium
        </Button>
      </div>
    </div>
  </aside>

  <div class="sm:ml-64">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.active-link {
  @apply bg-primary text-primary-foreground shadow hover:bg-primary/90;
}
</style>
