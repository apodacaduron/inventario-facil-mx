<script setup lang="ts">
import { useCurrencyFormatter } from "@/features/products";
import { usePlansQuery } from "@/features/subscriptions";
import { useRouter } from "vue-router";
import { Tables } from "../../../../types_db";
import { useAuthStore } from "@/stores";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { supabase } from "@/config/supabase";
import { toRef } from "vue";
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
import { Loader2 } from "lucide-vue-next";

const authStore = useAuthStore();

const router = useRouter();
const currencyFormatter = useCurrencyFormatter();

const premiumPlanQuery = useQuery({
  queryKey: ["premium-plan"],
  async queryFn() {
    return await supabase
      .from("plans")
      .select("*")
      .eq("name", "premium")
      .single();
  },
  enabled: toRef(() => authStore.isLoggedIn),
});
const createStripeCheckoutMutation = useMutation({
  mutationFn: createStripeCheckout,
});

async function createStripeCheckout() {
  const priceId = premiumPlanQuery.data.value?.data?.stripe_price_id;
  const email = authStore.authedUser?.email;
  if (!email || !priceId)
    throw new Error("Unable to create stripe checkout session, missing params");
  const response = await supabase.functions.invoke(
    "create-stripe-checkout-session",
    {
      body: JSON.stringify({
        price_id: priceId,
        cancel_url: window.location.href,
        success_url: window.location.href,
      }),
    }
  );

  if (!response?.data?.url) throw new Error("Checkout session url not found");

  window.location.href = response.data.url;
}

const plansQuery = usePlansQuery({
  options: {
    enabled: true,
  },
});

function getCardDataFromPlan(plan: Tables<"plans">) {
  switch (plan.name) {
    case "premium":
      return {
        title: "🔥 Plan PRO",
        subtitle:
          "👉 Para negocios en crecimiento, el Plan PRO es la mejor opción.",
        price: currencyFormatter.parse(plan.price, {
          maximumFractionDigits: 0,
        }),
        period: "/mes",
        description: `
          <ul>
            <li>✔️ Hasta ${plan.max_products} productos y ${plan.max_customers} clientes</li>
            <li>✔️ Gestión de hasta ${plan.max_organizations} organizaciones</li>
            <li>✔️ Estadísticas avanzadas + ventas del año, mejores clientes y productos más vendidos</li>
            <li>✔️ Selector de periodo en estadísticas</li>
            <li>✔️ Sube tu logo y personaliza colores</li>
            <li>✔️ Historial de cambios de stock</li>
            <li>✔️ Alertas de bajo stock</li>
            <li>✔️ Monedero electrónico para clientes</li>
            <li>✔️ Comparte tu stock con una URL pública</li>
            <li>✔️ Listado de ventas del día</li>
          </ul>
        `,
        action: {
          label: (() => {
            if (authStore.isLoggedIn && authStore.isPremiumAccount) {
              return "Ya cuentas con este plan";
            }

            return "Obtener PRO";
          })(),
          isVisible: true,
          isDisabled: authStore.isPremiumAccount,
          callback() {
            if (!authStore.isLoggedIn) {
              router.push("/auth/sign-up");
              return;
            }
            if (!authStore.isPremiumAccount) {
              createStripeCheckoutMutation.mutateAsync();
              return;
            }
          },
        },
      };
    case "freemium":
      return {
        title: "🆓 Plan Gratuito",
        subtitle: "Para emprendedores que están comenzando",
        price: currencyFormatter.parse(plan.price, {
          maximumFractionDigits: 0,
        }),
        period: "/mes",
        description: `
          <ul>
            <li>✔️ ${plan.max_products} productos y ${plan.max_customers} clientes</>
            <li>✔️ Ventas ilimitadas</li>
            <li>✔️ Estadísticas básicas</li>
            <li>✔️ 1 organización</li>
            <li>✔️ 1 imagen por producto</li>
            <li>❌ Sin personalización ni logo</li>
            <li>❌ Sin alertas de stock</li>
            <li>❌ Sin historial de cambios de stock</li>
            <li>❌ Sin monedero electrónico para clientes</li>
            <li>❌ No permite compartir productos por URL</li>
            <li>❌ No muestra ventas del día</li>
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
          :disabled="
            getCardDataFromPlan(plan)?.action.isDisabled ||
            createStripeCheckoutMutation.isPending.value
          "
          @click="getCardDataFromPlan(plan)?.action.callback()"
          class="w-full"
        >
          <Loader2
            v-if="createStripeCheckoutMutation.isPending.value"
            class="w-4 h-4 mr-2 animate-spin"
          />
          {{ getCardDataFromPlan(plan)?.action.label }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
