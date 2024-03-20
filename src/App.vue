<script setup lang="ts">
import { onMounted, watchEffect } from "vue";
import { supabase } from "./config/supabase";
import { useAuthStore } from "@/stores";
import { useOrganizationList } from "@/features/organizations";
import { useRoleQuery } from "./features/global/composables/useRoleQueries";

const authStore = useAuthStore();
const roleQuery = useRoleQuery();
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
</script>

<template>
  <router-view />
</template>
