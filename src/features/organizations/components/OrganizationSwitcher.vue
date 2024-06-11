<script setup lang="ts">
import { ref, watchEffect } from "vue";

import {
  Avatar,
  AvatarFallback,
  Button,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  useToast,
} from "@/components/ui";
import {
  CheckIcon,
  PlusCircle,
  SeparatorHorizontalIcon,
} from "lucide-vue-next";
import { useMediaQuery } from "@vueuse/core";
import { useAuthStore, useOrganizationStore } from "@/stores";
import { useRoute, useRouter } from "vue-router";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { supabase } from "@/config/supabase";

const open = ref(false);
const showNewTeamDialog = ref(false);
const organizationName = ref("");

const { toast } = useToast();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const queryClient = useQueryClient();
const organizationStore = useOrganizationStore();
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

    showNewTeamDialog.value = false;
    open.value = false;

    redirectToOrganization(newOrganizationId);
  },
});

function redirectToOrganization(orgId: string | null | undefined) {
  if (!orgId)
    throw new Error(
      "Could not redirect since organization id was not provided"
    );

  router.push(`/org/${orgId}/dashboard`);
}

watchEffect(() => {
  if (showNewTeamDialog.value) return;
  organizationName.value = "";
});
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded="open"
        aria-label="Select a team"
        class="min-w-[200px] w-full justify-between"
      >
        <Avatar class="mr-2 h-5 w-5">
          <AvatarFallback>{{
            organizationStore.currentUserOrganization?.i_organizations?.name?.charAt(
              0
            )
          }}</AvatarFallback>
        </Avatar>
        {{ organizationStore.currentUserOrganization?.i_organizations?.name }}
        <SeparatorHorizontalIcon class="ml-auto size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandList>
          <CommandGroup heading="Organizaciones">
            <CommandItem
              v-for="(
                organization, index
              ) in organizationStore.userOrganizations"
              :key="organization.org_id ?? index"
              :value="organization.org_id ?? 'Unknown'"
              class="text-sm"
              @select="
                () => {
                  redirectToOrganization(organization.org_id);
                  open = false;
                }
              "
            >
              <Avatar class="mr-2 h-5 w-5">
                <AvatarFallback>{{
                  organization.i_organizations?.name?.charAt(0) ?? "?"
                }}</AvatarFallback>
              </Avatar>
              {{ organization.i_organizations?.name }}
              <CheckIcon
                :class="`ml-auto h-4 w-4
                             ${
                               organization.org_id ===
                               route.params.orgId.toString()
                                 ? 'opacity-100'
                                 : 'opacity-0'
                             }`"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
        <template v-if="organizationStore.canAddOrganizations">
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                value="create-team"
                @select="
                  () => {
                    open = false;
                    showNewTeamDialog = true;
                  }
                "
              >
                <PlusCircle class="mr-2 size-5" />
                Create Team
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </template>
      </Command>
    </PopoverContent>
  </Popover>

  <Dialog v-if="isDesktop" v-model:open="showNewTeamDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create team</DialogTitle>
        <DialogDescription>
          Add a new team to manage products and customers.
        </DialogDescription>
      </DialogHeader>
      <div>
        <div class="space-y-4 py-2 pb-4">
          <div class="space-y-2">
            <Label for="name">Team name</Label>
            <Input
              v-model="organizationName"
              id="name"
              placeholder="Acme Inc."
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showNewTeamDialog = false">
          Cancel
        </Button>
        <Button
          :disabled="createOrganizationMutation.isPending.value"
          type="submit"
          @click="createOrganizationMutation.mutate(organizationName)"
        >
          Continue
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="showNewTeamDialog">
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
          <Button variant="outline" @click="showNewTeamDialog = false">
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
