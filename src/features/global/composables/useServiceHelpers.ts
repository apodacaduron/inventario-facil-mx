import { useOrganizationStore } from "@/stores";
import { router } from "@/config/router";

export type LoadListOptions = {
  offset?: number;
  search?: string;
  filters?: Array<{
    column: string;
    operator: string;
    value: any;
    filterType?: string
  }>;
  order?: [string, "asc" | "desc"];
  organization_id?: string;
};

export function useServiceHelpers() {
  const PAGINATION_LIMIT = 30;

  function getCurrentOrganization() {
    const orgId = router.currentRoute.value.params.orgId;
    const organizationStore = useOrganizationStore();

    return organizationStore.findOrganizationById(orgId.toString());
  }

  function getPaginationRange(_offset?: number) {
    const offset = _offset ?? 0;
    const from = offset * PAGINATION_LIMIT;
    const to = from + PAGINATION_LIMIT - 1;

    return [from, to];
  }

  return { PAGINATION_LIMIT, getCurrentOrganization, getPaginationRange };
}
