import type { useOrganizationServices } from "@/features/organizations";
import { defineStore } from "pinia";
import { ref, toRef, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./useAuthStore";

export type UserOrganization = NonNullable<
  Awaited<
    ReturnType<
      ReturnType<typeof useOrganizationServices>["loadUserOrganizations"]
    >
  >["data"]
>[number];

export const useOrganizationStore = defineStore("organization", () => {
  const isUserOrganizationsLoading = ref(true);
  const userOrganizations = ref<UserOrganization[] | null>(null);

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const hasUserOrganizations = toRef(() =>
    Boolean(userOrganizations.value?.length)
  );
  const currentUserOrganization = toRef(() =>
    findOrganizationById(route.params?.orgId?.toString())
  );
  const isPremium = toRef(
    () =>
      currentUserOrganization.value?.i_organizations?.plans?.name === "premium"
  );
  const canEnablePublicProductsPage = toRef(() => isPremium.value);
  const canEnableCustomerCashback = toRef(() => isPremium.value);
  const canAddProducts = toRef(() => {
    const maxProducts =
      currentUserOrganization.value?.i_organizations?.plans?.max_products;
    const currentProducts =
      currentUserOrganization.value?.i_organizations?.current_products;
    if (typeof maxProducts !== "number" || typeof currentProducts !== "number")
      return false;

    return currentProducts < maxProducts;
  });
  const canTriggerLowStockAlert = toRef(() => {
    const lowStockThreshold =
      currentUserOrganization.value?.i_organizations?.low_stock_threshold ?? 0;
    const isLowStockAlertEnabled =
      Boolean(currentUserOrganization.value?.i_organizations?.is_low_stock_alert_enabled);

    return lowStockThreshold > 0 && isLowStockAlertEnabled && isPremium.value;
  });
  const canAddCustomers = toRef(() => {
    const maxCustomers =
      currentUserOrganization.value?.i_organizations?.plans?.max_customers;
    const currentCustomers =
      currentUserOrganization.value?.i_organizations?.current_customers;
    if (
      typeof maxCustomers !== "number" ||
      typeof currentCustomers !== "number"
    )
      return false;

    return currentCustomers < maxCustomers;
  });
  const canAddOrganizations = toRef(() => {
    const maxOrganizations = authStore.authedUser?.max_organizations;
    const currentOrganizations = authStore.authedUser?.current_organizations;
    if (!maxOrganizations || !currentOrganizations) return false;

    return currentOrganizations < maxOrganizations && isPremium.value;
  });
  const maxProductImageUploads = toRef(() => {
    return currentUserOrganization.value?.i_organizations?.plans?.max_product_image_uploads ?? 1
  });

  function setUserOrganizations(
    nextUserOrganizations: UserOrganization[] | null
  ) {
    userOrganizations.value = nextUserOrganizations;
  }

  function setIsUserOrganizationsLoading(isLoading: boolean) {
    isUserOrganizationsLoading.value = isLoading;
  }

  function findOrganizationById(id: string) {
    return userOrganizations.value?.find((org) => org.org_id === id);
  }

  function redirectToOrganization(orgId: string | null | undefined) {
    if (!orgId)
      throw new Error(
        "Could not redirect since organization id was not provided"
      );

    router.push(`/org/${orgId}/dashboard`);
  }

  function $reset() {
    userOrganizations.value = null;
  }

  watchEffect(() => {
    const themeColor =
      currentUserOrganization.value?.i_organizations?.theme_color ?? null;
    const root = document.querySelector(":root") as HTMLElement;
    
    if (themeColor) {
      root?.style.setProperty("--primary", themeColor);
    }
  });

  return {
    userOrganizations,
    hasUserOrganizations,
    currentUserOrganization,
    setUserOrganizations,
    findOrganizationById,
    isPremium,
    canEnablePublicProductsPage,
    canEnableCustomerCashback,
    canAddProducts,
    canAddCustomers,
    canAddOrganizations,
    canTriggerLowStockAlert,
    setIsUserOrganizationsLoading,
    isUserOrganizationsLoading,
    redirectToOrganization,
    maxProductImageUploads,
    $reset,
  };
});
