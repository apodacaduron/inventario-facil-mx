import { supabase } from "@/config/supabase";
import { Tables } from "../../../../types_db";

export type Organization = Tables<'i_organizations'>
export type UpdateOrganization = Partial<Omit<Organization, 'id' |'created_at'>>

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

  async function updateOrganization(data: {organizationId: string, values: UpdateOrganization}) {
    await supabase.from('i_organizations').update(data.values).eq('id', data.organizationId)
  }

  return {
    loadById,
    updateOrganization
  };
}
