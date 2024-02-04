import { useQuery } from "@tanstack/vue-query";
import { useDashboardServices } from "./useDashboardServices";
import { MaybeRefOrGetter, toRef, toValue } from "vue";
import { isDefined } from "@vueuse/core";

export function useTotalCustomersQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const dashboardServices = useDashboardServices();

  return useQuery({
    queryKey: ["dashboard", "total-customers", context?.options?.range],
    queryFn() {
      return dashboardServices.getTotalCustomers(
        toValue(context?.options?.range)
      );
    },
  });
}

export function useTotalSalesQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const dashboardServices = useDashboardServices();

  return useQuery({
    queryKey: ["dashboard", "total-sales", context?.options?.range],
    queryFn() {
      return dashboardServices.getTotalSales(toValue(context?.options?.range));
    },
  });
}

export function useSalesPricesQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const dashboardServices = useDashboardServices();

  return useQuery({
    queryKey: ["dashboard", "total-sales-prices", context?.options?.range],
    queryFn() {
      return dashboardServices.getSalesPrices(toValue(context?.options?.range));
    },
  });
}

export function useProductsInStockQuery(context?: {
  options?: {
    enabled?: MaybeRefOrGetter<boolean | undefined>;
  };
}) {
  const dashboardServices = useDashboardServices();

  return useQuery({
    queryKey: ["dashboard", "products-in-stock"],
    queryFn() {
      return dashboardServices.getProductsInStock();
    },
    enabled: toRef(
      () =>
        toValue(context?.options?.enabled) ||
        !isDefined(toValue(context?.options?.enabled))
    ),
  });
}

export function useMostSoldProductsQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
    limit?: MaybeRefOrGetter<number | undefined>;
  };
}) {
  const dashboardServices = useDashboardServices();

  return useQuery({
    queryKey: [
      "dashboard",
      "most-sold-products",
      context?.options?.range,
      context?.options?.limit,
    ],
    queryFn() {
      return dashboardServices.getMostSoldProducts({
        range: toValue(context?.options?.range),
        limit: toValue(context?.options?.limit),
      });
    },
  });
}

export function useBestCustomersQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
    limit?: MaybeRefOrGetter<number | undefined>;
  };
}) {
  const dashboardServices = useDashboardServices();

  return useQuery({
    queryKey: [
      "dashboard",
      "best-customers",
      context?.options?.range,
      context?.options?.limit,
    ],
    queryFn() {
      return dashboardServices.getBestCustomers({
        range: toValue(context?.options?.range),
        limit: toValue(context?.options?.limit),
      });
    },
  });
}
