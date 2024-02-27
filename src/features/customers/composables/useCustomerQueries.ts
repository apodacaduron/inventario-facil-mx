import { useInfiniteQuery } from "@tanstack/vue-query";
import { useCustomerServices } from "./useCustomerServices";
import { MaybeRefOrGetter, toValue } from "vue";
import { LoadListOptions } from "@/features/global";

export function useCustomersQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search?: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions["filters"] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions["order"] | undefined>;
  };
}) {
  const customerServices = useCustomerServices();

  return useInfiniteQuery({
    queryKey: [
      "customers",
      context.options.search,
      context.options.filters,
      context.options.order,
    ],
    queryFn({ pageParam }) {
      return customerServices.loadList({
        offset: pageParam,
        search: toValue(context.options.search),
        filters: toValue(context.options.filters),
        order: toValue(context.options.order),
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
