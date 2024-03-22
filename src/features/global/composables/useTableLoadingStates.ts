import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { InfiniteData, UseInfiniteQueryReturnType } from "@tanstack/vue-query";
import { MaybeRefOrGetter, computed, toValue } from "vue";

export function useTableLoadingStates<
  T extends PostgrestSingleResponse<unknown[]>,
  S extends string
>(
  query: UseInfiniteQueryReturnType<InfiniteData<T>, Error>,
  maybeSearchRef: MaybeRefOrGetter<S>
) {
  const showLoadingState = computed(() => query.isLoading.value);
  const showNoResultsState = computed(
    () =>
      !query.isLoading.value &&
      query.isSuccess.value &&
      !query.data.value?.pages.some((page) => page.data?.length) &&
      toValue(maybeSearchRef)
  );
  const showEmptyState = computed(
    () =>
      !query.isLoading.value &&
      query.isSuccess.value &&
      !query.data.value?.pages.some((page) => page.data?.length) &&
      !toValue(maybeSearchRef)
  );

  return {
    showEmptyState,
    showNoResultsState,
    showLoadingState,
  };
}
