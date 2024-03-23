import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { useSubscriptionServices } from "./useSubscriptionServices";
import { MaybeRefOrGetter, toValue } from "vue";
import { LoadListOptions } from "@/features/global";

export function useSubscriptionsQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search?: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions["filters"] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions["order"] | undefined>;
  };
}) {
  const subscriptionServices = useSubscriptionServices();

  return useInfiniteQuery({
    queryKey: [
      "subscriptions",
      context.options.search,
      context.options.filters,
      context.options.order,
    ],
    queryFn({ pageParam }) {
      return subscriptionServices.loadList({
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

export function usePlansQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search?: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions["filters"] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions["order"] | undefined>;
  };
}) {
  const subscriptionServices = useSubscriptionServices();

  return useQuery({
    queryKey: [
      "plans",
      context.options.search,
      context.options.filters,
      context.options.order,
    ],
    queryFn() {
      return subscriptionServices.loadPlanList({
        search: toValue(context.options.search),
        filters: toValue(context.options.filters),
        order: toValue(context.options.order),
      });
    },
    enabled: context.options.enabled,
  });
}

export function useCurrentSubscriptionQuery() {
  const subscriptionServices = useSubscriptionServices();

  return useQuery({
    queryKey: ["subscription"],
    queryFn() {
      return subscriptionServices.getCurrentSubscription();
    },
  });
}
