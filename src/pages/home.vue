<script setup lang="ts">
import { useAuthStore, useOrganizationStore } from "@/stores";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@/components/ui";
import { NavigationBar } from "@/features/home";
import { useDark } from "@vueuse/core";
import { usePlansQuery } from "@/features/subscriptions";
import { Tables } from "../../types_db";
import { useCurrencyFormatter } from "@/features/products";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { GoPremiumDialog } from "@/features/organizations";

const isGoPremiumDialogOpen = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const organizationStore = useOrganizationStore();
const isDark = useDark();
const currencyFormatter = useCurrencyFormatter();

const plansQuery = usePlansQuery({
  options: {
    enabled: true,
  },
});

function getCardDataFromPlan(plan: Tables<"plans">) {
  switch (plan.name) {
    case "premium":
      return {
        title: "Plan Premium",
        subtitle: "Para negocios en expansión y éxito garantizado",
        price: currencyFormatter.parse(plan.price, {
          maximumFractionDigits: 0,
        }),
        period: "/mes",
        description: `
          <ul>
            <li>Hasta 5000 clientes y 5000 productos</li>  
            <li>Hasta 3 organizaciones</li>  
            <li>Página pública para compartir inventario con clientes</li>  
            <li>Estadísticas avanzadas</li>  
          </ul>
        `,
        action: {
          label: (() => {
            if (authStore.isLoggedIn && authStore.isPremiumAccount) {
              return "Ya cuentas con este plan";
            }

            return "Obtener Premium";
          })(),
          isVisible: true,
          isDisabled: authStore.isPremiumAccount,
          callback() {
            if (!authStore.isLoggedIn) {
              router.push("/auth/sign-up");
              return;
            }
            if (!authStore.isPremiumAccount) {
              isGoPremiumDialogOpen.value = true;
              return;
            }
          },
        },
      };
    case "freemium":
      return {
        title: "Plan Gratuito",
        subtitle: "Para emprendedores que están comenzando",
        price: currencyFormatter.parse(plan.price, {
          maximumFractionDigits: 0,
        }),
        period: "/mes",
        description: `
          <ul>
            <li>Hasta 50 clientes y 50 productos</li>  
            <li>Crear ventas y ver estadísticas</li>  
          </ul>
        `,
        action: {
          label: (() => {
            if (authStore.isLoggedIn && !authStore.isPremiumAccount) {
              return "Ya cuentas con este plan";
            }

            return "Empieza Gratis";
          })(),
          isVisible: !authStore.isPremiumAccount,
          isDisabled: false,
          callback() {
            if (!authStore.isLoggedIn) {
              router.push("/auth/sign-up");
            }
          },
        },
      };

    default:
      break;
  }
}
</script>

<template>
  <main>
    <section class="pb-16">
      <NavigationBar />
      <div class="text-center max-w-5xl mx-auto mt-[6vh]">
        <h1
          class="mb-4 text-4xl leading-none tracking-tight md:text-5xl lg:text-8xl font-normal"
        >
          Inventario Fácil para Emprendedores
        </h1>
        <p
          class="mb-10 text-md font-normal text-muted-foreground lg:text-xl sm:px-16 xl:px-48"
        >
          Simplifica el control de tu inventario desde el primer día. Ideal para
          nuevos negocios, ¡y puedes empezar gratis!
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
            :loading="!organizationStore.hasUserOrganizations"
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

      <div
        class="flex justify-center px-6 py-12 lg:py-20 bg-[radial-gradient(ellipse_70%_60%,_rgba(0,0,0,0.2)_0%,_rgba(255,255,255,0)_80%)] dark:bg-[radial-gradient(ellipse_70%_60%,_rgba(255,255,255,0.2)_0%,_rgba(0,0,0,0)_80%)]"
      >
        <img
          :src="`/screenshot-${isDark ? 'dark' : 'light'}.png`"
          class="border-2 border-foreground rounded-lg lg:border-4 lg:rounded-3xl"
          alt="Inventario Facil screenshot"
        />
      </div>
    </section>
    <section class="mx-auto px-6 max-w-5xl pb-16">
      <GoPremiumDialog v-model:open="isGoPremiumDialogOpen" />

      <div class="flex flex-col justify-center text-center">
        <h2 class="text-4xl lg:text-5xl mb-3">Planes y Precios</h2>
        <p class="text-muted-foreground">
          Elige el plan perfecto para tu negocio
        </p>
      </div>

      <div class="my-14">
        <div
          class="grid grid-cols-1 lg:grid-cols-2 gap-6"
          v-for="page in plansQuery.data.value?.pages"
        >
          <Card v-for="plan in page.data">
            <CardHeader>
              <CardTitle>{{ getCardDataFromPlan(plan)?.title }}</CardTitle>
              <CardDescription>{{
                getCardDataFromPlan(plan)?.subtitle
              }}</CardDescription>
            </CardHeader>
            <CardContent>
              <Separator />
              <div class="flex items-center gap-2 my-6">
                <div class="text-4xl">
                  {{ getCardDataFromPlan(plan)?.price }}
                </div>
                <div>{{ getCardDataFromPlan(plan)?.period }}</div>
              </div>
              <p
                class="text-muted-foreground"
                v-html="getCardDataFromPlan(plan)?.description"
              />
            </CardContent>
            <CardFooter v-if="getCardDataFromPlan(plan)?.action.isVisible">
              <Button
                :disabled="getCardDataFromPlan(plan)?.action.isDisabled"
                @click="getCardDataFromPlan(plan)?.action.callback()"
                class="w-full"
              >
                {{ getCardDataFromPlan(plan)?.action.label }}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
    <section class="mx-auto px-6 max-w-5xl pb-16">
      <div class="flex flex-col justify-center text-center">
        <h2 class="text-4xl lg:text-5xl mb-3">Tienes preguntas?</h2>
        <p class="text-muted-foreground">Ponte en contacto con nosotros</p>
      </div>

      <div class="mt-10 mb-14 flex justify-center">
        <a href="mailto:inventariofacilmx@gmail.com">
          <Button variant="outline" size="lg">Contactar</Button>
        </a>
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
              <a href="/cookie-policy">Politica de cookies</a>
            </li>
            <li>
              <a href="/legal-notice">Aviso legal</a>
            </li>
            <li>
              <a href="/privacy-policy">Politica de privacidad</a>
            </li>
            <li>
              <a href="/refund-policy">Politica de reembolsos</a>
            </li>
            <li>
              <a href="/terms-and-conditions">Terminos y condiciones</a>
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
