<script setup lang="ts">
import { Spinner } from "@/components";
import {
  Button,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui";
import { supabase } from "@/config/supabase";
import PricingGrid from "@/features/home/components/PricingGrid.vue";
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
      </SheetHeader>
      <PricingGrid />
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
