<script setup lang="ts">
import { ref } from "vue";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "@/components/ui";
import {
  CheckIcon,
  PlusCircle,
  SeparatorHorizontalIcon,
} from "lucide-vue-next";
import { useMediaQuery } from "@vueuse/core";
import { useOrganizationStore } from "@/stores";

const groups = [
  {
    label: "Organizaciones",
    teams: [
      {
        label: "Acme Inc.",
        value: "acme-inc",
      },
      {
        label: "Monsters Inc.",
        value: "monsters",
      },
    ],
  },
];

const open = ref(false);
const showNewTeamDialog = ref(false);

const organizationStore = useOrganizationStore();
const isDesktop = useMediaQuery("(min-width: 768px)");
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
          <AvatarImage
            :src="`https://avatar.vercel.sh/acme-inc.png`"
            :alt="organizationStore.currentUserOrganization?.i_organizations?.name"
          />
          <AvatarFallback>{{organizationStore.currentUserOrganization?.i_organizations?.name?.charAt(0)}}</AvatarFallback>
        </Avatar>
        {{ organizationStore.currentUserOrganization?.i_organizations?.name }}
        <SeparatorHorizontalIcon class="ml-auto size-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandList>
          <CommandGroup
            heading="Organizaciones"
          >
            <CommandItem
              v-for="organization in organizationStore.userOrganizations"
              :key="organization.org_id"
              :value="organization.org_id"
              class="text-sm"
              @select="
                () => {
                  selectedTeam = team;
                  open = false;
                }
              "
            >
              <Avatar class="mr-2 h-5 w-5">
                <AvatarImage
                  :src="`https://avatar.vercel.sh/${team.value}.png`"
                  :alt="team.label"
                  class="grayscale"
                />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              {{ team.label }}
              <CheckIcon
                :class="`ml-auto h-4 w-4
                             ${
                               selectedTeam.value === team.value
                                 ? 'opacity-100'
                                 : 'opacity-0'
                             }`"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
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
            <Input id="name" placeholder="Acme Inc." />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showNewTeamDialog = false">
          Cancel
        </Button>
        <Button type="submit"> Continue </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Drawer v-else v-model:open="showNewTeamDialog">
    <DrawerContent>
      <div class="mx-auto w-full max-w-sm mt-8 mb-16">
        <DrawerHeader>
          <DrawerTitle>Crea una organizacion</DrawerTitle>
          <DrawerDescription>
            Agrega una nueva organizacion para agregar datos nuevos por separado de tu organizacion actual.
          </DrawerDescription>
        </DrawerHeader>
        <div>
          <div class="space-y-4 py-2 pb-4 px-4">
            <div class="space-y-2">
              <Label for="name">Nombre de organizacion</Label>
              <Input id="name" placeholder="Acme Inc." />
            </div>
          </div>
        </div>
        <DrawerFooter>
          <Button variant="outline" @click="showNewTeamDialog = false">
            Cancelar
          </Button>
          <Button type="submit"> Crear </Button>
        </DrawerFooter>
      </div>
    </DrawerContent>
  </Drawer>
</template>
