<script setup lang="ts">
import { onMounted, toRef, watchEffect } from "vue";
import { supabase } from "./config/supabase";
import { useAuthStore, useOrganizationStore } from "@/stores";
import { useUserOrganizationsQuery } from "@/features/organizations";
import Toaster from "@/components/ui/toast/Toaster.vue";
import { useOnline } from "@vueuse/core";
import { OfflineBanner } from "./features/global";
import { useAuthedUserDataQuery } from "./features/admin";

const authStore = useAuthStore();
const organizationStore = useOrganizationStore();
const authedUserDataQuery = useAuthedUserDataQuery({
  options: {
    enabled: toRef(() => authStore.isLoggedIn),
  },
});
const online = useOnline();
const userOrganizationsQuery = useUserOrganizationsQuery({
  options: {
    enabled: toRef(() => authStore.isLoggedIn),
    userId: toRef(() => authStore.session?.user.id),
  },
})

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    authStore.setSession(data.session);
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    authStore.setSession(_session);
  });
});

watchEffect(() => {
  authStore.setAuthedUserData(
    authedUserDataQuery.data.value?.data?.find(Boolean) ?? null
  );
});
watchEffect(() => {
  organizationStore.setUserOrganizations(
    userOrganizationsQuery.data.value?.data ?? null
  );
});
watchEffect(async () => {
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
});
</script>

<template>
  <OfflineBanner v-if="!online" />
  <Toaster />
  <router-view />
</template>
