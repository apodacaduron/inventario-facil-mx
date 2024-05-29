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
import { useMediaQuery } from "@vueuse/core";
import { toRef } from "vue";

const openModel = defineModel<boolean>("open");

const isDesktop = useMediaQuery("(min-width: 768px)");

const stripePaymentLink = toRef(() => {
  return import.meta.env.VITE_STRIPE_PAYMENT_LINK;
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
        <a :href="stripePaymentLink"><Button type="button" class="w-full"> Suscribirse </Button></a>
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
          <a :href="stripePaymentLink"><Button type="button" class="w-full"> Suscribirse </Button></a>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
