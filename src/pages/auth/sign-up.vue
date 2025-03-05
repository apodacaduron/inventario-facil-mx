<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { AuthLayout } from "@/features/auth";
import { Button } from "@/components/ui";
import { analytics } from "@/config/analytics";
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto lg:px-6 py-3.5">
      <h1 class="text-2xl lg:text-3xl">Crea una cuenta</h1>
      <span class="text-sm"> Crea tu cuenta gratis </span>
    </div>
    <div class="divide-y w-full max-w-md mx-auto lg:px-6 mb-12">
      <div class="my-4">
        <Button
          @click="
            supabase.auth
              .signInWithOAuth({
                provider: 'google',
              })
              .then(() =>
                analytics.event('sign-up', {
                  event_category: 'authentication',
                  method: 'Google',
                })
              )
          "
          class="w-full"
          variant="outline"
        >
          <img src="/google-logo.svg" class="w-4 h-4 mr-2" />Regístrate con
          Google
        </Button>
      </div>
    </div>
  </AuthLayout>
</template>
