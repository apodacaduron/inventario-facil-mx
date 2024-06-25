<script setup lang="ts">
import { Button } from "@/components/ui";
import { FeedbackCard } from "@/features/global";
import { HomeIcon } from "@heroicons/vue/24/outline";
</script>

<template>
  <FeedbackCard class="mt-24">
    <template #icon> 🫠 </template>
    <template #title>Sin autorización</template>
    <template #description
      >Por el momento no podemos acceder la pagina solicitada
    </template>
    <template #action>
      <router-link to="/">
        <Button>
          <HomeIcon class="w-5 h-5 stroke-[2px] mr-2" /> Volver al inicio
        </Button>
      </router-link>
    </template>
  </FeedbackCard>
</template>
