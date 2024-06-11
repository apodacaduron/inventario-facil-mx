<script setup lang="ts">
import {
  Avatar,
  AvatarFallback,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useOrganizationStore } from "@/stores";

const organizationStore = useOrganizationStore();
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
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
