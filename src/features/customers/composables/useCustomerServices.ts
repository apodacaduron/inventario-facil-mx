import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";

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

export function useCustomerServices() {
  const serviceHelpers = useServiceHelpers();

  async function loadList(options?: LoadListOptions) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error("Organization is required to get customer list");

    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let customerQuery = supabase
      .from("i_customers")
      .select("*")
      .eq("org_id", organization.org_id)
      .range(from, to);

    if (options?.search) {
      customerQuery = customerQuery.ilike("name", `%${options.search}%`);
    }

    if (options?.order) {
      const [column = "created_at", order = "desc"] = options?.order;
      customerQuery = customerQuery.order(column, {
        ascending: order === "asc",
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        customerQuery = customerQuery.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await customerQuery;
  }

  async function createCustomer(formValues: CreateCustomer) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error("Organization is required to create a customer");

    const { customer_id, ...otherFormValues } = formValues;
    await supabase.from("i_customers").insert([
      {
        ...otherFormValues,
        org_id: organization.org_id,
      },
    ]);
  }

  async function updateCustomer(formValues: UpdateCustomer) {
    const organization = serviceHelpers.getCurrentOrganization();
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

  async function getCustomerCount() {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get customer count');

    return await supabase
      .from('i_customers')
      .select('*', { count: 'estimated' })
      .eq('org_id', organization.org_id);
  }

  return {
    loadList,
    createCustomer,
    deleteCustomer,
    updateCustomer,
    getCustomerCount,
  };
}
