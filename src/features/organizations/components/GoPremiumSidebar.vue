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
import { useMutation, useQuery } from "@tanstack/vue-query";

const openModel = defineModel<boolean>("open");

const authStore = useAuthStore();
const premiumPlanQuery = useQuery({
  queryKey: ["premium-plan"],
  async queryFn() {
    return await supabase
      .from("plans")
      .select("*")
      .eq("name", "premium")
      .single();
  },
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
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent class="overflow-y-auto w-full">
      <SheetHeader>
        <SheetTitle>¡Hazte PRO Hoy!</SheetTitle>
        <SheetDescription>
          <img src="/user_computer.svg" class="w-48 h-48 mx-auto mb-4" />

          <ul class="list-disc pl-4">
            <li>
              Hasta
              {{ premiumPlanQuery.data.value?.data?.max_customers }} clientes y
              {{ premiumPlanQuery.data.value?.data?.max_products }} productos
            </li>
            <li>
              Hasta
              {{ premiumPlanQuery.data.value?.data?.max_organizations }}
              organizaciones
            </li>
            <li>Página pública para compartir inventario con clientes</li>
            <li>Estadísticas avanzadas</li>
            <li>Monedero electrónico para tus clientes</li>
          </ul>
        </SheetDescription>
      </SheetHeader>
      <SheetFooter class="flex flex-row gap-2 mt-4">
        <Button
          :disabled="createStripeCheckoutMutation.isPending.value"
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
