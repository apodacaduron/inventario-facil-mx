import type { useOrganizationList } from "@/features/organizations";
import { defineStore } from "pinia";
import { ref, toRef } from "vue";
import { useRoute } from "vue-router";

type Organizations = Awaited<
  ReturnType<ReturnType<typeof useOrganizationList>["load"]>
>;

export const useOrganizationStore = defineStore("organization", () => {
  const route = useRoute()
  const organizations = ref<Organizations | null>(null);

  const hasOrganizations = toRef(() => Boolean(organizations.value?.length));
  const currentOrganization = toRef(() => findOrganizationById(route.params.orgId.toString()));

  function setOrganizations(nextOrganizations: Organizations) {
    organizations.value = nextOrganizations;
  }

  function findOrganizationById(id: string) {
    return organizations.value?.find((org) => org.org_id === id);
  }

  return {
    organizations,
    hasOrganizations,
    currentOrganization,
    setOrganizations,
    findOrganizationById,
  };
});
