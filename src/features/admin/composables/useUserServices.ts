import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";

export type AuthedUserData = NonNullable<Awaited<
  ReturnType<ReturnType<typeof useUserServices>["getAuthedUserData"]>
>["data"]>[number];

export function useUserServices() {
  const serviceHelpers = useServiceHelpers();

  async function getAuthedUserData() {
    const response = await supabase.rpc("get_authed_user_data");

    return response;
  }

  async function loadList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let userQuery = supabase.from("users").select("*").range(from, to);

    if (options?.search) {
      userQuery = userQuery.ilike("full_name", `%${options.search}%`);
    }

    serviceHelpers.appendFiltersToQuery(userQuery, options);

    return await userQuery;
  }

  return { loadList, getAuthedUserData };
}
