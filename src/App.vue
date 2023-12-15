<script setup lang="ts">
import { onMounted } from "vue";
import { supabase } from "./config/supabase";
import { useAuthStore } from "@/stores";
import { useOrganizationList } from "@/features/organizations";

const authStore = useAuthStore();
useOrganizationList();

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    authStore.setSession(data.session);
  });

  supabase.auth.onAuthStateChange((_, _session) => {
    authStore.setSession(_session);
  });
});
</script>

<template>
  <router-view />
</template>
