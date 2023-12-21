import { useInfiniteQuery } from "@tanstack/vue-query";
import { useCustomerServices } from "./useCustomerServices";
import { MaybeRefOrGetter, toValue } from "vue";

export function useCustomersQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
  };
}) {
  const customerServices = useCustomerServices();

  return useInfiniteQuery({
    queryKey: ["customers", context.options.search],
    queryFn({ pageParam }) {
      return customerServices.loadList({
        offset: pageParam,
        search: toValue(context.options.search),
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.data?.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    enabled: context.options.enabled,
  });
}
