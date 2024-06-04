import type { useOrganizationServices } from "@/features/organizations";
import { defineStore } from "pinia";
import { ref, toRef } from "vue";
import { useRoute } from "vue-router";

type UserOrganizations = Awaited<
  ReturnType<ReturnType<typeof useOrganizationServices>["loadUserOrganizations"]>
>['data'];

export const useOrganizationStore = defineStore("organization", () => {
  const route = useRoute();
  const userOrganizations = ref<UserOrganizations | null>(null);

  const hasOrganizations = toRef(() => Boolean(userOrganizations.value?.length));
  const currentUserOrganization = toRef(() =>
    findOrganizationById(route.params.orgId.toString())
  );
  const isPremium = toRef(
    () => currentUserOrganization.value?.i_organizations?.plans?.name === "premium"
  );
  const canEnablePublicProductsPage = toRef(() => isPremium.value);
  const canAddProducts = toRef(() => {
    const maxProducts =
      currentUserOrganization.value?.i_organizations?.plans?.max_products;
    const currentProducts =
      currentUserOrganization.value?.i_organizations?.current_products;
    if (!maxProducts || !currentProducts) return false;

    return currentProducts <= maxProducts;
  });
  const canAddCustomers = toRef(() => {
    const maxCustomers =
      currentUserOrganization.value?.i_organizations?.plans?.max_customers;
    const currentCustomers =
      currentUserOrganization.value?.i_organizations?.current_customers;
    if (!maxCustomers || !currentCustomers) return false;

    return currentCustomers <= maxCustomers;
  });

  function setUserOrganizations(nexUsertOrganizations: UserOrganizations) {
    userOrganizations.value = nexUsertOrganizations;
  }

  function findOrganizationById(id: string) {
    return userOrganizations.value?.find((org) => org.org_id === id);
  }

  function $reset() {
    userOrganizations.value = null
  }

  return {
    userOrganizations,
    hasOrganizations,
    currentUserOrganization,
    setUserOrganizations,
    findOrganizationById,
    isPremium,
    canEnablePublicProductsPage,
    canAddProducts,
    canAddCustomers,
    $reset
  };
});
