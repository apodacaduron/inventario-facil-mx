<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { AuthLayout } from "@/features/auth";
import { Button } from "@/components/ui";
import { analytics } from "@/config/analytics";
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto lg:px-6 py-3.5">
      <h1 class="text-2xl lg:text-3xl">Bienvenido</h1>
      <span class="text-sm"> Inicia sesión con tu cuenta </span>
    </div>
    <div class="divide-y w-full max-w-md mx-auto lg:px-6 mb-6">
      <div class="my-4">
        <Button
          @click="
            supabase.auth
              .signInWithOAuth({
                provider: 'google',
              })
              .then(() =>
                analytics.event('sign-in', {
                  event_category: 'authentication',
                  method: 'Google',
                })
              )
          "
          class="w-full"
          variant="outline"
        >
          <img src="/google-logo.svg" class="w-4 h-4 mr-2" />
          Inicia sesión con Google
        </Button>
      </div>
    </div>
  </AuthLayout>
</template>
