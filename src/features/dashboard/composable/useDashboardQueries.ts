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
