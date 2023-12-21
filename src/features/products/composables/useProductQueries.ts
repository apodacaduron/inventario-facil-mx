import { useInfiniteQuery } from "@tanstack/vue-query";
import { useProductServices } from "./useProductServices";
import { MaybeRefOrGetter, toValue } from "vue";

export function useProductsQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: ["products", context.options.search],
    queryFn({ pageParam }) {
      return productServices.loadList({
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
