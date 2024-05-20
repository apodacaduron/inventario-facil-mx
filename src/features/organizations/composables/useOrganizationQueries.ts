import { useQuery } from '@tanstack/vue-query';
import { MaybeRefOrGetter, toValue } from 'vue';
import { useOrganizationServices } from './useOrganizationServices';

const organizationServices = useOrganizationServices();

export function useOrganizationByIdQuery(context: {
  options: {
    enabled?: MaybeRefOrGetter<boolean | undefined>;
    organization_id?: MaybeRefOrGetter<string | undefined>;
  };
}) {
  return useQuery({
    queryKey: [
      'organization',
      context.options.organization_id,
    ],
    queryFn() {
      return organizationServices.loadById({
        organization_id: toValue(context.options.organization_id),
      });
    },
    enabled: context.options.enabled,
  });
}
