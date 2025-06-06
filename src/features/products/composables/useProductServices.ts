import { supabase } from "@/config/supabase";
import { useAssetServices } from "@/features/assets";
import { LoadListOptions, useServiceHelpers } from "@/features/global";

import { Tables } from "../../../../types_db";

export type CreateProduct = {
  name: Product["name"];
  description: Product["description"];
  current_stock: Product["current_stock"];
  retail_price: Product["retail_price"];
  unit_price: Product["unit_price"];
  image_url: Product["image_url"];
};
export type UpdateProduct = Partial<CreateProduct>;
export type DeleteProduct = Product["id"];

export type Product = Tables<"i_products">;
export type ProductImage = Tables<"product_images">;
export type CreateProductImage = Omit<
  ProductImage,
  "id" | "created_at" | "updated_at"
>;
export type UpdateProductImage = Partial<CreateProductImage>;

export function useProductServices() {
  const serviceHelpers = useServiceHelpers();
  const assetServices = useAssetServices();

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

  async function loadProductImagesList(
    options: LoadListOptions & { orgId: string }
  ) {
    if (!options.orgId)
      throw new Error("Organization is required to get product list");

    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    let productQuery = supabase
      .from("product_images")
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

  async function loadProductStockHistory(
    options: LoadListOptions & { productId: string | undefined }
  ) {
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

    return await supabase.from("i_products").insert([
      {
        ...formValues,
        org_id: orgId,
      },
    ]);
  }

  async function updateProduct(id: string, formValues: UpdateProduct) {
    return await supabase
      .from("i_products")
      .update({
        ...formValues,
      })
      .eq("id", id);
  }

  async function deleteProduct(productId: DeleteProduct) {
    if (!productId)
      throw new Error("Product id is required to delete a product");

    return await supabase.from("i_products").delete().eq("id", productId);
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

  async function createProductImage(asset: CreateProductImage) {
    return await supabase
      .from("product_images")
      .insert(asset)
      .select()
      .single();
  }
  async function deleteProductImage(productImage: Tables<"product_images">) {
    if (productImage?.bucket_path) {
      await assetServices.deleteFile({
        bucket: "product-images",
        path: productImage.bucket_path,
      });
    }
    if (productImage?.product_id) {
      const product = await supabase
        .from("i_products")
        .select()
        .eq("id", productImage.product_id)
        .single();
      if (product.data?.image_url === productImage.url) {
        await supabase
          .from("i_products")
          .update({ image_url: null })
          .eq("id", productImage.product_id);
      }
    }
    return await supabase
      .from("product_images")
      .delete()
      .eq("id", productImage.id);
  }
  async function updateProductImage(
    id: string,
    productImage: UpdateProductImage
  ) {
    return await supabase
      .from("product_images")
      .update(productImage)
      .eq("id", id);
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
    loadProductImagesList,
    createProductImage,
    deleteProductImage,
    updateProductImage,
  };
}
