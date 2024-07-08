<script setup lang="ts">
import { Spinner } from "@/components";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui";
import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores";
import { useMutation } from "@tanstack/vue-query";
import { toRef } from "vue";

const openModel = defineModel<boolean>("open");

const authStore = useAuthStore();
const createStripeCheckoutMutation = useMutation({
  mutationFn: createStripeCheckout,
});

const isSubscribeButtonDisabled = toRef(
  () =>
    !authStore.authedUser?.stripe_customer_id ||
    createStripeCheckoutMutation.isPending.value
);

async function createStripeCheckout() {
  const premiumPlanResponse = await supabase
    .from("plans")
    .select("*")
    .eq("name", "premium")
    .single();
  const customerId = authStore.authedUser?.stripe_customer_id;
  const priceId = premiumPlanResponse.data?.stripe_price_id;
  const email = authStore.authedUser?.email;
  if (!email || !priceId || !customerId)
    throw new Error("Unable to create stripe checkout session, missing params");
  const response = await supabase.functions.invoke(
    "create-stripe-checkout-session",
    {
      body: JSON.stringify({
        customer_id: customerId,
        price_id: priceId,
        cancel_url: window.location.href,
        success_url: window.location.href,
      }),
    }
  );

  if (!response?.data?.url) throw new Error("Checkout session url not found");

  window.location.href = response.data.url;
}
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle>¡Hazte Premium Hoy!</SheetTitle>
        <SheetDescription>
          Suscríbete ahora para disfrutar de todos los beneficios exclusivos de
          nuestra membresía premium. Accede a contenido exclusivo, soporte
          prioritario y mucho más. Haz clic en el botón de abajo para completar
          tu suscripción a través de Stripe y mejorar tu experiencia al máximo.
        </SheetDescription>
      </SheetHeader>
      <SheetFooter class="flex flex-row gap-2">
        <Button
          :disabled="isSubscribeButtonDisabled"
          @click="createStripeCheckoutMutation.mutate()"
          type="button"
          class="w-full"
        >
          <div class="flex">
            <Spinner
              v-if="createStripeCheckoutMutation.isPending.value"
              class="mr-3"
            />
            Suscribirse
          </div>
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
