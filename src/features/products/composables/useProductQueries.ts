import { useInfiniteQuery, useQuery } from '@tanstack/vue-query';
import { useProductServices } from './useProductServices';
import { MaybeRefOrGetter, toValue } from 'vue';
import { LoadListOptions } from '@/features/global';

export function useProductsQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions['filters'] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions['order'] | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: [
      'products',
      context.options.search,
      context.options.filters,
      context.options.order,
      context.options.orgId,
    ],
    queryFn({ pageParam }) {
      return productServices.loadList({
        offset: pageParam,
        search: toValue(context.options.search),
        filters: toValue(context.options.filters),
        order: toValue(context.options.order),
        orgId: toValue(context.options.orgId),
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

export function useProductStockHistoryQuery(context: {
  options: {
    productId: MaybeRefOrGetter<string | undefined>;
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions['filters'] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions['order'] | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: [
      'products',
      context.options.search,
      context.options.filters,
      context.options.order,
      context.options.productId,
    ],
    queryFn({ pageParam }) {
      return productServices.loadProductStockHistory({
        offset: pageParam,
        search: toValue(context.options.search),
        filters: toValue(context.options.filters),
        order: toValue(context.options.order),
        productId: toValue(context.options.productId),
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
    orgId: MaybeRefOrGetter<string>;
    enabled: MaybeRefOrGetter<boolean | undefined>;
    search: MaybeRefOrGetter<string | undefined>;
    filters?: MaybeRefOrGetter<LoadListOptions['filters'] | undefined>;
    order?: MaybeRefOrGetter<LoadListOptions['order'] | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useInfiniteQuery({
    queryKey: [
      'products',
      context.options.search,
      context.options.filters,
      context.options.order,
      context.options.orgId,
    ],
    queryFn({ pageParam }) {
      return productServices.loadPublicList({
        offset: pageParam,
        search: toValue(context.options.search),
        filters: toValue(context.options.filters),
        order: toValue(context.options.order),
        orgId: toValue(context.options.orgId),
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

export function useProductsCountQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useQuery({
    queryKey: ['products', 'count', context.options.orgId, context?.options?.range],
    async queryFn() {
      const response = await productServices.getProductCount({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range)
      });

      return response.data ?? 0;
    },
  });
}
export function useProductsInStockCountQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useQuery({
    queryKey: ['products', 'count', 'in-stock', context.options.orgId, context?.options?.range],
    async queryFn() {
      const response = await productServices.getProductsInStockCount({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range)
      });

      return response.data ?? 0;
    },
  });
}
export function useMostSoldProductsQuery(context: {
  options: {
    orgId: MaybeRefOrGetter<string>;
    range?: MaybeRefOrGetter<{ from: string; to: string } | undefined>;
  };
}) {
  const productServices = useProductServices();

  return useQuery({
    queryKey: ['products', 'most-sold', context.options.orgId, context?.options?.range],
    async queryFn() {
      const response = await productServices.getMostSoldProducts({
        orgId: toValue(context.options.orgId),
        range: toValue(context?.options?.range)
      });

      return response.data;
    },
  });
}
