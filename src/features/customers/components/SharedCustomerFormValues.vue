<script setup lang="ts">
import {
  Input,
  Select,
  FormMessage,
  FormControl,
  FormLabel,
  FormItem,
  FormField,
  Textarea,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@/components/ui";
</script>

<template>
  <FormField v-slot="{ componentField }" name="name">
    <FormItem v-auto-animate>
      <FormLabel>Nombre de cliente</FormLabel>
      <FormControl>
        <Input
          type="text"
          placeholder="Ingresa el nombre de cliente"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="phone">
    <FormItem v-auto-animate>
      <FormLabel>Teléfono de cliente</FormLabel>
      <FormControl>
        <Input
          type="number"
          placeholder="Ingresa el telefono del cliente"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="email">
    <FormItem v-auto-animate>
      <FormLabel>Correo de cliente</FormLabel>
      <FormControl>
        <Input
          type="email"
          placeholder="Ingresa el correo del cliente"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="address">
    <FormItem v-auto-animate>
      <FormLabel>Dirección de cliente</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Ingresa la dirección del cliente"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="map_url">
    <FormItem v-auto-animate>
      <FormLabel>URL de mapa</FormLabel>
      <FormControl>
        <Input
          placeholder="Ingresa el link de mapa del cliente"
          v-bind="componentField"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="notes">
    <FormItem v-auto-animate>
      <FormLabel>Notas</FormLabel>
      <FormControl>
        <Textarea placeholder="Notas de cliente" v-bind="componentField" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>
  <FormField v-slot="{ componentField }" name="trust_status">
    <FormItem v-auto-animate>
      <FormLabel>Estado de confianza</FormLabel>
      <Select v-bind="componentField">
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Escoge un estado de confiabilidad" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="trusted">Confiable</SelectItem>
            <SelectItem value="not_trusted"> No confiable </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
