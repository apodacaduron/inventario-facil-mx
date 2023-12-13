<script setup lang="ts">
import { AuthLayout } from "@/features/auth";
import { InputGroup, Input, Button } from "@flavorly/vanilla-components";
import { useForm } from "@vorms/core";
import { zodResolver } from "@vorms/resolvers/zod";
import z from "zod";

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
  onSubmit(formValues) {
    console.log(formValues, errors);
  },
});
const { value: email } = register("email");
const { value: password } = register("password");
</script>

<template>
  <AuthLayout>
    <form @submit="handleSubmit" class="w-full max-w-md mx-auto">
      <InputGroup label="Email" name="email">
        <Input
          name="email"
          placeholder="Your email"
          type="email"
          v-model="email"
          :errors="errors.email"
        />
      </InputGroup>
      <InputGroup label="Password" name="password">
        <Input
          name="password"
          placeholder="Your password"
          type="password"
          v-model="password"
          :errors="errors.password"
        />
      </InputGroup>
      <InputGroup>
        <Button label="Submit" variant="primary" type="submit" />
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
  </AuthLayout>
</template>
