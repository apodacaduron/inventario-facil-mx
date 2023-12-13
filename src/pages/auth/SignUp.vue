<script setup lang="ts">
import { supabase } from "@/config/supabase";

async function signUpNewUser() {
  const { data, error } = await supabase.auth.signUp({
    email: "apodacaduron@gmail.com",
    password: "Vuxa7613",
    options: {
      emailRedirectTo: "localhost:5173",
    },
  });
}
</script>

<template>
  <div>
    Sign up
    <button @click="signUpNewUser">Sign up</button>
  </div>
</template>
