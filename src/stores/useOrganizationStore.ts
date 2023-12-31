import type { useOrganizationList } from "@/features/organizations";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

type Organizations = Awaited<
  ReturnType<ReturnType<typeof useOrganizationList>["load"]>
>;

export const useOrganizationStore = defineStore("organization", () => {
  const organizations = ref<Organizations | null>(null);

  const hasOrganizations = computed(() => Boolean(organizations.value?.length));

  function setOrganizations(nextOrganizations: Organizations) {
    organizations.value = nextOrganizations;
  }

  function findOrganizationById(id: string) {
    return organizations.value?.find((org) => org.org_id === id);
  }

  return {
    organizations,
    hasOrganizations,
    setOrganizations,
    findOrganizationById,
  };
});
