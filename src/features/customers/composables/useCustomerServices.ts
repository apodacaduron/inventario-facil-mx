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

export function useCustomerServices() {
  const serviceHelpers = useServiceHelpers();

  async function loadList(options: LoadListOptions & {orgId: string}) {
    if (!options.orgId)
      throw new Error("Organization is required to get customer list");

    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let customerQuery = supabase
      .from("i_customers")
      .select("*")
      .eq("org_id", options.orgId)
      .range(from, to);

    if (options?.search) {
      customerQuery = customerQuery.or(
        `name.ilike.%${options.search}%, phone.ilike.%${options.search}%`
      );
    }

    serviceHelpers.appendFiltersToQuery(customerQuery, options);

    return await customerQuery;
  }

  async function createCustomer(orgId: string, formValues: CreateCustomer) {
    if (!orgId)
      throw new Error("Organization is required to create a customer");

    const { customer_id, ...otherFormValues } = formValues;
    return await supabase.from("i_customers").insert([
      {
        ...otherFormValues,
        org_id: orgId,
      },
    ]);
  }

  async function updateCustomer(orgId: string, formValues: UpdateCustomer) {
    if (!orgId)
      throw new Error("Organization is required to update a customer");

    const { customer_id, ...otherFormValues } = formValues;
    return await supabase
      .from("i_customers")
      .update({
        ...otherFormValues,
        org_id: orgId,
      })
      .eq("id", customer_id);
  }

  async function deleteCustomer(customerId: DeleteCustomer) {
    if (!customerId)
      throw new Error("Customer id is required to delete a customer");

    return await supabase.from("i_customers").delete().eq("id", customerId);
  }

  async function getCustomerCount(options: {
    orgId: string;
    range?: { from: string; to: string };
  }) {
    if (!options.orgId)
      throw new Error("Organization is required to get customer count");

    return await supabase.rpc("get_customers_count", {
      organization_id_input: options.orgId,
      ...(options.range
        ? { start_date_input: options.range.from, end_date_input: options.range.to }
        : {}),
    });
  }

  async function getBestCustomers(options: {
    orgId: string;
    range?: { from: string; to: string };
  }) {
    if (!options.orgId)
      throw new Error("Organization is required to get customer count");

    return await supabase.rpc("get_best_customers", {
      organization_id_input: options.orgId,
      ...(options.range
        ? { start_date_input: options.range.from, end_date_input: options.range.to }
        : {}),
    });
  }

  return {
    loadList,
    createCustomer,
    deleteCustomer,
    updateCustomer,
    getCustomerCount,
    getBestCustomers,
  };
}
