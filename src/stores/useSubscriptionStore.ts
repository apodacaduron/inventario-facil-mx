import { defineStore } from "pinia";
import { useAuthStore } from "./useAuthStore";
import { toRef } from "vue";

export const useSubscriptionStore = defineStore("subscription", () => {
  const authStore = useAuthStore();

  const isPremium = toRef(
    () => authStore.authedUser?.plan_name === "premium"
  );

  const canEnablePublicProductsPage = toRef(
    () => isPremium.value
  );

  function canAddProducts(productCount = 0) {
    if (!authStore.authedUser?.max_products) return true;

    return productCount <= authStore.authedUser.max_products;
  }

  function canAddCustomers(customerCount = 0) {
    if (!authStore.authedUser?.max_customers) return true;

    return customerCount <= authStore.authedUser.max_customers;
  }

  return {
    canAddProducts,
    canAddCustomers,
    canEnablePublicProductsPage,
    isPremium,
  };
});
