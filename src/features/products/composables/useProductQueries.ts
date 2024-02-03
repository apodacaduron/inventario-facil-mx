import { useInfiniteQuery } from "@tanstack/vue-query";
import {
  ProductFilterParams,
  ProductOrderParam,
  useProductServices,
} from "./useProductServices";
import { MaybeRefOrGetter, toValue } from "vue";

export function useProductsQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<ProductFilterParams | undefined>;
    order?: MaybeRefOrGetter<ProductOrderParam | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: [
      "products",
      context.options.search,
      context.options.filters,
      context.options.order,
    ],
    queryFn({ pageParam }) {
      return productServices.loadList({
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

export function useProductsByIdsQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    productIds: MaybeRefOrGetter<string[] | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: ["products", context.options.productIds],
    queryFn({ pageParam }) {
      return productServices.loadListByIds({
        offset: pageParam,
        productIds: toValue(context.options.productIds) ?? [],
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
