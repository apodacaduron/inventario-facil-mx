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
import { ref } from 'vue';
import { FeedbackCard } from '@/features/global';
import { LockClosedIcon } from '@heroicons/vue/24/outline';

const isResetPasswordSuccessful = ref(false);

const { toast } = useToast();
const router = useRouter();
const resetPasswordForEmailMutation = useMutation({
  mutationFn: resetPasswordForEmail,
});
function resetPasswordForEmail(formValues: { email: string }) {
  return supabase.auth.resetPasswordForEmail(formValues.email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });
}
const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, 'Correo es requerido')
      .email('Ingresa un correo válido'),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (formValues) => {
  const response = await resetPasswordForEmailMutation.mutateAsync(formValues);
  const hasError = Boolean(response?.error);
  if (hasError) {
    toast({
      title: 'Uh oh! Something went wrong.',
      description: response?.error?.message ?? 'There was a problem with your request.',
      variant: 'destructive',
    });
    return;
  }
  isResetPasswordSuccessful.value = true;
  setTimeout(() => {
    router.push('/');
  }, 10_000);
});
</script>

<template>
  <AuthLayout>
    <FeedbackCard class="mt-8" v-if="isResetPasswordSuccessful">
      <template #icon><LockClosedIcon class="w-4 h-4" /> </template>
      <template #title>
        Enviamos un correo para reestablecer tu contraseña
      </template>
      <template #description>
        Revisa el correo que nos proporcionaste y haz click en el link para
        reestablecer tu contraseña
      </template>
    </FeedbackCard>
    <template v-else>
      <div class="w-full max-w-md mx-auto px-6 py-3.5">
        <h1 class="mt-8 mb-2 text-2xl lg:text-3xl">Recupera tu acceso</h1>
        <span class="text-sm">
          Restablece tu contraseña con facilidad y seguridad
        </span>
      </div>
      <div class="divide-y w-full max-w-md mx-auto px-6">
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

          <Button
            :disabled="resetPasswordForEmailMutation.isPending.value"
            type="submit"
            >Enviar</Button
          >
        </form>
      </div>
    </template>
  </AuthLayout>
</template>
