<script setup lang="ts">
import { ref, watchEffect } from "vue";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Input,
  Label,
  useToast,
} from "@/components/ui";
import { useMediaQuery } from "@vueuse/core";
import { useAuthStore, useOrganizationStore } from "@/stores";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/config/supabase";

const openModel = defineModel<boolean>("open");

const organizationName = ref("");

const { toast } = useToast();
const authStore = useAuthStore();
const organizationStore = useOrganizationStore();
const queryClient = useQueryClient();
const isDesktop = useMediaQuery("(min-width: 768px)");
const createOrganizationMutation = useMutation({
  mutationFn: async (organizationName: string) => {
    const createOrganizationResponse = await supabase
      .from("i_organizations")
      .insert({
        name: organizationName,
        plan_id: authStore.authedUser?.plan_id,
      })
      .select("*")
      .single();
    const newOrganizationId = createOrganizationResponse.data?.id;

    if (createOrganizationResponse.error?.message) {
      toast({
        title: "Uh oh! Algo salió mal.",
        variant: "destructive",
      });
      throw new Error(createOrganizationResponse.error?.message);
    }
    if (!newOrganizationId) {
      toast({
        title: "Uh oh! Algo salió mal.",
        variant: "destructive",
      });
      throw new Error("Create organization response does not contain id");
    }

    const roleResponse = await supabase
      .from("i_roles")
      .select("*")
      .eq("role_name", "admin")
      .single();
    const adminRoleId = roleResponse.data?.id;

    if (!adminRoleId) {
      toast({
        title: "Uh oh! Algo salió mal.",
        variant: "destructive",
      });
      throw new Error("Admin role id not found");
    }

    await supabase.from("i_user_organization_roles").insert({
      org_id: newOrganizationId,
      role_id: adminRoleId,
    });

    await queryClient.invalidateQueries({ queryKey: ["organization"] });
    await queryClient.invalidateQueries({ queryKey: ["user"] });

    openModel.value = false;

    organizationStore.redirectToOrganization(newOrganizationId);
  },
});

watchEffect(() => {
  if (openModel.value) return;
  organizationName.value = "";
});
</script>

<template>
  <Sheet v-model:open="openModel">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Crea una organización</SheetTitle>
        <SheetDescription>
          Agrega una nueva organización para agregar datos nuevos por separado
          de tu organización actual.
        </SheetDescription>
      </SheetHeader>
      <div>
        <div class="space-y-4 py-2 pb-4">
          <div class="space-y-2">
            <Label for="name">Nombre de organización</Label>
            <Input
              v-model="organizationName"
              id="name"
              placeholder="Acme Inc."
            />
          </div>
        </div>
      </div>
      <SheetFooter class="gap-2">
        <Button variant="outline" @click="openModel = false"> Cancelar </Button>
        <Button
          :disabled="createOrganizationMutation.isPending.value"
          type="submit"
          @click="createOrganizationMutation.mutate(organizationName)"
        >
          Crear
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
