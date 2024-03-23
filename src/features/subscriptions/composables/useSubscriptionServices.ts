import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";
import { useAuthStore } from "@/stores";

export type CreateSubscription = {
  subscription_id?: Subscription["id"];
  user_id: Subscription["user_id"];
  plan_id: Subscription["plan_id"];
  start_date: Subscription["start_date"];
  end_date: Subscription["end_date"];
};
export type UpdateSubscription = {
  subscription_id: Subscription["id"];
} & Partial<CreateSubscription>;
export type DeleteSubscription = Subscription["id"];

export type SubscriptionList = Awaited<
  ReturnType<ReturnType<typeof useSubscriptionServices>["loadList"]>
>["data"];
export type Subscription = NonNullable<SubscriptionList>[number];

export const subscriptionServicesTypeguards = {
  isCreateSubscription(
    maybeSubscription: CreateSubscription | UpdateSubscription
  ): maybeSubscription is CreateSubscription {
    return (
      !(
        'subscription_id' in maybeSubscription &&
        maybeSubscription.subscription_id
      ) &&
      'plan_id' in maybeSubscription &&
      'user_id' in maybeSubscription &&
      'start_date' in maybeSubscription &&
      'end_date' in maybeSubscription
    );
  },
  isUpdateSubscription(
    maybeSubscription: CreateSubscription | UpdateSubscription
  ): maybeSubscription is UpdateSubscription {
    return !this.isCreateSubscription(maybeSubscription);
  },
  isSubscription(
    maybeSubscription: unknown
  ): maybeSubscription is Subscription {
    return (
      maybeSubscription !== null &&
      typeof maybeSubscription === 'object' &&
      'start_date' in maybeSubscription &&
      'end_date' in maybeSubscription
    );
  },
  isPlan(maybePlan: unknown): maybePlan is Subscription['plans'] {
    return maybePlan !== null &&
      typeof maybePlan === 'object' && 'name' in maybePlan && 'price' in maybePlan && 'max_products' in maybePlan;
  },
};

export function useSubscriptionServices() {
  const serviceHelpers = useServiceHelpers();
  const authStore = useAuthStore();

  async function loadList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let subscriptionQuery = supabase
      .from("subscriptions")
      .select("*, plans(*), users!inner(*)")
      .range(from, to);

    if (options?.search) {
      subscriptionQuery = subscriptionQuery.ilike(
        "users.full_name",
        `%${options.search}%`
      );
    }

    if (options?.order) {
      const [column = "created_at", order = "desc"] = options?.order;
      subscriptionQuery = subscriptionQuery.order(column, {
        ascending: order === "asc",
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        subscriptionQuery = subscriptionQuery.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await subscriptionQuery;
  }

  async function loadPlanList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let planQuery = supabase.from("plans").select("*").range(from, to);

    if (options?.search) {
      planQuery = planQuery.ilike("name", `%${options.search}%`);
    }

    if (options?.order) {
      const [column = "created_at", order = "desc"] = options?.order;
      planQuery = planQuery.order(column, {
        ascending: order === "asc",
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        planQuery = planQuery.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await planQuery;
  }

  async function getCurrentSubscription() {
    const userId = authStore.session?.user.id;
    if (!userId) throw new Error('User id is required to get current subscription')
    const currentDate = new Date();

    let subscriptionQuery = supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .lte('start_date', currentDate.toISOString())
      .gte('end_date', currentDate.toISOString())
      .single();

    const response = await subscriptionQuery;
    const hasSubscription = Boolean(response.data)

    if (!hasSubscription) {
      const freemiumPlanQuery = supabase.from('plans').select('*').eq('name', 'freemium').single()
      return await freemiumPlanQuery;
    }

    return response
  }

  async function createSubscription(formValues: CreateSubscription) {
    const { subscription_id, ...otherFormValues } = formValues;
    await supabase.from("subscriptions").insert([
      {
        ...otherFormValues,
      },
    ]);
  }

  async function updateSubscription(formValues: UpdateSubscription) {
    const { subscription_id, ...otherFormValues } = formValues;
    await supabase
      .from("subscriptions")
      .update({
        ...otherFormValues,
      })
      .eq("id", subscription_id);
  }

  async function deleteSubscription(subscriptionId: DeleteSubscription) {
    if (!subscriptionId)
      throw new Error("Subscription id is required to delete a subscription");

    await supabase.from("subscriptions").delete().eq("id", subscriptionId);
  }

  return {
    loadList,
    loadPlanList,
    createSubscription,
    deleteSubscription,
    updateSubscription,
    getCurrentSubscription,
  };
}
