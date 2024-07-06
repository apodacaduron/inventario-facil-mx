import { useInfiniteQuery, useQuery } from "@tanstack/vue-query";
import { useSaleServices } from "./useSaleServices";
import { MaybeRefOrGetter, toValue } from "vue";
import { LoadListOptions } from "@/features/global";

export function useSalesQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>,
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search?: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions["filters"] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions["order"] | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useInfiniteQuery({
    queryKey: [
      "sales",
      context.options.orgId,
      context.options.search,
      context.options.filters,
      context.options.order,
    ],
    queryFn({ pageParam }) {
      return saleServices.loadList({
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

export function useSalesCountQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useQuery({
    queryKey: [
      "sales",
      "count",
      context.options.orgId,
      context?.options?.range,
    ],
    async queryFn() {
      const response = await saleServices.getSalesCount({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range),
      });

      return response.data ?? 0;
    },
  });
}

export function useSalesTotalIncomeQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useQuery({
    queryKey: ["sales", "total-income", context.options.orgId, context?.options?.range],
    async queryFn() {
      const response = await saleServices.getSalesTotalIncome({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range),
      });

      return response.data ?? 0;
    },
  });
}

export function useSalesTotalProfitQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useQuery({
    queryKey: ["sales", "total-profit", context.options.orgId, context?.options?.range],
    async queryFn() {
      const response = await saleServices.getSalesTotalProfit({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range),
      });

      return response.data ?? 0;
    },
  });
}

export function useYearMonthlySalesQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
  };
}) {
  const saleServices = useSaleServices();

  return useQuery({
    queryKey: ["sales", "year-monthly-sales", context.options.orgId],
    async queryFn() {
      const response = await saleServices.getYearMonthlySales({
        orgId: toValue(context.options.orgId),
      });

      return response.data;
    },
  });
}
