<script setup lang="ts">
import { useAuthStore, useOrganizationStore } from "@/stores";
import { Button, Separator } from "@/components/ui";
import { NavigationBar } from "@/features/home";
import { useDark } from "@vueuse/core";
import { SUPPORT_EMAIL } from "@/config/constants";
import { MailIcon } from "lucide-vue-next";
import PricingGrid from "@/features/home/components/PricingGrid.vue";

const authStore = useAuthStore();
const organizationStore = useOrganizationStore();
const isDark = useDark();
</script>

<template>
  <main>
    <section
      class="pb-16 relative"
      :style="{
        backgroundImage: isDark
          ? 'linear-gradient(135deg, #434343 0%, black 100%)'
          : 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
      }"
    >
      <NavigationBar />
      <div class="text-center max-w-5xl mx-auto mt-[6vh]">
        <h1
          class="mb-4 text-4xl leading-none tracking-tighter md:text-5xl lg:text-8xl font-semibold"
        >
          Inventario Fácil para <br />
          Emprendedores
        </h1>
        <p class="mb-10 text-md font-normal lg:text-xl sm:px-16 xl:px-48">
          Simplifica el control de tu inventario desde el primer día. <br />
          Ideal para nuevos negocios.
        </p>

        <router-link
          v-if="authStore.isLoggedIn"
          :to="`/org/${
            organizationStore.userOrganizations?.find(Boolean)?.org_id
          }/dashboard`"
          :class="{
            'pointer-events-none': !organizationStore.hasUserOrganizations,
            'opacity-80': !organizationStore.hasUserOrganizations,
          }"
        >
          <Button
            size="lg"
            class="px-8 py-3 text-base"
            :disabled="!organizationStore.hasUserOrganizations"
          >
            Dashboard
          </Button>
        </router-link>
        <div v-else class="flex gap-4 justify-center">
          <router-link to="/auth/sign-up">
            <Button size="lg" class="px-8 py-3 text-base">
              Comienza gratis
            </Button>
          </router-link>
        </div>
      </div>

      <div class="flex justify-center px-6 py-12 lg:py-20">
        <img
          :src="`/screenshot-${isDark ? 'dark' : 'light'}.webp`"
          class="border border-foreground rounded-lg lg:rounded-3xl shadow-xl"
          alt="Inventario Fácil screenshot"
        />
        <div
          class="absolute bottom-0 w-full bg-gradient-to-t from-background h-[50vh] pointer-events-none"
        />
      </div>
    </section>
    <section class="mx-auto px-6 max-w-5xl pb-16">
      <div class="flex flex-col justify-center text-center">
        <h2 class="text-4xl lg:text-5xl mb-3">
          ¿Cómo utilizar inventariofacil.mx?
        </h2>
        <p class="text-muted-foreground">
          Una muestra basica del funcionamiento de la plataforma
        </p>
      </div>

      <div class="my-14">
        <div class="w-full aspect-video">
          <iframe
            class="w-full h-full"
            src="https://www.youtube.com/embed/4frFBUy_yd8?si=mu0SzXhTO8SmTC11"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
          >
          </iframe>
        </div>
      </div>
    </section>
    <section class="mx-auto px-6 max-w-5xl pb-16">
      <div class="flex flex-col justify-center text-center">
        <h2 class="text-4xl lg:text-5xl mb-3">Planes y Precios</h2>
        <p class="text-muted-foreground">
          Elige el plan perfecto para tu negocio
        </p>
      </div>

      <div class="my-14">
        <PricingGrid />
      </div>
    </section>
    <section class="mx-auto px-6 max-w-5xl pb-16">
      <div class="flex flex-col justify-center text-center">
        <h2 class="text-4xl lg:text-5xl mb-3">¿Tienes preguntas?</h2>
        <p class="text-muted-foreground">Ponte en contacto con nosotros</p>
      </div>

      <div class="mt-10 mb-14 flex justify-center gap-4">
        <a :href="`mailto:${SUPPORT_EMAIL}`">
          <Button variant="outline" size="lg">
            <MailIcon class="size-4 mr-2" />
            Contactar</Button
          >
        </a>
        <!-- <a :href="SUPPORT_WHATSAPP">
          <Button variant="outline" size="lg"
            ><PhoneIcon class="size-4 mr-2" /> Whatsapp</Button
          >
        </a> -->
      </div>
    </section>
    <footer class="mx-auto max-w-7xl">
      <div class="px-6 flex my-8 flex-col md:flex-row justify-between">
        <div class="mb-4">
          <a href="/">
            <span class="self-center text-xl sm:text-2xl whitespace-nowrap">
              inventariofacil.mx
            </span>
          </a>
        </div>
        <div>
          <ul class="text-muted-foreground">
            <li>
              <a href="/cookie-policy">Política de cookies</a>
            </li>
            <li>
              <a href="/legal-notice">Aviso legal</a>
            </li>
            <li>
              <a href="/privacy-policy">Política de privacidad</a>
            </li>
            <li>
              <a href="/refund-policy">Política de reembolsos</a>
            </li>
            <li>
              <a href="/terms-and-conditions">Términos y condiciones</a>
            </li>
          </ul>
        </div>
      </div>
      <Separator />
      <div class="my-6 px-6 text-muted-foreground lg:flex-row text-center">
        <div>
          ©{{ new Date().getFullYear() }} inventariofacil.mx. All rights
          reserved.
        </div>
      </div>
    </footer>
  </main>
</template>
