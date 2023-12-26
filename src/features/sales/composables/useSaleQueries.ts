import { useInfiniteQuery } from "@tanstack/vue-query";
import { useSaleServices } from "./useSaleServices";
import { MaybeRefOrGetter } from "vue";

export function useSalesQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
  };
}) {
  const saleServices = useSaleServices();

  return useInfiniteQuery({
    queryKey: ["sales"],
    queryFn({ pageParam }) {
      return saleServices.loadList({
        offset: pageParam,
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
