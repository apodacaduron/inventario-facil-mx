import { supabase } from "@/config/supabase";

export function useOrganizationServices() {
  async function loadById(options: {organization_id: string | undefined}) {
    if (!options.organization_id)
      throw new Error("Organization is required to get organization");

    let organizationQuery = supabase
      .from("i_organizations")
      .select("*")
      .eq("id", options.organization_id).single();

    return await organizationQuery;
  }

  return {
    loadById
  };
}
