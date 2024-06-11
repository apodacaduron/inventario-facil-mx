import { supabase } from "@/config/supabase";
import { Tables } from "../../../../types_db";

export type Organization = Tables<'i_organizations'>
export type UpdateOrganization = Partial<Omit<Organization, 'id' |'created_at'>>

export function useOrganizationServices() {
  async function loadUserOrganizations(options: {userId: string | undefined}) {
    if (!options.userId)
      throw new Error("User id is required to get organizations");

    let organizationQuery = supabase
      .from("i_user_organization_roles")
      .select("id, org_id, i_organizations(*, plans(*)), i_roles(role_name)")
      .eq("user_id", options.userId);

    return await organizationQuery;
  }

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

  async function deleteOrganization(organizationId: string) {
    return await supabase.from('i_organizations').delete().eq('id', organizationId)
  }

  return {
    loadById,
    loadUserOrganizations,
    updateOrganization,
    deleteOrganization
  };
}
