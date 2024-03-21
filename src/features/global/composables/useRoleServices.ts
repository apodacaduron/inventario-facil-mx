import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores";

export function useRoleServices() {
  const authStore = useAuthStore();

  async function getUserRole() {
    const userId = authStore.session?.user.id;
    if (!userId) throw new Error("No user id found");
    return await supabase
      .from("user_roles")
      .select("*, i_roles(role_name)")
      .eq("user_id", userId)
      .single();
  }

  return {
    getUserRole,
  };
}
