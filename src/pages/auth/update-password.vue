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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { analytics } from '@/config/analytics';

const { toast } = useToast();
const router = useRouter();
const updatePasswordMutation = useMutation({
  mutationFn: updatePassword,
});
function updatePassword(formValues: { password: string }) {
  return supabase.auth.updateUser({ password: formValues.password });
}
const formSchema = toTypedSchema(
  z
    .object({
      password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres'),
      confirmPassword: z.string().min(1, 'Confirmar contraseña es requerido'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (formValues) => {
  const response = await updatePasswordMutation.mutateAsync(formValues);
  const hasError = Boolean(response?.error);
  if (hasError) {
    toast({
      title: 'Uh oh! Something went wrong.',
      description: response?.error?.message ?? 'There was a problem with your request.',
      variant: 'destructive',
    });
    return;
  }

  analytics.event('update-password', { 'event_category': 'authentication' });
  router.push('/');
});
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto px-6 py-3.5">
      <h1 class="mt-8 mb-2 text-2xl lg:text-3xl">Actualiza tu Contraseña</h1>
      <span class="text-sm">
        Restablece tu contraseña con facilidad y seguridad
      </span>
    </div>
    <div class="divide-y w-full max-w-md mx-auto px-6">
      <form @submit="onSubmit" class="pt-6 flex flex-col gap-6">
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
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem v-auto-animate>
            <FormLabel>Confirma contraseña</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Confirma tu contraseña"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button :disabled="updatePasswordMutation.isPending.value" type="submit"
          >Reestablecer contraseña</Button
        >
      </form>
    </div>
  </AuthLayout>
</template>
