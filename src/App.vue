<script setup lang="ts">
import { onMounted, watchEffect } from "vue";
import { supabase } from "./config/supabase";
import { useAuthStore, useSubscriptionStore } from "@/stores";
import { useOrganizationList } from "@/features/organizations";
import { useRoleQuery } from "./features/global/composables/useRoleQueries";
import { useCurrentSubscriptionQuery } from "./features/subscriptions";
import Toaster from '@/components/ui/toast/Toaster.vue'

const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();
const roleQuery = useRoleQuery();
const currentSubscription = useCurrentSubscriptionQuery()
useOrganizationList();

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    authStore.setSession(data.session);
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    authStore.setSession(_session);
  });
});

watchEffect(() => {
  authStore.setRole(roleQuery.data.value?.data?.i_roles?.role_name);
});
watchEffect(() => {
  subscriptionStore.setCurrentSubscription(currentSubscription.data.value?.data);
});
</script>

<template>
  <Toaster />
  <router-view />
</template>
