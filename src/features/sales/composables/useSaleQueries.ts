import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { useSaleServices } from "./useSaleServices";
import { MaybeRefOrGetter, toValue } from "vue";
import { LoadListOptions } from "@/features/global";

export function useSalesQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search?: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions['filters'] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions['order'] | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useInfiniteQuery({
    queryKey: [
      'sales',
      context.options.search,
      context.options.filters,
      context.options.order,
    ],
    queryFn({ pageParam }) {
      return saleServices.loadList({
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

export function useSalesCountQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useQuery({
    queryKey: ['sales', 'count', context?.options?.range],
    async queryFn() {
      const response = await saleServices.getSalesCount(
        toValue(context?.options?.range)
      );

      return response.data ?? 0;
    },
  });
}

export function useSalesTotalIncomeQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useQuery({
    queryKey: ['sales', 'total-income', context?.options?.range],
    async queryFn() {
      const response = await saleServices.getSalesTotalIncome(
        toValue(context?.options?.range)
      );

      return response.data ?? 0;
    },
  });
}

export function useSalesTotalProfitQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useQuery({
    queryKey: ['sales', 'total-profit', context?.options?.range],
    async queryFn() {
      const response = await saleServices.getSalesTotalProfit(
        toValue(context?.options?.range)
      );

      return response.data ?? 0;
    },
  });
}