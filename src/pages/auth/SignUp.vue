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
const asyncSignUp = useAsyncState(
  (formValues) => supabase.auth.signUp(formValues),
  null
);
const { register, handleSubmit, errors } = useForm({
  initialValues: {
    email: "",
    password: "",
    confirmPassword: "",
  },
  validate: zodResolver(
    z
      .object({
        email: z
          .string()
          .min(1, "Correo es requerido")
          .email("Ingresa un correo válido"),
        password: z
          .string()
          .min(8, "La contraseña debe tener al menos 8 caracteres"),
        confirmPassword: z.string().min(1, "Confirmar contraseña es requerido"),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      })
  ),
  async onSubmit(formValues) {
    const response = await asyncSignUp.execute(0, formValues);
    if (response?.error) {
      alert(response?.error?.message);
    } else {
      alert(
        "¡Enhorabuena! Tu registro se ha completado con éxito. Hemos enviado un correo electrónico a tu dirección de correo proporcionada. Por favor, verifica tu bandeja de entrada y sigue las instrucciones para confirmar tu cuenta. ¡Gracias por unirte!"
      );
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 5000);
    }
  },
});
const { value: email, attrs: emailAttrs } = register("email");
const { value: password, attrs: passwordAttrs } = register("password");
const { value: confirmPassword, attrs: confirmPasswordAttrs } =
  register("confirmPassword");
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto px-6 py-3.5">
      <h1 class="mt-8 mb-2 text-2xl lg:text-3xl">Crea una cuenta</h1>
      <span class="text-sm"> Crea tu cuenta gratis </span>
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
            label="Regístrate con Google"
          >
            <template #icon><v-icon name="fc-google" /></template>
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
        <InputGroup label="Confirma contraseña" name="confirmPassword">
          <Input
            placeholder="Confirma tu contraseña"
            type="password"
            v-model="confirmPassword"
            :errors="errors.confirmPassword"
            v-bind="confirmPasswordAttrs"
          />
        </InputGroup>
        <InputGroup>
          <Button
            :loading="asyncSignUp.isLoading.value"
            :disabled="asyncSignUp.isLoading.value"
            label="Comenzar ahora"
            variant="primary"
            type="submit"
          />
        </InputGroup>
        <InputGroup>
          <div class="text-center">
            Ya tienes una cuenta?
            <router-link
              to="/auth/sign-in"
              class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >Inicia sesión</router-link
            >
          </div>
        </InputGroup>
      </form>
    </div>
  </AuthLayout>
</template>
