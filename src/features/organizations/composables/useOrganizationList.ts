import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores";
import { useOrganizationStore } from "@/stores/useOrganizationStore";
import { watch } from "vue";

export function useOrganizationList() {
  const authStore = useAuthStore();
  const organizationStore = useOrganizationStore();

  async function load() {
    const response = await supabase
      .from("i_user_organization_roles")
      .select("id, org_id, i_organizations(name), i_roles(role_name)")
      .eq("user_id", authStore.session?.user.id);
    organizationStore.setOrganizations(response.data ?? []);

    return response.data;
  }

  async function clear() {
    organizationStore.setOrganizations(null);
  }

  watch(
    () => authStore.isLoggedIn,
    (nextIsLoggedIn) => {
      if (nextIsLoggedIn) {
        load();
      } else {
        clear();
      }
    }
  );

  return {
    load,
    clear,
  };
}
