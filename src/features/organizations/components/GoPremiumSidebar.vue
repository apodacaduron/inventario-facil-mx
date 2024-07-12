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
          <ul class="list-disc pl-4">
            <li>Hasta 5000 clientes y 5000 productos</li>
            <li>Hasta 3 organizaciones</li>
            <li>Página pública para compartir inventario con clientes</li>
            <li>Estadísticas avanzadas</li>
            <li>Monedero electrónico para tus clientes</li>
          </ul>
        </SheetDescription>
      </SheetHeader>
      <SheetFooter class="flex flex-row gap-2 mt-4">
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
