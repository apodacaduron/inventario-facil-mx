import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { InfiniteData, UseInfiniteQueryReturnType } from "@tanstack/vue-query";
import { computed } from "vue";

export function useTableLoadingStates<
  T extends PostgrestSingleResponse<unknown[]>
>(query: UseInfiniteQueryReturnType<InfiniteData<T>, Error>) {
  const hasRecordList = computed(
    () =>
      query.isSuccess.value &&
      query.data.value?.pages.some((page) => page.data?.length)
  );

  return {
    hasRecordList,
  };
}
