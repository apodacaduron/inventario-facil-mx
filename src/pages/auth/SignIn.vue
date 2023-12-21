<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { AuthLayout } from "@/features/auth";
import { InputGroup, Input, Button } from "@flavorly/vanilla-components";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import { useAsyncState } from "@vueuse/core";
import { useRouter } from "vue-router";
import z from "zod";

const router = useRouter();
const asyncSignInWithPassword = useAsyncState(
  (formValues) => supabase.auth.signInWithPassword(formValues),
  null
);
const { register, handleSubmit, errors } = useForm({
  initialValues: {
    email: "",
    password: "",
  },
  validate: zodResolver(
    z.object({
      email: z
        .string()
        .min(1, "Correo es requerido")
        .email("Ingresa un correo válido"),
      password: z.string().min(1, "Contraseña es requerida"),
    })
  ),
  async onSubmit(formValues) {
    const response = await asyncSignInWithPassword.execute(0, formValues);
    if (response?.error) {
      alert(response?.error?.message);
    } else {
      router.push("/");
    }
  },
});
const { value: email, attrs: emailAttrs } = register("email");
const { value: password, attrs: passwordAttrs } = register("password");
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto px-6 py-3.5">
      <h1 class="mt-8 mb-2 text-2xl lg:text-3xl">Bienvenido</h1>
      <span class="text-sm"> Inicia sesión con tu cuenta </span>
    </div>
    <div class="divide-y w-full max-w-md mx-auto">
      <div class="pb-4">
        <InputGroup>
          <Button
            @click="
              supabase.auth.signInWithOAuth({
                provider: 'google',
              })
            "
            label="Inicia sesión con Google"
          >
            <template #icon><img src="/google-logo.svg" /></template>
          </Button>
        </InputGroup>
      </div>
      <form @submit="handleSubmit" class="pt-4">
        <InputGroup label="Correo electrónico" name="email">
          <Input
            placeholder="Ingresa tu correo"
            type="email"
            v-model="email"
            :errors="errors.email"
            v-bind="emailAttrs"
          />
        </InputGroup>
        <InputGroup label="Contraseña" name="password">
          <Input
            placeholder="Ingresa tu contraseña"
            type="password"
            v-model="password"
            :errors="errors.password"
            v-bind="passwordAttrs"
          />
        </InputGroup>
        <InputGroup>
          <Button
            :loading="asyncSignInWithPassword.isLoading.value"
            :disabled="asyncSignInWithPassword.isLoading.value"
            label="Iniciar sesión"
            variant="primary"
            type="submit"
          />
        </InputGroup>
        <InputGroup>
          <div class="text-center">
            Aún no tienes una cuenta?
            <router-link
              to="/auth/sign-up"
              class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >Regístrate ahora</router-link
            >
          </div>
        </InputGroup>
      </form>
    </div>
  </AuthLayout>
</template>
