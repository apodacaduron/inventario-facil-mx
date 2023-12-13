<script setup lang="ts">
import { supabase } from "@/config/supabase";

async function handleSignOut() {
  await supabase.auth.signOut();
}
</script>

<template>
  Dashboard

  <button @click="handleSignOut">Sign out</button>
</template>
