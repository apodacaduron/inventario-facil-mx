<script setup lang="ts">
import { Button, Separator } from "@/components/ui";
import { supabase } from "@/config/supabase";
import { useMutation } from "@tanstack/vue-query";

const stripeCustomerPortalMutation = useMutation({
  mutationFn: openStripeCustomerPortal,
});

async function openStripeCustomerPortal() {
  const response = await supabase.functions.invoke(
    "create-stripe-customer-portal-session",
    {
      body: JSON.stringify({
        return_url: window.location.href,
      }),
    }
  );

  if (!response?.data?.url) throw new Error("Checkout session url not found");

  window.location.href = response.data.url;
}
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Pagos</h3>
    <p class="text-sm text-muted-foreground">
      Gestiona tus pagos a traves de la plataforma segura de Stripe.
    </p>
  </div>

  <Separator />

  <div class="flex justify-start mt-4">
    <Button
      :disabled="stripeCustomerPortalMutation.isPending.value"
      @click="stripeCustomerPortalMutation.mutate"
    >
      Gestionar suscripción
    </Button>
  </div>
</template>
