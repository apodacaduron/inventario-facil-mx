import { useOrganizationStore } from "@/stores";
import { router } from "@/config/router";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";

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

  function appendFiltersToQuery<T extends PostgrestFilterBuilder<any, any, any>>(supabaseQuery: T, options?: LoadListOptions) {
    if (options?.order) {
      const [column = "created_at", order = "desc"] = options?.order;
      supabaseQuery = supabaseQuery.order(column, {
        ascending: order === "asc",
      });
    }

    if (options?.filters) {
      const orFilters = options.filters.filter(filter => filter.filterType === 'or').map(filter => ([filter.column, filter.operator, filter.value].join('.')))
      const andFilters = options.filters.filter(filter => typeof filter.filterType === 'undefined' || filter.filterType === 'and')

      if (orFilters.length) {
        supabaseQuery = supabaseQuery.or(
          orFilters.join(",")
        )
      }

      if (orFilters.length) {
        andFilters.forEach((filter) => {
            supabaseQuery = supabaseQuery.filter(
              filter.column,
              filter.operator,
              filter.value
            );
        });
      }
    }

    return supabaseQuery
  }

  return { PAGINATION_LIMIT, getCurrentOrganization, getPaginationRange, appendFiltersToQuery };
}
