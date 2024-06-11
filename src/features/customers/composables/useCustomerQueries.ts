import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { useCustomerServices } from "./useCustomerServices";
import { MaybeRefOrGetter, toValue } from "vue";
import { LoadListOptions } from "@/features/global";

export function useCustomersQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
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
      context.options.orgId,
    ],
    queryFn({ pageParam }) {
      return customerServices.loadList({
        orgId: toValue(context.options.orgId),
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

export function useCustomersCountQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const customerServices = useCustomerServices();

  return useQuery({
    queryKey: ["customers", "count", context?.options?.orgId, context?.options?.range],
    async queryFn() {
      const response = await customerServices.getCustomerCount({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range)
      });

      return response.data ?? 0;
    },
  });
}

export function useBestCustomersQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const customerServices = useCustomerServices();

  return useQuery({
    queryKey: ["customers", "best-customers", context?.options?.orgId, context?.options?.range],
    async queryFn() {
      const response = await customerServices.getBestCustomers({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range)
      });

      return response.data;
    },
  });
}
