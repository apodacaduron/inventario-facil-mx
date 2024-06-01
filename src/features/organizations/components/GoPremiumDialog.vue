<script setup lang="ts">
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
import { useMediaQuery } from "@vueuse/core";
import { watch } from "vue";

const openModel = defineModel<boolean>("open");

const isDesktop = useMediaQuery("(min-width: 768px)");
const authStore = useAuthStore();

async function handleSubscribeClick() {
  const premiumPlanResponse = await supabase
        .from("plans")
        .select('*')
        .eq('name', 'premium')
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

watch(() => openModel.value, async () => {
  if (!openModel.value) return;
  const stripeCustomerId = authStore.authedUser?.stripe_customer_id;
  if (!authStore.authedUser) return;
  if (stripeCustomerId) return;

  const response = await supabase.functions.invoke("create-stripe-customer", {
    body: JSON.stringify({
      user_id: authStore.authedUser.id,
      email: authStore.authedUser.email,
    }),
  });
  if (!response?.data?.customer_id) return;
  authStore.setAuthedUserData({
    ...authStore.authedUser,
    stripe_customer_id: response.data.customer_id,
  });
})
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
        <Button :disabled="!authStore.authedUser?.stripe_customer_id" @click="handleSubscribeClick" type="button" class="w-full">
          Suscribirse
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
          <Button :disabled="!authStore.authedUser?.stripe_customer_id" @click="handleSubscribeClick" type="button" class="w-full">
            Suscribirse
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
