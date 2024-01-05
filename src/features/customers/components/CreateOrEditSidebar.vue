<script setup lang="ts">
import {
  Sheet,
  Button,
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
  SheetFooter,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui";
import { watch } from "vue";
import { z } from "zod";
import {
  CreateCustomer,
  Customer,
  TRUST_STATUS,
  UpdateCustomer,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";

type CreateOrEditSidebarProps = {
  mode?: "create" | "update";
  open?: boolean;
  isLoading?: boolean;
  customer?: Customer | null;
};

const props = withDefaults(defineProps<CreateOrEditSidebarProps>(), {
  mode: "create",
  open: false,
  isLoading: false,
});
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", formValues: CreateCustomer | UpdateCustomer): void;
}>();

const locale = {
  create: {
    title: "Crear cliente",
    subtitle: "Crea rápidamente un nuevo cliente para tu inventario.",
  },
  update: {
    title: "Actualizar cliente",
    subtitle: "Actualiza rápidamente un cliente de tu inventario.",
  },
};

const initialForm: CreateCustomer | UpdateCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  map_url: "",
  trust_status: "trusted",
  notes: "",
};

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, "Nombre de cliente es requerido"),
    phone: z.coerce.string().length(10, "Telefono es requerido"),
    email: z.string().email("Debe ser un correo valido").or(z.literal("")),
    address: z.string().or(z.literal("")),
    map_url: z.string().url("Debe ser un url valido").or(z.literal("")),
    notes: z.string().or(z.literal("")),
    trust_status: z.enum(TRUST_STATUS),
    customer_id: z.string().uuid().optional(),
  })
);

const formInstance = useForm<CreateCustomer | UpdateCustomer>({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  emit("save", formValues);
});

function closeSidebar(isOpen: boolean, forced: boolean) {
  if (isOpen && !forced) return;
  forceCloseSidebar();
}
function forceCloseSidebar() {
  formInstance.resetForm();
  emit("close");
}

watch(
  () => props.open,
  (nextIsOpen) => {
    if (nextIsOpen) return;
    formInstance.resetForm({
      values: initialForm,
    });
  }
);
watch(
  () => props.customer,
  (nextCustomer) => {
    if (!nextCustomer) return;
    formInstance.resetForm({
      values: {
        name: nextCustomer.name ?? "",
        phone: nextCustomer.phone ?? "",
        email: nextCustomer.email ?? "",
        address: nextCustomer.address ?? "",
        map_url: nextCustomer.map_url ?? "",
        customer_id: nextCustomer.id,
        trust_status: nextCustomer.trust_status ?? "trusted",
        notes: nextCustomer.notes ?? "",
      },
    });
  }
);
</script>

<template>
  <Sheet :open="open" @update:open="closeSidebar">
    <SheetContent side="right">
      <SheetHeader>
        <SheetTitle>{{ locale[mode].title }}</SheetTitle>
        <SheetDescription>{{ locale[mode].subtitle }}</SheetDescription>
      </SheetHeader>
      <div class="space-y-6 pb-16">
        <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
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
                <Textarea
                  placeholder="Notas de cliente"
                  v-bind="componentField"
                />
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
                    <SelectValue
                      placeholder="Escoge un estado de confiabilidad"
                    />
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
          <SheetFooter class="gap-4 sm:gap-0">
            <Button :disabled="isLoading" type="submit" class="w-full"
              >Guardar</Button
            >
            <Button
              type="button"
              :disabled="isLoading"
              @click="forceCloseSidebar"
              variant="outline"
              >Cancelar</Button
            >
          </SheetFooter>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</template>
