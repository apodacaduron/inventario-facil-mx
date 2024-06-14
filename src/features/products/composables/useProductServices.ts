import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";
import { Tables } from "../../../../types_db";

export type CreateProduct = {
  product_id?: Product["id"];
  name: Product["name"];
  description: Product["description"];
  image_url: Product["image_url"];
  current_stock: Product["current_stock"];
  retail_price: Product["retail_price"];
  unit_price: Product["unit_price"];
};
export type UpdateProduct = {
  product_id: Product["id"];
} & Partial<CreateProduct>;
export type DeleteProduct = Product["id"];

export type Product = Tables<"i_products">;

export const productServicesTypeguards = {
  isCreateProduct(
    maybeProduct: CreateProduct | UpdateProduct
  ): maybeProduct is CreateProduct {
    return (
      !("product_id" in maybeProduct && maybeProduct.product_id) &&
      "name" in maybeProduct &&
      "description" in maybeProduct &&
      "current_stock" in maybeProduct
    );
  },
  isUpdateProduct(
    maybeProduct: CreateProduct | UpdateProduct
  ): maybeProduct is UpdateProduct {
    return !this.isCreateProduct(maybeProduct);
  },
};

export function useProductServices() {
  const serviceHelpers = useServiceHelpers();

  async function loadList(options: LoadListOptions & { orgId: string }) {
    if (!options.orgId)
      throw new Error("Organization is required to get product list");

    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let productQuery = supabase
      .from("i_products")
      .select("*")
      .eq("org_id", options.orgId)
      .range(from, to);

    if (options?.search) {
      productQuery = productQuery.ilike("name", `%${options.search}%`);
    }

    serviceHelpers.appendFiltersToQuery(productQuery, options);

    return await productQuery;
  }

  async function loadPublicList(options: LoadListOptions & { orgId: string }) {
    if (!options.orgId)
      throw new Error("Organization is required to get product list");

    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let productQuery = supabase
      .from("i_products")
      .select("id,name,current_stock,image_url")
      .eq("org_id", options.orgId)
      .range(from, to);

    if (options?.search) {
      productQuery = productQuery.ilike("name", `%${options.search}%`);
    }

    serviceHelpers.appendFiltersToQuery(productQuery, options);

    return await productQuery;
  }

  async function loadProductStockHistory(options: LoadListOptions & { productId: string | undefined }) {
    if (!options.productId)
      throw new Error("Product is required to get product stock history");

    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let productStockHistoryQuery = supabase
      .from("products_stock_history")
      .select("*")
      .eq("product_id", options.productId)
      .range(from, to);

    serviceHelpers.appendFiltersToQuery(productStockHistoryQuery, options);

    return await productStockHistoryQuery;
  }

  async function createProduct(orgId: string, formValues: CreateProduct) {
    if (!orgId) throw new Error("Organization is required to create a product");

    const { product_id, ...otherFormValues } = formValues;
    await supabase.from("i_products").insert([
      {
        ...otherFormValues,
        org_id: orgId,
      },
    ]);
  }

  async function updateProduct(formValues: UpdateProduct) {
    const { product_id, ...otherFormValues } = formValues;
    await supabase
      .from("i_products")
      .update({
        ...otherFormValues,
      })
      .eq("id", product_id);
  }

  async function deleteProduct(productId: DeleteProduct) {
    if (!productId)
      throw new Error("Product id is required to delete a product");

    await supabase.from("i_products").delete().eq("id", productId);
  }

  async function getProductCount(options: {
    orgId: string;
    range?: { from: string; to: string };
  }) {
    if (!options.orgId)
      throw new Error("Organization is required to get product count");

    return await supabase.rpc("get_products_count", {
      organization_id_input: options.orgId,
      ...(options.range
        ? {
            start_date_input: options.range.from,
            end_date_input: options.range.to,
          }
        : {}),
    });
  }
  async function getProductsInStockCount(options: {
    orgId: string;
    range?: { from: string; to: string };
  }) {
    if (!options.orgId)
      throw new Error("Organization is required to get product count");

    return await supabase.rpc("get_products_in_stock_count", {
      organization_id_input: options.orgId,
      ...(options.range
        ? {
            start_date_input: options.range.from,
            end_date_input: options.range.to,
          }
        : {}),
    });
  }
  async function getMostSoldProducts(options: {
    orgId: string;
    range?: { from: string; to: string };
  }) {
    if (!options.orgId)
      throw new Error("Organization is required to get product count");

    return await supabase.rpc("get_most_sold_products", {
      organization_id_input: options.orgId,
      ...(options.range
        ? {
            start_date_input: options.range.from,
            end_date_input: options.range.to,
          }
        : {}),
    });
  }

  return {
    loadList,
    loadPublicList,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductCount,
    getProductsInStockCount,
    getMostSoldProducts,
    loadProductStockHistory,
  };
}
