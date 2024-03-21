<script setup lang="ts">
import {
  Sheet,
  Button,
  Input,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  Textarea,
  SheetFooter,
} from "@/components/ui";
import { toRef, watch } from "vue";
import { z } from "zod";
import {
  CreateSubscription,
  Subscription,
  UpdateSubscription,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

type CreateOrEditSidebarProps = {
  isLoading?: boolean;
  subscription?: Subscription | null;
};

const openModel = defineModel<boolean>("open");
const props = withDefaults(defineProps<CreateOrEditSidebarProps>(), {
  isLoading: false,
  subscription: null,
});
const emit = defineEmits<{
  (e: "save", formValues: CreateSubscription | UpdateSubscription): void;
}>();

const locale = {
  create: {
    title: "Crear suscripción",
    subtitle: "Crea rápidamente un nuevo suscripción para tu inventario.",
  },
  update: {
    title: "Actualizar suscripción",
    subtitle: "Actualiza rápidamente un suscripción de tu inventario.",
  },
};
const initialForm = {
  plan_id: null,
  user_id: null,
  start_date: new Date().toISOString(),
  end_date: (() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);

    return currentDate.toISOString();
  })(),
};

const formSchema = toTypedSchema(
  z.object({
    plan_id: z.string().uuid().min(1, "Plan es requerido"),
    user_id: z.string().uuid().min(1, "Usuario es requerido"),
    start_date: z.string().datetime(),
    end_date: z.string().datetime().nullable().optional(),
    subscription_id: z.string().uuid().optional(),
  })
);
const formInstance = useForm<CreateSubscription | UpdateSubscription>({
  validationSchema: formSchema,
});

const formMode = toRef(() => (props.subscription ? "update" : "create"));

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  if (typeof formValues.subscription_id === "undefined") {
    delete formValues.subscription_id;
  }

  emit("save", formValues);
});

watch(
  () => props.subscription,
  (nextSubscription) => {
    if (nextSubscription) {
      formInstance.resetForm({
        values: {
          plan_id: nextSubscription.plan_id ?? "",
          user_id: nextSubscription.user_id ?? "",
          start_date: nextSubscription.start_date ?? "",
          end_date: nextSubscription.end_date ?? "",
          subscription_id: nextSubscription.id,
        },
      });
    } else {
      formInstance.resetForm({ values: initialForm }, { force: true });
    }
  }
);
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent side="right" class="overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          {{ locale[formMode].title }}
        </SheetTitle>
        <SheetDescription>
          {{ locale[formMode].subtitle }}
        </SheetDescription>
      </SheetHeader>
      <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
        <FormField v-slot="{ componentField }" name="image_url">
          <FormItem v-auto-animate>
            <FormLabel>Imagen de suscripción</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="URL de la imagen de tu suscripción"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="name">
          <FormItem v-auto-animate>
            <FormLabel>Nombre de suscripción</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="Ingresa el nombre de suscripción"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="description">
          <FormItem v-auto-animate>
            <FormLabel>Descripción de suscripción</FormLabel>
            <FormControl>
              <Textarea
                type="text"
                placeholder="Ingresa la descripción de suscripción"
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
                type="number"
                placeholder="Ingresa las unidades disponibles de suscripción"
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
                type="number"
                placeholder="Ingresa el costo unitario de suscripción"
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
                type="number"
                placeholder="Ingresa el precio de venta del suscripción"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <SheetFooter class="gap-4 sm:gap-0">
          <Button :disabled="isLoading" type="submit" class="w-full"
            >Guardar</Button
          >
          <Button
            :disabled="isLoading"
            @click="openModel = false"
            variant="outline"
            type="button"
            >Cancelar</Button
          >
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
