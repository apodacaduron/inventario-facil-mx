<script setup lang="ts">
import { ref, watchEffect } from "vue";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
        title: "Uh oh! Something went wrong.",
        variant: "destructive",
      });
      throw new Error(createOrganizationResponse.error?.message);
    }
    if (!newOrganizationId) {
      toast({
        title: "Uh oh! Something went wrong.",
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
        title: "Uh oh! Something went wrong.",
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
  <Dialog v-if="isDesktop" v-model:open="openModel">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Crea una organizacion</DialogTitle>
        <DialogDescription>
          Agrega una nueva organizacion para agregar datos nuevos por separado
          de tu organizacion actual.
        </DialogDescription>
      </DialogHeader>
      <div>
        <div class="space-y-4 py-2 pb-4">
          <div class="space-y-2">
            <Label for="name">Nombre de organizacion</Label>
            <Input
              v-model="organizationName"
              id="name"
              placeholder="Acme Inc."
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="openModel = false">
          Cancelar
        </Button>
        <Button
          :disabled="createOrganizationMutation.isPending.value"
          type="submit"
          @click="createOrganizationMutation.mutate(organizationName)"
        >
          Crear
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="openModel">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>Crea una organizacion</DrawerTitle>
          <DrawerDescription>
            Agrega una nueva organizacion para agregar datos nuevos por separado
            de tu organizacion actual.
          </DrawerDescription>
        </DrawerHeader>
        <div>
          <div class="space-y-4 py-2 pb-4 px-4">
            <div class="space-y-2">
              <Label for="name">Nombre de organizacion</Label>
              <Input
                v-model="organizationName"
                id="name"
                placeholder="Acme Inc."
              />
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button variant="outline" @click="openModel = false">
            Cancelar
          </Button>
          <Button
            :disabled="createOrganizationMutation.isPending.value"
            type="submit"
            @click="createOrganizationMutation.mutate(organizationName)"
          >
            Crear
          </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
