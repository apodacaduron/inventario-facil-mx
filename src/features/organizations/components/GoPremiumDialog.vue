<script setup lang="ts">
import { Spinner } from "@/components";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui";
import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores";
import { useMutation } from "@tanstack/vue-query";
import { useMediaQuery } from "@vueuse/core";
import { toRef } from "vue";

const openModel = defineModel<boolean>("open");

const isDesktop = useMediaQuery("(min-width: 768px)");
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
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>¡Hazte Premium Hoy!</DialogTitle>
        <DialogDescription>
          Suscríbete ahora para disfrutar de todos los beneficios exclusivos de
          nuestra membresía premium. Accede a contenido exclusivo, soporte
          prioritario y mucho más. Haz clic en el botón de abajo para completar
          tu suscripción a través de Stripe y mejorar tu experiencia al máximo.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
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
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>¡Hazte Premium Hoy!</DrawerTitle>
          <DrawerDescription>
            Suscríbete ahora para disfrutar de todos los beneficios exclusivos
            de nuestra membresía premium. Accede a contenido exclusivo, soporte
            prioritario y mucho más. Haz clic en el botón de abajo para
            completar tu suscripción a través de Stripe y mejorar tu experiencia
            al máximo.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
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
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
