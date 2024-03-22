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
  Input,
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  CardFooter,
} from "@/components/ui";
import { ref, toRef, watch } from "vue";
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
import { Database } from "../../../../types_db";
import { refDebounced, useInfiniteScroll } from "@vueuse/core";
import { useUsersQuery } from "@/features/admin";

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

const LOCALE = {
  CREATE: {
    TITLE: "Crear suscripción",
    SUBTITLE: "Crea rápidamente un nuevo suscripción para tu inventario.",
  },
  UPDATE: {
    TITLE: "Actualizar suscripción",
    SUBTITLE: "Actualiza rápidamente un suscripción de tu inventario.",
  },
  VIEW: {
    TITLE: "Detalle de suscripción",
    SUBTITLE: "Ve más a detalle tu suscripción",
  },
  SELECT_USERS: {
    TITLE: "Selecciona usuario",
    SUBTITLE: "Selecciona facilmente un usuario para tu suscripción",
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
  ["one", "mes"],
  ["other", "meses"],
]);
const pr = new Intl.PluralRules("es-MX");
const formatMonths = (n: number) => {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n} ${suffix}`;
};

const usersRef = ref<HTMLElement | null>(null);
const userSearch = ref("");
const userSearchDebounced = refDebounced(userSearch, 400);
const subscriptionSidebarMode = ref<"subscriptions" | "users">("subscriptions");
const activeUser = ref<Database["public"]["Tables"]["users"]["Row"] | null>(
  null
);
const usersQuery = useUsersQuery({
  options: {
    enabled: true,
    search: userSearchDebounced,
    order: ["full_name", "asc"],
  },
});
useInfiniteScroll(
  usersRef,
  () => {
    if (usersQuery.isFetching.value) return;
    usersQuery.fetchNextPage();
  },
  { distance: 10, canLoadMore: () => usersQuery.hasNextPage.value }
);

const formSchema = toTypedSchema(
  z.object({
    plan_id: z.string().uuid().min(1, "Plan es requerido"),
    user_id: z.string().uuid().min(1, "Usuario es requerido"),
    start_date: z.string().datetime(),
    end_date: z.string().datetime().nullable().optional(),
    subscription_id: z.string().uuid().optional(),
    month_amount: z
      .preprocess(
        (x) => (x ? x : undefined),
        z.coerce.number().int().min(1).max(12).optional()
      )
      .or(z.literal("custom")),
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

const formMode = toRef(() => (props.subscription ? "UPDATE" : "CREATE"));

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
      <div v-show="subscriptionSidebarMode === 'subscriptions'">
        <SheetHeader>
          <SheetTitle>
            {{ LOCALE[formMode].TITLE }}
          </SheetTitle>
          <SheetDescription>
            {{ LOCALE[formMode].SUBTITLE }}
          </SheetDescription>
        </SheetHeader>
        <form @submit="onSubmit" class="flex flex-col gap-6 mt-6 mb-6">
          <FormField v-if="!subscription?.id" name="user_id">
            <FormItem class="flex flex-col">
              <FormLabel>Usuario</FormLabel>
              <Button
                class="h-12"
                variant="outline"
                type="button"
                @click="subscriptionSidebarMode = 'users'"
              >
                <span v-if="formInstance.values.user_id">
                  {{ activeUser?.full_name }} <br />
                  <span class="text-xs">
                    {{ activeUser?.email }}
                  </span>
                </span>
                <span v-else>Seleccionar usuario</span>
              </Button>
              <FormMessage />
            </FormItem>
          </FormField>
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
                        new Date(value).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) || "Escoge fecha inicial"
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
                        new Date(value).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) || "Escoge fecha final"
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
      </div>
      <div ref="usersRef" v-show="subscriptionSidebarMode === 'users'">
        <SheetHeader class="mb-6">
          <SheetTitle>{{ LOCALE.SELECT_USERS.TITLE }}</SheetTitle>
          <SheetDescription>
            {{ LOCALE.SELECT_USERS.SUBTITLE }}
          </SheetDescription>
        </SheetHeader>
        <Input
          v-model="userSearch"
          type="search"
          placeholder="Busca clientes..."
        />
        <div class="grid grid-cols-2 gap-3 mt-4 mb-10">
          <Card
            v-for="user in usersQuery.data.value?.pages.flatMap(
              (page) => page.data
            )"
            :key="user?.id"
            class="flex flex-col"
          >
            <CardContent class="p-4 text-center">
              <Avatar>
                <AvatarFallback>{{
                  `${user?.full_name?.substring(0, 1).toLocaleUpperCase()}`
                }}</AvatarFallback>
              </Avatar>
              <div class="text-sm font-semibold line-clamp-2">
                {{ user?.full_name }}
              </div>
            </CardContent>
            <CardFooter class="p-2 mt-auto">
              <Button
                @click="
                  formInstance.setFieldValue('user_id', user?.id ?? '');
                  activeUser = user;
                  subscriptionSidebarMode = 'subscriptions';
                "
                class="w-full text-left"
                type="button"
                :variant="
                  formInstance.values.user_id === user?.id
                    ? 'default'
                    : 'outline'
                "
                >{{
                  formInstance.values.user_id === user?.id
                    ? "Seleccionado"
                    : "Seleccionar"
                }}</Button
              >
            </CardFooter>
          </Card>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
