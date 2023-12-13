<script setup lang="ts">
import { supabase } from "@/config/supabase";
import { AuthLayout } from "@/features/auth";
import { InputGroup, VanillaInput, Button } from "@flavorly/vanilla-components";

import { useField, useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";

const componentName = "sign-in";

const validationSchema = toTypedSchema(
  zod.object({
    email: zod
      .string()
      .min(1, { message: "This is required" })
      .email({ message: "Must be a valid email" }),
    password: zod.string().min(1, { message: "This is required" }),
  })
);

const { handleSubmit, errors } = useForm({
  validationSchema,
});

const onSubmit = handleSubmit(async (formValues) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formValues.email,
    password: formValues.password,
  });
});
</script>

<template>
  <AuthLayout>
    <form @submit="onSubmit" class="w-full max-w-md mx-auto">
      <InputGroup label="Email" name="email">
        <VanillaInput name="email" placeholder="Your email" type="email" />
      </InputGroup>
      <InputGroup label="Password" name="password">
        <VanillaInput
          name="password"
          placeholder="Your password"
          type="password"
        />
      </InputGroup>
      <InputGroup>
        <Button label="Submit" variant="primary" />
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
