import { useQuery } from "@tanstack/vue-query";
import { useRoleServices } from "./useRoleServices";

export function useRoleQuery() {
  const roleServices = useRoleServices();

  return useQuery({
    queryKey: ["user-role"],
    queryFn() {
      return roleServices.getUserRole();
    },
  });
}
