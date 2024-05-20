import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';
import { useProductServices } from './useProductServices';
import { MaybeRefOrGetter, toValue } from 'vue';
import { LoadListOptions } from '@/features/global';

export function useProductsQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions['filters'] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions['order'] | undefined>;
    organization_id?: MaybeRefOrGetter<string | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: [
      'products',
      context.options.search,
      context.options.filters,
      context.options.order,
      context.options.organization_id,
    ],
    queryFn({ pageParam }) {
      return productServices.loadList({
        offset: pageParam,
        search: toValue(context.options.search),
        filters: toValue(context.options.filters),
        order: toValue(context.options.order),
        organization_id: toValue(context.options.organization_id),
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

export function usePublicPageProductsQuery(context: {
  options: {
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions['filters'] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions['order'] | undefined>;
    organization_id?: MaybeRefOrGetter<string | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: [
      'products',
      context.options.search,
      context.options.filters,
      context.options.order,
      context.options.organization_id,
    ],
    queryFn({ pageParam }) {
      return productServices.loadPublicList({
        offset: pageParam,
        search: toValue(context.options.search),
        filters: toValue(context.options.filters),
        order: toValue(context.options.order),
        organization_id: toValue(context.options.organization_id),
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

export function useProductsCountQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useQuery({
    queryKey: ['products', 'count', context?.options?.range],
    async queryFn() {
      const response = await productServices.getProductCount(
        toValue(context?.options?.range)
      );

      return response.data ?? 0;
    },
  });
}
export function useProductsInStockCountQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useQuery({
    queryKey: ['products', 'count', 'in-stock', context?.options?.range],
    async queryFn() {
      const response = await productServices.getProductsInStockCount(
        toValue(context?.options?.range)
      );

      return response.data ?? 0;
    },
  });
}
export function useMostSoldProductsQuery(context?: {
  options?: {
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useQuery({
    queryKey: ['products', 'most-sold', context?.options?.range],
    async queryFn() {
      const response = await productServices.getMostSoldProducts(
        toValue(context?.options?.range)
      );

      return response.data;
    },
  });
}
