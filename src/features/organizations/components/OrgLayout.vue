<script setup lang="ts">
import { useAuthStore, useOrganizationStore } from "@/stores";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Sheet,
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
import { useDark, useToggle } from "@vueuse/core";
import { useRoute } from "vue-router";
import {
  ArrowLeftOnRectangleIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  EnvelopeIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { CrownIcon, MenuIcon, PhoneIcon, SettingsIcon } from "lucide-vue-next";
import GoPremiumSidebar from "./GoPremiumSidebar.vue";
import { computed } from "vue";
import {
  BadgeDollarSign,
  BarChart2,
  ShoppingBag,
  Users,
} from "lucide-vue-next";
import OrganizationSwitcher from "./OrganizationSwitcher.vue";
import UpdateOrganizationSidebar from "./UpdateOrganizationSidebar.vue";
import { useLayerManager } from "@/features/global";
import CreateOrganizationSidebar from "./CreateOrganizationSidebar.vue";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/config/constants";

const layerManager = useLayerManager();
const organizationStore = useOrganizationStore();
const route = useRoute();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const authStore = useAuthStore();

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
  <GoPremiumSidebar
    :open="layerManager.currentLayer.value?.id === 'go-premium'"
    @update:open="(open) => open === false && layerManager.closeLayer()"
  />
  <UpdateOrganizationSidebar
    :open="layerManager.currentLayer.value?.id === 'update-organization'"
    @update:open="(open) => open === false && layerManager.closeLayer()"
    :userOrganization="organizationStore.currentUserOrganization"
  />
  <CreateOrganizationSidebar
    :open="layerManager.currentLayer.value?.id === 'create-organization'"
    @update:open="(open) => open === false && layerManager.closeLayer()"
  />

  <nav class="fixed top-0 z-20 w-full border-b border-border bg-background">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
          <Button
            @click="layerManager.openLayer('mobile-menu')"
            size="icon"
            variant="ghost"
            class="sm:hidden"
          >
            <MenuIcon class="size-6" />
          </Button>

          <Sheet
            :open="layerManager.currentLayer.value?.id === 'mobile-menu'"
            @update:open="(open) => open === false && layerManager.closeLayer()"
          >
            <SheetContent side="left" class="overflow-y-auto w-full">
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
                    <OrganizationSwitcher :layerManager />
                    <Button
                      size="icon"
                      variant="ghost"
                      class="shrink-0"
                      @click="layerManager.openLayer('update-organization')"
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
                  :href="`mailto:${SUPPORT_EMAIL}`"
                  class="w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-3 text-md justify-start"
                  active-class="active-link"
                >
                  <EnvelopeIcon class="size-5" />
                  <span class="ms-2">Soporte correo</span>
                </a>
                <a
                  :href="SUPPORT_WHATSAPP"
                  target="_blank"
                  class="w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-3 text-md justify-start"
                  active-class="active-link"
                >
                  <PhoneIcon class="size-5" />
                  <span class="ms-2">Soporte Whatsapp</span>
                </a>
                <Button
                  v-if="!organizationStore.isPremium"
                  class="w-full"
                  @click="layerManager.openLayer('go-premium')"
                >
                  <CrownIcon class="size-4 mr-2" /> Premium
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <router-link :to="menuList.dashboard.path" class="flex ms-2 sm:me-6">
            <span
              class="self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
              >inventariofacil.mx
            </span>
          </router-link>

          <div class="gap-2 hidden sm:flex">
            <OrganizationSwitcher :layerManager />
            <Button
              size="icon"
              variant="ghost"
              class="shrink-0"
              @click="layerManager.openLayer('update-organization')"
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
                      <AvatarImage
                        :src="authStore.avatar"
                        class="object-cover"
                      />
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
          :href="`mailto:${SUPPORT_EMAIL}`"
          class="w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-3 text-md justify-start"
          active-class="active-link"
        >
          <EnvelopeIcon class="size-5" />
          <span class="ms-2">Soporte correo</span>
        </a>
        <a
          :href="SUPPORT_WHATSAPP"
          target="_blank"
          class="w-full inline-flex items-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-3 text-md justify-start"
          active-class="active-link"
        >
          <PhoneIcon class="size-5" />
          <span class="ms-2">Soporte Whatsapp</span>
        </a>
        <Button
          v-if="!organizationStore.isPremium"
          class="w-full"
          @click="layerManager.openLayer('go-premium')"
        >
          <CrownIcon class="w-4 h-4 mr-2" /> Premium
        </Button>
      </div>
    </div>
  </aside>

  <div class="sm:ml-64">
    <div class="mt-[71px]">
      <div
        v-if="!organizationStore.isPremium"
        class="banner"
        @click="layerManager.openLayer('go-premium')"
      >
        <CrownIcon class="size-4" />
        Obtener premium
      </div>
    </div>
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.active-link {
  @apply bg-primary text-primary-foreground shadow hover:bg-primary/90;
}
.banner {
  @apply bg-primary text-primary-foreground;
  @apply flex justify-center items-center gap-2;
  @apply p-2 select-none cursor-pointer;
  @apply shadow-sm;
}
</style>
