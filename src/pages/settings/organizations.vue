<script setup lang="ts">
import {
  Avatar,
  AvatarFallback,
  Button,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import {
  DeleteOrganizationDialog,
  UpdateOrganizationDialog,
  UpdateThemeDialog,
} from "@/features/organizations";
import { UserOrganization, useAuthStore, useOrganizationStore } from "@/stores";
import { PaletteIcon, Pencil, TrashIcon } from "lucide-vue-next";
import { ref, watchEffect } from "vue";

const activeOrganization = ref<UserOrganization | null>(null);
const isDeleteDialogOpen = ref(false);
const isUpdateDialogOpen = ref(false);
const isUpdateThemeDialogOpen = ref(false);

const organizationStore = useOrganizationStore();
const authStore = useAuthStore();

watchEffect(() => {
  if (isDeleteDialogOpen.value) return;
  if (isUpdateDialogOpen.value) return;
  if (isUpdateThemeDialogOpen.value) return;

  activeOrganization.value = null;
});
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Organizaciones</h3>
    <p class="text-sm text-muted-foreground">Gestiona tus organizaciones.</p>
  </div>

  <Separator />

  <div class="mt-4">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="pl-4">
            <span class="flex items-center gap-2"> Nombre </span>
          </TableHead>
          <TableHead class="text-center"> # Clientes </TableHead>
          <TableHead class="text-center"> # Productos </TableHead>
          <TableHead class="text-center"> # Miembros </TableHead>
          <TableHead class="text-center"> - </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="userOrganization in organizationStore.userOrganizations"
          :key="userOrganization.id"
        >
          <TableCell
            class="flex items-center p-4 text-foreground whitespace-nowrap w-max"
          >
            <Avatar>
              <AvatarFallback>{{
                `${userOrganization.i_organizations?.name
                  ?.substring(0, 1)
                  .toLocaleUpperCase()}` ?? "?"
              }}</AvatarFallback>
            </Avatar>
            <div class="ps-3">
              <div class="text-base font-semibold">
                {{ userOrganization.i_organizations?.name }}
              </div>
            </div>
          </TableCell>
          <TableCell class="text-center">{{
            userOrganization.i_organizations?.current_customers
          }}</TableCell>
          <TableCell class="text-center">{{
            userOrganization.i_organizations?.current_products
          }}</TableCell>
          <TableCell class="text-center">
            {{ userOrganization.i_organizations?.current_members }}
          </TableCell>
          <TableCell
            v-if="
              userOrganization.i_organizations?.user_id ===
              authStore.authedUser?.id
            "
            class="text-center"
          >
            <div class="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      size="icon"
                      variant="outline"
                      @click="
                        activeOrganization = userOrganization;
                        isUpdateDialogOpen = true;
                      "
                    >
                      <Pencil class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actualizar organización</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      size="icon"
                      variant="outline"
                      @click="
                        activeOrganization = userOrganization;
                        isUpdateThemeDialogOpen = true;
                      "
                    >
                      <PaletteIcon class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Color de organización</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider
                v-if="(organizationStore.userOrganizations?.length ?? 1) > 1"
              >
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      size="icon"
                      variant="outline"
                      class="text-red-500 dark:text-red-500"
                      @click="
                        activeOrganization = userOrganization;
                        isDeleteDialogOpen = true;
                      "
                    >
                      <TrashIcon class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Eliminar organización</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <DeleteOrganizationDialog
    v-model:open="isDeleteDialogOpen"
    :userOrganization="activeOrganization"
  />
  <UpdateOrganizationDialog
    v-model:open="isUpdateDialogOpen"
    :userOrganization="activeOrganization"
  />
  <UpdateThemeDialog
    v-model:open="isUpdateThemeDialogOpen"
    :userOrganization="activeOrganization"
  />
</template>
