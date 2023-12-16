import { supabase } from "@/config/supabase";
import { useRoute } from "vue-router";

export function useProductServices() {
  const route = useRoute();
  const orgId = route.params.orgId;

  async function loadList() {
    return await supabase
      .from("i_products")
      .select()
      .eq("org_id", orgId.toString());
  }

  return { loadList };
}
