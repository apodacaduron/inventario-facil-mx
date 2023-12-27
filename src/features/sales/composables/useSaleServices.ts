import { supabase } from "@/config/supabase";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";

export type CreateSale = {
  sale_date: Sale["sale_date"];
  status: NonNullable<Sale["status"]>;
  customer_id: NonNullable<Sale["customer_id"]>;
  products: {
    product_id: SaleProduct["product_id"];
    price: SaleProduct["price"];
    qty: SaleProduct["qty"];
  }[];
};
export type UpdateSale = {
  sale_id: Sale["id"];
} & Pick<CreateSale, "status">;
export type DeleteSale = Sale["id"];

export type SaleList = Awaited<
  ReturnType<ReturnType<typeof useSaleServices>["loadList"]>
>["data"];
export type Sale = NonNullable<SaleList>[number];
export const SALE_STATUS = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "returned",
] as const;
export type SaleProduct = Sale["i_sale_products"][number];

export const saleServicesTypeguards = {
  isCreateSale(maybeSale: CreateSale | UpdateSale): maybeSale is CreateSale {
    return (
      !("sale_id" in (maybeSale as CreateSale)) &&
      "sale_date" in maybeSale &&
      "status" in maybeSale &&
      "customer_id" in maybeSale
    );
  },
  isUpdateSale(maybeSale: CreateSale | UpdateSale): maybeSale is UpdateSale {
    return !this.isCreateSale(maybeSale);
  },
};

export const PAGINATION_LIMIT = 30;

export function useSaleServices() {
  const organizationStore = useOrganizationStore();
  const route = useRoute();
  const orgId = route.params.orgId;

  async function loadList(options?: { offset?: number }) {
    const offset = options?.offset ?? 0;
    const from = offset * PAGINATION_LIMIT;
    const to = from + PAGINATION_LIMIT - 1;

    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get sale list");

    const saleSearch = supabase
      .from("i_sales")
      .select("*, i_sale_products(*, i_products(*)), i_customers(*)")
      .eq("org_id", organization.org_id)
      .range(from, to)
      .order("created_at", { ascending: false });

    return await saleSearch;
  }

  async function createSale(formValues: CreateSale) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to create a sale");
    const createdSaleResponse = await supabase
      .from("i_sales")
      .insert([
        {
          status: formValues.status,
          sale_date: formValues.sale_date,
          customer_id: formValues.customer_id,
          org_id: organization.org_id,
        },
      ])
      .select()
      .single();
    if (!createdSaleResponse.data?.id)
      throw new Error("Sale id is required to add to sale detail");
    await supabase.from("i_sale_products").insert(
      formValues.products.map((product) => ({
        sale_id: createdSaleResponse.data.id,
        product_id: product.product_id,
        qty: product.qty,
        price: product.price,
      }))
    );
  }

  async function updateSale(formValues: UpdateSale) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to update a sale");
    await supabase
      .from("i_sales")
      .update({
        status: formValues.status,
      })
      .eq("id", formValues.sale_id);
  }

  async function deleteSale(saleId: DeleteSale) {
    if (!saleId) throw new Error("Sale id is required to delete a sale");

    await supabase.from("i_sales").delete().eq("id", saleId);
  }

  return { loadList, createSale, deleteSale, updateSale };
}
