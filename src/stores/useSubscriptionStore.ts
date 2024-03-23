import { subscriptionServicesTypeguards, useSubscriptionServices } from "@/features/subscriptions";
import { defineStore } from "pinia";
import { ref, toRef } from "vue";

type CurrentSubscription = Awaited<ReturnType<ReturnType<typeof useSubscriptionServices>['getCurrentSubscription']>>['data'] | undefined

const DEFAULT_PLAN = {
  id: '8e020f6b-7f66-45a2-a614-04f282eae656',
  created_at: '2024-03-23T21:23:58.49884+00:00',
  name: 'freemium',
  description: null,
  price: 0,
  currency: 'MXN',
  max_products: 50,
  max_customers: 50,
};

export const useSubscriptionStore = defineStore("subscription", () => {
  const currentSubscription = ref<CurrentSubscription>()

  const currentPlan = toRef(() => {
      if (
        subscriptionServicesTypeguards.isSubscription(currentSubscription) &&
        currentSubscription.plans
      ) {
        return currentSubscription.plans;
      }

    if (
      subscriptionServicesTypeguards.isPlan(currentSubscription.value) &&
      currentSubscription.value
    ) {
      return currentSubscription.value;
    }

    return DEFAULT_PLAN;
  })
  const hasPlan = toRef(() => Boolean(currentSubscription.value));

  function setCurrentSubscription(_currentSubscription: CurrentSubscription) {
    currentSubscription.value = _currentSubscription
  }

  function canAddProducts(productCount: number) {
    if (currentPlan.value.max_products === null) return true
    
    return productCount <= currentPlan.value.max_products;
  }

  function canAddCustomers(customerCount: number) {
    if (currentPlan.value.max_customers === null) return true
    
    return customerCount <= currentPlan.value.max_customers;
  }

  return {
    currentSubscription,
    currentPlan,
    hasPlan,
    setCurrentSubscription,
    canAddProducts,
    canAddCustomers,
  };
});
