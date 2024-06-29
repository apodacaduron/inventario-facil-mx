<script setup lang="ts">
import {
  ArrowLeftOnRectangleIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/vue/24/outline";
import { useDark, useToggle } from "@vueuse/core";
import { useAuthStore, useOrganizationStore } from "@/stores";
import { Button } from "@/components/ui";

const authStore = useAuthStore();
const organizationStore = useOrganizationStore();

const isDark = useDark();
const toggleDark = useToggle(isDark);

const HOME_URL = window.location.origin;
</script>

<template>
  <nav
    class="mx-auto max-w-7xl px-4 h-[64px] flex items-center justify-between"
  >
    <a :href="HOME_URL">
      <span
        class="self-center text-xl sm:text-2xl whitespace-nowrap dark:text-white"
      >
        inventariofacil.mx
      </span>
    </a>
    <div class="gap-4 flex">
      <Button
        aria-label="Toggle theme"
        @click="toggleDark()"
        variant="outline"
        size="icon"
      >
        <MoonIcon class="size-4 stroke-[2px]" v-if="isDark" />
        <SunIcon class="size-4 stroke-[2px]" v-else />
      </Button>
      <div v-if="authStore.isLoggedIn" class="flex gap-4">
        <Button
          variant="outline"
          :loading="!organizationStore.hasUserOrganizations"
          :disabled="!organizationStore.hasUserOrganizations"
          @click="authStore.signOut"
        >
          <ArrowLeftOnRectangleIcon class="w-4 h-4 md:hidden" />
          <span class="hidden md:block"> Cerrar sesión </span>
        </Button>
      </div>
      <div v-else class="hidden gap-4 md:flex">
        <router-link to="/auth/sign-in">
          <Button variant="outline">Iniciar sesión</Button>
        </router-link>
      </div>
    </div>
  </nav>
</template>
