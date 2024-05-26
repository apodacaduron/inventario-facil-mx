<script setup lang="ts">
import { supabase } from '@/config/supabase';
import { AuthLayout } from '@/features/auth';
import { Input, Button, useToast } from '@/components/ui';
import { useMutation } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { analytics } from '@/config/analytics';

const { toast } = useToast();
const router = useRouter();
const signInWithPasswordMutation = useMutation({
  mutationFn: signInWithPassword,
});
function signInWithPassword(formValues: { email: string; password: string }) {
  return supabase.auth.signInWithPassword(formValues);
}
const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, 'Correo es requerido')
      .email('Ingresa un correo válido'),
    password: z.string().min(1, 'Contraseña es requerida'),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (formValues) => {
  const response = await signInWithPasswordMutation.mutateAsync(formValues);
  const hasError = Boolean(response?.error);
  if (hasError) {
    toast({
      title: 'Uh oh! Something went wrong.',
      description: response?.error?.message ?? 'There was a problem with your request.',
      variant: 'destructive',
    });
    return;
  }

  analytics.event('sign-in', { 'event_category': 'authentication', method: 'Credentials' });
  router.push('/');
});
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto px-6 py-3.5">
      <h1 class="mt-8 mb-2 text-2xl lg:text-3xl">Bienvenido</h1>
      <span class="text-sm"> Inicia sesión con tu cuenta </span>
    </div>
    <div class="divide-y w-full max-w-md mx-auto px-6">
      <div class="pb-4 my-4">
        <Button
          @click="
            supabase.auth.signInWithOAuth({
              provider: 'google',
            }).then(() => analytics.event('sign-in', { 'event_category': 'authentication', method: 'Google' }))
          "
          class="w-full"
          variant="outline"
        >
          <img src="/google-logo.svg" class="w-4 h-4 mr-2" />
          Inicia sesión con Google
        </Button>
      </div>
      <form @submit="onSubmit" class="pt-6 flex flex-col gap-6">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem v-auto-animate>
            <FormLabel>Correo electrónico</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Ingresa tu correo"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem v-auto-animate>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña"
                v-bind="componentField"
              />
            </FormControl>
            <FormDescription class="text-right">
              <router-link
                to="/auth/forgot"
                class="font-medium text-primary hover:underline"
                >Olvidaste tu contraseña?</router-link
              >
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button
          :disabled="signInWithPasswordMutation.isPending.value"
          type="submit"
          >Iniciar sesión</Button
        >
        <div class="text-center">
          Aún no tienes una cuenta?
          <router-link
            to="/auth/sign-up"
            class="font-medium text-primary hover:underline"
            >Regístrate ahora</router-link
          >
        </div>
      </form>
    </div>
  </AuthLayout>
</template>
