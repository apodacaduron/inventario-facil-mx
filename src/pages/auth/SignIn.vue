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
        .min(1, "Email is required!")
        .email("Must be a valid email"),
      password: z.string().min(1, "Password is required!"),
    })
  ),
  async onSubmit(formValues) {
    const response = await asyncSignInWithPassword.execute(0, formValues);
    if (response?.data.session) {
      router.push("/dashboard");
    } else {
      alert(response?.error?.message);
    }
  },
});
const { value: email, attrs: emailAttrs } = register("email");
const { value: password, attrs: passwordAttrs } = register("password");
</script>

<template>
  <AuthLayout>
    <div class="w-full max-w-md mx-auto px-6 py-3.5">
      <h1 class="mt-8 mb-2 text-2xl lg:text-3xl">Welcome back</h1>
      <span class="text-sm"> Sign in to your account </span>
    </div>
    <div class="divide-y w-full max-w-md mx-auto">
      <div class="pb-4">
        <InputGroup>
          <Button label="Sign in with Google">
            <template #icon><v-icon name="fc-google" /></template>
          </Button>
        </InputGroup>
      </div>
      <form @submit="handleSubmit" class="pt-4">
        <InputGroup label="Email" name="email">
          <Input
            placeholder="Your email"
            type="email"
            v-model="email"
            :errors="errors.email"
            v-bind="emailAttrs"
          />
        </InputGroup>
        <InputGroup label="Password" name="password">
          <Input
            placeholder="Your password"
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
            label="Submit"
            variant="primary"
            type="submit"
          />
        </InputGroup>
        <InputGroup>
          <div class="text-center">
            Don't have an account yet?
            <router-link
              to="/auth/sign-up"
              class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
              >Sign up now</router-link
            >
          </div>
        </InputGroup>
      </form>
    </div>
  </AuthLayout>
</template>
