<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { AuthLayout } from "@/features/auth";
import { Input, Button } from "@/components/ui";
import { useMutation } from "@tanstack/vue-query";
import { useRouter } from "vue-router";
import z from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { analytics } from "@/config/analytics";
import { notifyIfHasError } from "@/features/global";

const router = useRouter();
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto lg:px-6 py-3.5">
      <h1 class="text-2xl lg:text-3xl">Bienvenido</h1>
      <span class="text-sm"> Inicia sesión con tu cuenta </span>
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
