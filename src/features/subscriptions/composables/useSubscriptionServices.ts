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

    if (options?.order) {
      const [column = "created_at", order = "desc"] = options?.order;
      subscriptionQuery = subscriptionQuery.order(column, {
        ascending: order === "asc",
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        subscriptionQuery = subscriptionQuery.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await subscriptionQuery;
  }

  return {
    loadList,
  };
}
