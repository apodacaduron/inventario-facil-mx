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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FeedbackCard, notifyIfHasError } from "@/features/global";
import { ref } from "vue";
import { analytics } from "@/config/analytics";

const isSignUpSuccessful = ref(false);

const router = useRouter();
const signUpMutation = useMutation({
  mutationFn: signUp,
});
async function signUp(formValues: {
  email: string;
  full_name: string;
  password: string;
}) {
  const response = await supabase.auth.signUp({
    ...formValues,
    options: {
      data: {
        full_name: formValues.full_name,
        email: formValues.email,
      },
    },
  });

  return response;
}

const formSchema = toTypedSchema(
  z
    .object({
      email: z
        .string()
        .min(1, "Correo es requerido")
        .email("Ingresa un correo válido"),
      full_name: z.string().min(1, "Nombre es requerido"),
      password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres"),
      confirmPassword: z.string().min(1, "Confirmar contraseña es requerido"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (formValues) => {
  const { error } = await signUpMutation.mutateAsync(formValues);
  notifyIfHasError(error);
  analytics.event("sign-up", {
    event_category: "authentication",
    method: "Credentials",
  });
  isSignUpSuccessful.value = true;
  setTimeout(() => {
    router.push("/auth/sign-in");
  }, 10_000);
});
</script>

<template>
  <AuthLayout>
    <FeedbackCard class="mt-8" v-if="isSignUpSuccessful">
      <template #icon><LockClosedIcon class="w-4 h-4" /> </template>
      <template #title> Enviamos un correo para confirmar tu cuenta </template>
      <template #description>
        Revisa el correo que nos proporcionaste y haz click en el link para
        confirmar tu cuenta
      </template>
    </FeedbackCard>
    <template v-else>
      <div class="w-full max-w-md mx-auto px-6 py-3.5">
        <h1 class="mt-4 mb-2 text-2xl lg:text-3xl">Crea una cuenta</h1>
        <span class="text-sm"> Crea tu cuenta gratis </span>
      </div>
      <div class="divide-y w-full max-w-md mx-auto px-6 mb-12">
        <div class="pb-4 my-4">
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
          <FormField v-slot="{ componentField }" name="full_name">
            <FormItem v-auto-animate>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Ingresa tu nombre"
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
          <Button
            :loading="signUpMutation.isPending.value"
            :disabled="signUpMutation.isPending.value"
            label=""
            type="submit"
            >Comenzar ahora</Button
          >
          <div class="text-center">
            ¿Ya tienes una cuenta?
            <router-link
              to="/auth/sign-in"
              class="font-medium text-primary hover:underline"
              >Inicia sesión</router-link
            >
          </div>
        </form>
      </div>
    </template>
  </AuthLayout>
</template>
