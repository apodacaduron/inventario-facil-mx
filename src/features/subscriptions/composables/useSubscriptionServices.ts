import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";

export function useSubscriptionServices() {
  const serviceHelpers = useServiceHelpers();

  async function loadList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let subscriptionQuery = supabase
      .from("subscriptions")
      .select("*, plans(*), users!inner(*)")
      .range(from, to);

    if (options?.search) {
      subscriptionQuery = subscriptionQuery.ilike(
        "users.full_name",
        `%${options.search}%`
      );
    }

    serviceHelpers.appendFiltersToQuery(subscriptionQuery, options);

    return await subscriptionQuery;
  }

  async function loadPlanList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let plansQuery = supabase
      .from("plans")
      .select("*")
      .range(from, to);

    if (options?.search) {
      plansQuery = plansQuery.ilike(
        "name",
        `%${options.search}%`
      );
    }

    serviceHelpers.appendFiltersToQuery(plansQuery, options);

    return await plansQuery;
  }

  return {
    loadList,
    loadPlanList
  };
}
