import { useAuthStore } from "./useAuthStore";
import { useOrganizationStore } from "./useOrganizationStore";

export * from "./useAuthStore";
export * from "./useOrganizationStore";

export function resetAllPiniaStores() {
    const authStore = useAuthStore();
    const organizationStore = useOrganizationStore();

    authStore.$reset();
    organizationStore.$reset();
};