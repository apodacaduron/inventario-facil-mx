import type { useOrganizationList } from "@/features/organizations";
import { defineStore } from "pinia";
import { ref } from "vue";

type Organizations = Awaited<
  ReturnType<ReturnType<typeof useOrganizationList>["load"]>
>;

export const useOrganizationStore = defineStore("organization", () => {
  const organizations = ref<Organizations | null>(null);

  function setOrganizations(nextOrganizations: Organizations) {
    organizations.value = nextOrganizations;
  }

  return { organizations, setOrganizations };
});
