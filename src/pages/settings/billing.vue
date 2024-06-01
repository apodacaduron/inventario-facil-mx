<script setup lang="ts">
import { Button } from "@/components/ui";
import { supabase } from "@/config/supabase";
import { FeedbackCard } from "@/features/global";
import { useAuthStore } from "@/stores";
import { CreditCardIcon } from "@heroicons/vue/24/outline";

const authStore = useAuthStore();

async function openStripeCustomerPortal() {
  const stripeCustomerId = authStore.authedUser?.stripe_customer_id;
  if (!stripeCustomerId)
    throw new Error("Cannot create customer portal, customer id is required");

  const response = await supabase.functions.invoke("create-stripe-customer-portal-session", {
    body: JSON.stringify({
      customer_id: authStore.authedUser?.stripe_customer_id,
      return_url: window.location.href,
    }),
  });

  if (response.data) {
    window.location.href = response.data.url
  }
}
</script>

<template>
  <div class="mt-16">
    <FeedbackCard>
      <template #icon>
        <CreditCardIcon class="w-10 h-10 stroke-[1px]" />
      </template>
      <template #title>Pagos y Facturación</template>
      <template #description
        >Tu información de pago está segura con nosotros. <br />
        Usa el botón de abajo para revisar y gestionar tus detalles de pago a
        través de Stripe.
      </template>
      <template #action><Button @click="openStripeCustomerPortal"> Gestionar en Stripe </Button> </template>
    </FeedbackCard>
  </div>
</template>
