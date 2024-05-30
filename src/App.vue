<script setup lang="ts">
import { onMounted, toRef, watchEffect } from "vue";
import { supabase } from "./config/supabase";
import { useAuthStore } from "@/stores";
import { useOrganizationList } from "@/features/organizations";
import Toaster from '@/components/ui/toast/Toaster.vue'
import { useOnline } from "@vueuse/core";
import { OfflineBanner } from "./features/global";
import { useAuthedUserDataQuery } from "./features/admin";

const authStore = useAuthStore();
const authedUserDataQuery = useAuthedUserDataQuery({ options: {
  enabled: toRef(() => authStore.isLoggedIn)
} })
const online = useOnline()
useOrganizationList();

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    authStore.setSession(data.session);
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    authStore.setSession(_session);
  })
});

watchEffect(() => {
  authStore.setAuthedUserData(authedUserDataQuery.data.value?.data?.find(Boolean) ?? null);
});
</script>

<template>
  <OfflineBanner v-if="!online" />
  <Toaster />
  <router-view />
</template>
