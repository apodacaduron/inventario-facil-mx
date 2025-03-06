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
});

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
watchEffect(() => {
  organizationStore.setIsUserOrganizationsLoading(
    userOrganizationsQuery.isLoading.value
  );
});
</script>

<template>
  <OfflineBanner v-if="!online" />
  <Toaster />
  <router-view />
</template>
