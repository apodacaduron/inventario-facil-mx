import { supabase } from "@/config/supabase";
import { Customer } from "@/features/customers";
import { SaleProduct } from "@/features/sales";
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

    let supabaseSalesQuery = supabase
      .from("i_sales")
      .select("shipping_cost")
      .eq("status", "completed")
      .eq("org_id", organization.org_id);
    let supabaseQuery = supabase
      .from("i_sale_products")
      .select("price, unit_price, qty, created_at, i_sales!inner(status)")
      .eq("org_id", organization.org_id)
      .filter("i_sales.status", "eq", "completed");

    if (range) {
      supabaseSalesQuery
        .gt("created_at", range.from)
        .lt("created_at", range.to);
      supabaseQuery.gt("created_at", range.from).lt("created_at", range.to);
    }
    const { data } = await supabaseQuery;

    const sumShippingCosts = (await supabaseSalesQuery).data?.reduce(
      (acc, sale) => acc + (sale.shipping_cost ?? 0),
      0
    );
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
      sale_price_total:
        (sumPrices?.sale_price_total ?? 0) + (sumShippingCosts ?? 0),
      profit_total:
        (sumPrices?.sale_price_total ?? 0) -
        (sumPrices?.unit_price_total ?? 0) +
        (sumShippingCosts ?? 0),
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

  async function getMostSoldProducts(options: {
    range?: { from: string; to: string };
    limit?: number;
  }) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get sales count");

    let supabaseQuery = supabase
      .from("i_sale_products")
      .select("*, i_products(*)")
      .eq("org_id", organization.org_id)
      .order("qty", { ascending: false });

    if (options.range) {
      supabaseQuery
        .gt("created_at", options.range.from)
        .lt("created_at", options.range.to);
    }

    const response = await supabaseQuery;

    // Perform grouping in JavaScript
    const groupedProducts =
      response.data?.reduce<
        Record<string, SaleProduct & { total_sold: number }>
      >((acc, item) => {
        const productId = item.product_id;
        const qty = item.qty;

        if (!productId || !qty) return acc;

        if (!acc[productId]) {
          acc[productId] = {
            ...item,
            total_sold: 0,
          };
        }

        acc[productId] = {
          ...item,
          total_sold: acc[productId].total_sold + qty,
        };

        return acc;
      }, {}) ?? {};

    // Convert the grouped data to an array of objects
    const sortedResults = Object.values(groupedProducts).sort(
      (a, b) => b.total_sold - a.total_sold
    );

    const DEFAULT_LIMIT = 3;
    const topProducts = sortedResults.slice(0, options.limit ?? DEFAULT_LIMIT);

    return topProducts;
  }

  async function getBestCustomers(options: {
    range?: { from: string; to: string };
    limit?: number;
  }) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get sales count");

    let supabaseQuery = supabase
      .from("i_sale_products")
      .select("*, i_sales(*, i_customers(*))")
      .eq("org_id", organization.org_id)
      .order("qty", { ascending: false });

    if (options.range) {
      supabaseQuery
        .gt("created_at", options.range.from)
        .lt("created_at", options.range.to);
    }

    const response = await supabaseQuery;

    // Perform grouping in JavaScript
    const groupedProducts =
      response.data?.reduce<Record<string, Customer & { total_sold: number }>>(
        (acc, item) => {
          const customerData = item.i_sales?.i_customers;
          const customerId = customerData?.id;
          const qty = item.qty;

          if (!customerData || !customerId || !qty) return acc;

          if (!acc[customerId]) {
            acc[customerId] = {
              ...customerData,
              total_sold: 0,
            };
          }

          acc[customerId] = {
            ...customerData,
            total_sold: acc[customerId].total_sold + qty,
          };

          return acc;
        },
        {}
      ) ?? {};

    // Convert the grouped data to an array of objects
    const sortedResults = Object.values(groupedProducts).sort(
      (a, b) => b.total_sold - a.total_sold
    );

    const DEFAULT_LIMIT = 3;
    const topCustomers = sortedResults.slice(0, options.limit ?? DEFAULT_LIMIT);

    return topCustomers;
  }

  return {
    getTotalCustomers,
    getTotalSales,
    getSalesPrices,
    getProductsInStock,
    getMostSoldProducts,
    getBestCustomers,
  };
}
