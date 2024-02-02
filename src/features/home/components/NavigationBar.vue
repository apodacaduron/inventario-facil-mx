<script setup lang="ts">
import { MoonIcon, SunIcon } from "@heroicons/vue/24/outline";
import { useDark, useToggle } from "@vueuse/core";
import { useAuthStore, useOrganizationStore } from "@/stores";

const authStore = useAuthStore();
const organizationStore = useOrganizationStore();

const isDark = useDark();
const toggleDark = useToggle(isDark);
</script>

<template>
  <nav
    class="mx-auto max-w-7xl px-4 h-[64px] flex items-center justify-between"
  >
    <a href="https://flowbite.com">
      <span
        class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white"
      >
        inventariofacil.mx
      </span>
    </a>
    <div class="gap-4 flex">
      <Button @click="toggleDark()" variant="outline">
        <MoonIcon class="w-4 h-4 stroke-[2px]" v-if="isDark" />
        <SunIcon class="w-4 h-4 stroke-[2px]" v-else />
      </Button>
      <div v-if="authStore.isLoggedIn" class="hidden gap-4 md:flex">
        <router-link
          :to="`/org/${
            organizationStore.organizations?.find(Boolean)?.org_id
          }/dashboard`"
          :class="[
            {
              'pointer-events-none': !organizationStore.hasOrganizations,
              'opacity-80': !organizationStore.hasOrganizations,
            },
          ]"
        >
          <Button
            :loading="!organizationStore.hasOrganizations"
            :disabled="!organizationStore.hasOrganizations"
          >
            Dashboard
          </Button>
        </router-link>
      </div>
      <div v-else class="hidden gap-4 md:flex">
        <router-link to="/auth/sign-in">
          <Button variant="outline">Iniciar sesión</Button>
        </router-link>
        <router-link to="/auth/sign-up">
          <Button>Regístrate</Button>
        </router-link>
      </div>
    </div>
  </nav>
</template>
