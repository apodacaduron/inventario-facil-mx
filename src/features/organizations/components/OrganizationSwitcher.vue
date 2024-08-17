<script setup lang="ts">
import { ref } from "vue";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import {
  CheckIcon,
  PlusCircle,
  SeparatorHorizontalIcon,
} from "lucide-vue-next";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";
import type { useLayerManager } from "@/features/global";

type Props = {
  layerManager: ReturnType<typeof useLayerManager>;
};
defineProps<Props>();

const open = ref(false);

const route = useRoute();
const organizationStore = useOrganizationStore();
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded="open"
        aria-label="Select a team"
        class="min-w-[160px] w-full justify-between"
      >
        <Avatar class="mr-2 h-5 w-5">
          <AvatarImage
            :src="
              organizationStore.currentUserOrganization?.i_organizations
                ?.logo ?? ''
            "
            class="object-cover"
          />
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
                  organizationStore.redirectToOrganization(organization.org_id);
                  open = false;
                }
              "
            >
              <Avatar class="mr-2 h-5 w-5">
                <AvatarImage
                  :src="organization.i_organizations?.logo ?? ''"
                  class="object-cover"
                />
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
                    layerManager.openLayer('create-organization');
                  }
                "
              >
                <PlusCircle class="mr-2 size-5" />
                Crear organización
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </template>
      </Command>
    </PopoverContent>
  </Popover>
</template>
