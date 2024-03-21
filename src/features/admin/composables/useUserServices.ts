import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";

export function useUserServices() {
  const serviceHelpers = useServiceHelpers();

  async function loadList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let userQuery = supabase.from("users").select("*").range(from, to);

    if (options?.search) {
      userQuery = userQuery.ilike("full_name", `%${options.search}%`);
    }

    if (options?.order) {
      const [column = "created_at", order = "desc"] = options?.order;
      userQuery = userQuery.order(column, {
        ascending: order === "asc",
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        userQuery = userQuery.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await userQuery;
  }

  return { loadList };
}
