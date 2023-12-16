<script setup lang="ts">
import { useAuthStore, useOrganizationStore } from "@/stores";
import { Button } from "@flavorly/vanilla-components";

const authStore = useAuthStore();
const organizationStore = useOrganizationStore();
</script>

<template>
  <main>
    <section class="h-screen overflow-hidden">
      <nav
        class="mx-auto max-w-7xl px-4 h-[64px] flex items-center justify-center md:justify-between"
      >
        <a href="https://flowbite.com">
          <span
            class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white"
            >inventariofacil.mx</span
          >
        </a>
        <div v-if="authStore.isLoggedIn" class="hidden gap-4 md:flex">
          <router-link
            :to="`/org/${
              organizationStore.organizations?.find(Boolean)?.org_id
            }/dashboard`"
            :class="{
              'pointer-events-none': !organizationStore.hasOrganizations,
              'opacity-80': !organizationStore.hasOrganizations,
            }"
          >
            <Button
              :loading="!organizationStore.hasOrganizations"
              :disabled="!organizationStore.hasOrganizations"
              label="Dashboard"
              variant="primary"
            />
          </router-link>
        </div>
        <div v-else class="hidden gap-4 md:flex">
          <router-link to="/auth/sign-in">
            <Button label="Iniciar sesión" variant="default" />
          </router-link>
          <router-link to="/auth/sign-up">
            <Button label="Regístrate" variant="primary" />
          </router-link>
        </div>
      </nav>
      <div class="text-center max-w-5xl mx-auto mt-[10vh]">
        <h1
          class="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
        >
          Simplifica tu Gestión de Inventario
        </h1>
        <p
          class="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"
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
            variant="primary"
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
          <Button variant="primary" class="px-8 py-3 text-base">
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
        src="/hero-light.svg"
        class="w-full h-full max-w-none object-cover lg:object-fill"
      />
    </section>
  </main>
</template>
