import { useInfiniteQuery } from "@tanstack/vue-query";
import { useSaleServices } from "./useSaleServices";
import { MaybeRefOrGetter, toValue } from "vue";

export function useSalesQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useInfiniteQuery({
    queryKey: ["sales", context.options.search],
    queryFn({ pageParam }) {
      return saleServices.loadList({
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
