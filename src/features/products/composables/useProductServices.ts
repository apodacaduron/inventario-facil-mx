import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";

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

export type ProductList = Awaited<
  ReturnType<ReturnType<typeof useProductServices>["loadList"]>
>["data"];
export type Product = NonNullable<ProductList>[number];

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

  async function loadList(options?: LoadListOptions) {
    if (!options?.organization_id)
      throw new Error("Organization is required to get product list");

    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let productQuery = supabase
      .from("i_products")
      .select("*")
      .eq("org_id", options?.organization_id)
      .range(from, to);

    if (options?.search) {
      productQuery = productQuery.ilike("name", `%${options.search}%`);
    }

    if (options?.order) {
      const [column = "created_at", order = "desc"] = options?.order;
      productQuery = productQuery.order(column, {
        ascending: order === "asc",
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        productQuery = productQuery.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await productQuery;
  }

  async function createProduct(formValues: CreateProduct) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error("Organization is required to create a product");

    const { product_id, ...otherFormValues } = formValues;
    await supabase.from("i_products").insert([
      {
        ...otherFormValues,
        org_id: organization.org_id,
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

  async function getProductCount(range?: { from: string; to: string }) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get product count');

    return await supabase.rpc('get_products_count', {
      organization_id_input: organization.org_id,
      ...(range
        ? { start_date_input: range.from, end_date_input: range.to }
        : {}),
    });
  }
  async function getProductsInStockCount(range?: { from: string; to: string }) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get product count');

    return await supabase.rpc('get_products_in_stock_count', {
      organization_id_input: organization.org_id,
      ...(range
        ? { start_date_input: range.from, end_date_input: range.to }
        : {}),
    });
  }
  async function getMostSoldProducts(range?: { from: string; to: string }) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get product count');

    return await supabase.rpc('get_most_sold_products', {
      organization_id_input: organization.org_id,
      ...(range
        ? { start_date_input: range.from, end_date_input: range.to }
        : {}),
    });
  }

  return {
    loadList,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductCount,
    getProductsInStockCount,
    getMostSoldProducts,
  };
}
