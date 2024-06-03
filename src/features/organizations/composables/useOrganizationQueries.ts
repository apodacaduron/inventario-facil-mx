import { useQuery } from '@tanstack/vue-query';
import { MaybeRefOrGetter, toValue } from 'vue';
import { useOrganizationServices } from './useOrganizationServices';

const organizationServices = useOrganizationServices();

export function useUserOrganizationsQuery(context: {
  options: {
    enabled?: MaybeRefOrGetter<boolean | undefined>;
    userId: MaybeRefOrGetter<string | undefined>;
  };
}) {
  return useQuery({
    queryKey: [
      'organization',
      'user-organizations',
      context.options.userId,
    ],
    queryFn() {
      return organizationServices.loadUserOrganizations({
        userId: toValue(context.options.userId),
      });
    },
    enabled: context.options.enabled,
    refetchOnWindowFocus: true,
    staleTime: 1_000
  });
}

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
