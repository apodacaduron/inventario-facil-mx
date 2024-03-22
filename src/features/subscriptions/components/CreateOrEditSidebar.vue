<script setup lang="ts">
import {
  Sheet,
  Button,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  SheetFooter,
  SelectContent,
  SelectGroup,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
} from "@/components/ui";
import { toRef, watch } from "vue";
import { z } from "zod";
import {
  CreateSubscription,
  Subscription,
  UpdateSubscription,
  usePlansQuery,
} from "../composables";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import Select from "@/components/ui/select/Select.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import { CalendarIcon } from "@heroicons/vue/24/outline";

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
  plan_id: "",
  user_id: "",
  start_date: new Date().toISOString(),
  end_date: (() => {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);

    return currentDate.toISOString();
  })(),
  month_amount: "1",
};

const suffixes = new Map([
  // Note: in real-world scenarios, you wouldn’t hardcode the plurals
  // like this; they’d be part of your translation files.
  ["one", "mes"],
  ["other", "meses"],
]);
const pr = new Intl.PluralRules("es-MX");
const formatMonths = (n: number) => {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n} ${suffix}`;
};

const formSchema = toTypedSchema(
  z.object({
    plan_id: z.string().uuid().min(1, "Plan es requerido"),
    user_id: z.string().uuid().min(1, "Usuario es requerido"),
    start_date: z.string().datetime(),
    end_date: z.string().datetime().nullable().optional(),
    subscription_id: z.string().uuid().optional(),
    month_amount: z.preprocess(
      (x) => (x ? x : undefined),
      z.coerce.number().int().min(1).max(12).optional()
    ),
  })
);
const formInstance = useForm({
  initialValues: initialForm,
  validationSchema: formSchema,
});

const plansQuery = usePlansQuery({
  options: {
    enabled: true,
  },
});

const formMode = toRef(() => (props.subscription ? "update" : "create"));

const onSubmit = formInstance.handleSubmit(async (formValues) => {
  if (typeof formValues.subscription_id === "undefined") {
    delete formValues.subscription_id;
  }

  delete formValues.month_amount;

  const nextFormValues = {
    ...formValues,
    start_date: formValues.start_date,
    end_date: formValues.end_date || null,
  };

  emit("save", nextFormValues);
});

watch(
  () => formInstance.values.start_date,
  (nextStartDate) => {
    if (!nextStartDate) return;
    const startDate = new Date(nextStartDate);
    const monthAmount = formInstance.values.month_amount;
    const isCustomAmount = formInstance.values.month_amount === "custom";
    const nextMonthAmount = isCustomAmount ? 1 : Number(monthAmount);
    startDate?.setMonth(startDate.getMonth() + nextMonthAmount);
    const nextEndDate = startDate;

    formInstance.setFieldValue("end_date", nextEndDate.toISOString());
    formInstance.setFieldValue("month_amount", nextMonthAmount.toString());
  }
);
watch(
  () => formInstance.values.end_date,
  () => {
    if (!formInstance.isFieldTouched("end_date")) return;

    formInstance.setFieldValue("month_amount", "custom");
    formInstance.setFieldTouched("end_date", false);
  }
);
watch(
  () => formInstance.values.month_amount,
  (nextMonthAmount) => {
    if (nextMonthAmount === "custom") return;
    if (!formInstance.values.start_date) return;
    const startDate = new Date(formInstance.values.start_date);
    startDate?.setMonth(startDate.getMonth() + Number(nextMonthAmount));
    const nextEndDate = startDate;

    formInstance.setFieldValue("end_date", nextEndDate.toISOString());
  }
);
watch(
  () => props.subscription,
  (nextSubscription) => {
    if (nextSubscription) {
      formInstance.resetForm({
        values: {
          plan_id: nextSubscription.plan_id ?? "",
          user_id: nextSubscription.user_id ?? "",
          start_date: nextSubscription.start_date ?? initialForm.start_date,
          end_date: nextSubscription.end_date ?? initialForm.end_date,
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
        <FormField v-slot="{ componentField }" name="plan_id">
          <FormItem v-auto-animate>
            <FormLabel>Plan de suscripción</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder="Escoge un plan para la suscripción"
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="plan in plansQuery.data.value?.data"
                    :value="plan.id"
                    :key="plan.id"
                    >{{ plan.name?.toUpperCase() }}</SelectItem
                  >
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField, value, handleChange }"
          name="start_date"
        >
          <FormItem class="flex flex-col">
            <FormLabel>Fecha inicio</FormLabel>
            <Popover>
              <PopoverTrigger as-child>
                <FormControl>
                  <Button
                    variant="outline"
                    :class="[
                      'ps-3 text-start font-normal',
                      {
                        'text-muted-foreground': !value,
                      },
                    ]"
                  >
                    <span>{{
                      new Date(value).toDateString() || "Escoge fecha inicial"
                    }}</span>
                    <CalendarIcon class="ms-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="p-0">
                <Calendar
                  @update:model-value="
                    (date) => handleChange((date as Date)?.toISOString())
                  "
                  :modelValue="componentField.modelValue"
                  :name="componentField.name"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField, value, handleChange }"
          name="end_date"
        >
          <FormItem class="flex flex-col">
            <FormLabel>Fecha expiración</FormLabel>
            <Popover>
              <PopoverTrigger as-child>
                <FormControl>
                  <Button
                    variant="outline"
                    :class="[
                      'ps-3 text-start font-normal',
                      {
                        'text-muted-foreground': !value,
                      },
                    ]"
                  >
                    <span>{{
                      new Date(value).toDateString() || "Escoge fecha final"
                    }}</span>
                    <CalendarIcon class="ms-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="p-0">
                <Calendar
                  @update:model-value="
                    (date) => {handleChange((date as Date)?.toISOString()); formInstance.setFieldTouched('end_date', true)}
                  "
                  :modelValue="componentField.modelValue"
                  :name="componentField.name"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="month_amount">
          <FormItem v-auto-animate>
            <FormLabel>Cantidad de meses</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Asigna cantidad de meses" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="custom">Personalizada</SelectItem>
                  <SelectItem
                    v-for="(_, index) in Array.from({ length: 12 })"
                    :value="(index + 1).toString()"
                    >{{ formatMonths(index + 1) }}</SelectItem
                  >
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
