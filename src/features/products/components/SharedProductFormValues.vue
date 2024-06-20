<script setup lang="ts">
import {
  Input,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  Textarea,
} from "@/components/ui";
</script>

<template>
  <FormField v-slot="{ componentField }" name="name">
    <FormItem v-auto-animate>
      <FormLabel>Nombre de producto</FormLabel>
      <FormControl>
        <Input
          type="text"
          placeholder="Ingresa el nombre de producto"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="description">
    <FormItem v-auto-animate>
      <FormLabel>Descripción de producto</FormLabel>
      <FormControl>
        <Textarea
          type="text"
          placeholder="Ingresa la descripción de producto"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="current_stock">
    <FormItem v-auto-animate>
      <FormLabel>Unidades disponibles</FormLabel>
      <FormControl>
        <Input
          inputmode="numeric"
          type="number"
          placeholder="Ingresa las unidades disponibles de producto"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="unit_price">
    <FormItem v-auto-animate>
      <FormLabel>Precio unitario</FormLabel>
      <FormControl>
        <Input
          inputmode="numeric"
          placeholder="Ingresa el costo unitario de producto"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="retail_price">
    <FormItem v-auto-animate>
      <FormLabel>Precio de venta</FormLabel>
      <FormControl>
        <Input
          inputmode="numeric"
          placeholder="Ingresa el precio de venta del producto"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
