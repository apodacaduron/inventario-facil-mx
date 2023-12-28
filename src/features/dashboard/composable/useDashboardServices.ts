import { supabase } from "@/config/supabase";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";

export function useDashboardServices() {
  const organizationStore = useOrganizationStore();
  const route = useRoute();
  const orgId = route.params.orgId;

  async function getTotalCustomers(range?: { from: string; to: string }) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get customer count");

    let supabaseQuery = supabase
      .from("i_customers")
      .select("id", { count: "exact", head: true })
      .eq("org_id", organization.org_id);

    if (range) {
      supabaseQuery.gt("created_at", range.from).lt("created_at", range.to);
    }
    const { count } = await supabaseQuery;

    return count ?? 0;
  }

  async function getTotalSales(range?: { from: string; to: string }) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get sales count");

    let supabaseQuery = supabase
      .from("i_sales")
      .select("id", { count: "exact", head: true })
      .eq("org_id", organization.org_id);

    if (range) {
      supabaseQuery.gt("created_at", range.from).lt("created_at", range.to);
    }
    const { count } = await supabaseQuery;

    return count ?? 0;
  }

  async function getSalesPrices(range?: { from: string; to: string }) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get sales count");

    let supabaseQuery = supabase
      .from("i_sale_products")
      .select("price, unit_price, qty, created_at")
      .eq("org_id", organization.org_id);

    if (range) {
      supabaseQuery.gt("created_at", range.from).lt("created_at", range.to);
    }
    const { data } = await supabaseQuery;

    const sumPrices = data?.reduce(
      (acc, salePrices) => ({
        ...acc,
        sale_price_total:
          acc.sale_price_total +
          (salePrices.price ?? 0) * (salePrices.qty ?? 0),
        unit_price_total:
          acc.unit_price_total +
          (salePrices.unit_price ?? 0) * (salePrices.qty ?? 0),
      }),
      {
        sale_price_total: 0,
        unit_price_total: 0,
      }
    );
    const sumPricesWithProfit = {
      ...sumPrices,
      profit_total:
        (sumPrices?.sale_price_total ?? 0) - (sumPrices?.unit_price_total ?? 0),
    };

    return sumPricesWithProfit;
  }

  async function getProductsInStock() {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get sales count");

    let supabaseQuery = supabase
      .from("i_products")
      .select("*")
      .eq("org_id", organization.org_id)
      .gt("current_stock", 0)
      .order("current_stock", { ascending: false });

    return await supabaseQuery;
  }

  return {
    getTotalCustomers,
    getTotalSales,
    getSalesPrices,
    getProductsInStock,
  };
}
