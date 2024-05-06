import { useQuery } from '@tanstack/vue-query';
import { useAssetServices } from './useAssetServices';
import { MaybeRefOrGetter, toRef, toValue } from 'vue';

export function useAssetByUrlQuery(context?: {
  options: {
    url?: MaybeRefOrGetter<string | null | undefined>;
    enabled: MaybeRefOrGetter<boolean>;
  };
}) {
  const assetServices = useAssetServices();

  return useQuery({
    queryKey: ['assets', 'url', context?.options?.url],
    async queryFn() {
      const response = await assetServices.getAssetByUrl(
        toValue(context?.options?.url)
      );

      return response?.data;
    },
    enabled: toRef(() => Boolean(toValue(context?.options?.enabled)))
  });
}
