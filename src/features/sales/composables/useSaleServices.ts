import { supabase } from "@/config/supabase";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";

export type CreateSale = {
  sale_date: Sale["sale_date"];
  status: NonNullable<Sale["status"]>;
  customer_id: NonNullable<Sale["customer_id"]>;
  notes: NonNullable<Sale["notes"]>;
  shipping_cost: NonNullable<Sale["shipping_cost"]>;
  products: {
    product_id: SaleProduct["product_id"];
    price: SaleProduct["price"];
    unit_price: SaleProduct["unit_price"];
    qty: SaleProduct["qty"];
    // This 2 field are not stored in DB
    name: NonNullable<SaleProduct["i_products"]>['name'];
    image_url: NonNullable<SaleProduct["i_products"]>['image_url'];
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
export const SALE_STATUS = ["in_progress", "completed", "cancelled"] as const;
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
          status: "in_progress",
          sale_date: formValues.sale_date,
          customer_id: formValues.customer_id,
          shipping_cost: formValues.shipping_cost,
          notes: formValues.notes,
          org_id: organization.org_id,
        },
      ])
      .select()
      .single();
    if (!createdSaleResponse.data?.id)
      throw new Error("Sale id is required to add to sale detail");

    const formattedSaleProducts = formValues.products.map((product) => ({
      sale_id: createdSaleResponse.data.id,
      product_id: product.product_id,
      qty: product.qty,
      price: product.price,
      unit_price: product.unit_price,
      org_id: organization.org_id,
    }));
    await supabase.from("i_sale_products").insert(formattedSaleProducts);
    formValues.products.map(async ({ product_id, qty }) => {
      if (!product_id) return;
      const productResponse = await supabase
        .from("i_products")
        .select("current_stock")
        .eq("id", product_id)
        .single();

      let nextCurrentStock = productResponse.data?.current_stock ?? 0;
      let formQty = qty ?? 0;
      if (formValues.status === "in_progress") {
        nextCurrentStock = nextCurrentStock - formQty;
      }
      await supabase
        .from("i_products")
        .update({ current_stock: nextCurrentStock })
        .eq("id", product_id);
    });
  }

  async function updateSale(formValues: UpdateSale) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to update a sale");
    const saleResponse = await supabase
      .from("i_sales")
      .select()
      .eq("id", formValues.sale_id)
      .single();
    await supabase
      .from("i_sales")
      .update({
        status: formValues.status,
      })
      .eq("id", formValues.sale_id);

    if (saleResponse.data?.status === formValues.status) return;
    const saleProductsResponse = await supabase
      .from("i_sale_products")
      .select()
      .eq("sale_id", formValues.sale_id);

    saleProductsResponse.data?.map(async ({ product_id, qty }) => {
      if (!product_id) return;
      const productResponse = await supabase
        .from("i_products")
        .select("current_stock")
        .eq("id", product_id)
        .single();

      let nextCurrentStock = productResponse.data?.current_stock ?? 0;
      let formQty = qty ?? 0;
      if (formValues.status === "in_progress") {
        nextCurrentStock = nextCurrentStock - formQty;
      } else if (formValues.status === "cancelled") {
        nextCurrentStock = nextCurrentStock + formQty;
      }
      await supabase
        .from("i_products")
        .update({ current_stock: nextCurrentStock })
        .eq("id", product_id);
    });
  }

  async function deleteSale(saleId: DeleteSale) {
    if (!saleId) throw new Error("Sale id is required to delete a sale");

    await supabase.from("i_sales").delete().eq("id", saleId);
  }

  return { loadList, createSale, deleteSale, updateSale };
}
