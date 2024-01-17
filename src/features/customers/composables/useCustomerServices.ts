import { supabase } from "@/config/supabase";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";

export type CreateCustomer = {
  customer_id?: Customer["id"];
  name: Customer["name"];
  phone: Customer["phone"];
  email: Customer["email"];
  address: Customer["address"];
  map_url: Customer["map_url"];
  trust_status: NonNullable<Customer["trust_status"]>;
  notes: Customer["notes"];
};
export type UpdateCustomer = {
  customer_id: Customer["id"];
} & CreateCustomer;
export type DeleteCustomer = Customer["id"];

export type CustomerList = Awaited<
  ReturnType<ReturnType<typeof useCustomerServices>["loadList"]>
>["data"];
export type Customer = NonNullable<CustomerList>[number];

export type CustomerFilters = Array<{
  column: string;
  operator: string;
  value: any;
}>;

export const TRUST_STATUS = ["trusted", "not_trusted"] as const;
export const customerServicesTypeguards = {
  isCreateCustomer(
    maybeCustomer: CreateCustomer | UpdateCustomer
  ): maybeCustomer is CreateCustomer {
    return (
      !("customer_id" in maybeCustomer && maybeCustomer.customer_id) &&
      "name" in maybeCustomer &&
      "phone" in maybeCustomer &&
      "email" in maybeCustomer
    );
  },
  isUpdateCustomer(
    maybeCustomer: CreateCustomer | UpdateCustomer
  ): maybeCustomer is UpdateCustomer {
    return !this.isCreateCustomer(maybeCustomer);
  },
};

export const PAGINATION_LIMIT = 30;

export function useCustomerServices() {
  const organizationStore = useOrganizationStore();
  const route = useRoute();
  const orgId = route.params.orgId;

  async function loadList(options?: {
    offset?: number;
    search?: string;
    filters?: CustomerFilters;
  }) {
    const offset = options?.offset ?? 0;
    const from = offset * PAGINATION_LIMIT;
    const to = from + PAGINATION_LIMIT - 1;

    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get customer list");

    let customerSearch = supabase
      .from("i_customers")
      .select("*")
      .eq("org_id", organization.org_id)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (options?.search) {
      customerSearch = customerSearch.textSearch("name", options.search, {
        type: "plain",
      });
    }
    if (options?.filters) {
      options?.filters.forEach((filter) => {
        customerSearch = customerSearch.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await customerSearch;
  }

  async function createCustomer(formValues: CreateCustomer) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to create a customer");
    const { customer_id, ...otherFormValues } = formValues;
    await supabase
      .from("i_customers")
      .insert([
        {
          ...otherFormValues,
          org_id: organization.org_id,
        },
      ])
      .select()
      .single();
  }

  async function updateCustomer(formValues: UpdateCustomer) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to update a customer");
    const { customer_id, ...otherFormValues } = formValues;
    await supabase
      .from("i_customers")
      .update({
        ...otherFormValues,
        org_id: organization.org_id,
      })
      .eq("id", customer_id);
  }

  async function deleteCustomer(customerId: DeleteCustomer) {
    if (!customerId)
      throw new Error("Customer id is required to delete a customer");

    await supabase.from("i_customers").delete().eq("id", customerId);
  }

  return { loadList, createCustomer, deleteCustomer, updateCustomer };
}
