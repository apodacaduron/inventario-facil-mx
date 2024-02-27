<script setup lang="ts">
import { useAuthStore, useOrganizationStore } from "@/stores";
import { Button } from "@/components/ui";
import { NavigationBar } from "@/features/home";
import { useDark } from "@vueuse/core";

const authStore = useAuthStore();
const organizationStore = useOrganizationStore();
const isDark = useDark();
</script>

<template>
  <main>
    <section class="h-screen overflow-hidden">
      <NavigationBar />
      <div class="text-center max-w-5xl mx-auto mt-[10vh]">
        <h1
          class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-slate-900 md:text-5xl lg:text-6xl dark:text-white"
        >
          Simplifica tu Gestión de Inventario
        </h1>
        <p
          class="mb-6 text-lg font-normal text-slate-500 lg:text-xl sm:px-16 xl:px-48 dark:text-slate-400"
        >
          La solución perfecta para llevar el control de tu inventario de manera
          rápida y sencilla, ¡sin complicaciones ni papeleo!
        </p>
        <router-link
          v-if="authStore.isLoggedIn"
          :to="`/org/${
            organizationStore.organizations?.find(Boolean)?.org_id
          }/dashboard`"
          :class="{
            'pointer-events-none': !organizationStore.hasOrganizations,
            'opacity-80': !organizationStore.hasOrganizations,
          }"
        >
          <Button
            class="px-8 py-3 text-base"
            :loading="!organizationStore.hasOrganizations"
            :disabled="!organizationStore.hasOrganizations"
          >
            Dashboard
            <svg
              class="w-3.5 h-3.5 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Button>
        </router-link>
        <router-link v-else to="/auth/sign-up">
          <Button class="px-8 py-3 text-base">
            Regístrate
            <svg
              class="w-3.5 h-3.5 ms-2 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Button>
        </router-link>
      </div>
      <img
        :src="`/hero-${isDark ? 'dark' : 'light'}.svg`"
        class="w-full h-full max-w-none object-cover lg:object-fill"
        alt="hero"
      />
    </section>
  </main>
</template>
