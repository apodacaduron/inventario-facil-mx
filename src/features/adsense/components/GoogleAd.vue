<script setup lang="ts">
import { useOrganizationStore } from "@/stores";
import { onMounted } from "vue";

const organizationStore = useOrganizationStore();

onMounted(() => {
  if (!organizationStore.isPremium) {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }
});
</script>

<template>
  <div v-if="!organizationStore.isPremium">
    <ins
      class="adsbygoogle"
      style="display: block"
      data-ad-client="ca-pub-8254295768324190"
      data-ad-slot="1058555516"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>
