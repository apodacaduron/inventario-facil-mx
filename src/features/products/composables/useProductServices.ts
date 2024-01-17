import { supabase } from "@/config/supabase";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";

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

export type ProductFilters = Array<{
  column: string;
  operator: string;
  value: any;
}>;

export const productServicesTypeguards = {
  isCreateProduct(
    maybeProduct: CreateProduct | UpdateProduct
  ): maybeProduct is CreateProduct {
    return (
      !("product_id" in maybeProduct && maybeProduct.product_id) &&
      "name" in maybeProduct &&
      "description" in maybeProduct &&
      "image_url" in maybeProduct &&
      "current_stock" in maybeProduct
    );
  },
  isUpdateProduct(
    maybeProduct: CreateProduct | UpdateProduct
  ): maybeProduct is UpdateProduct {
    return !this.isCreateProduct(maybeProduct);
  },
};

export const PAGINATION_LIMIT = 30;

export function useProductServices() {
  const organizationStore = useOrganizationStore();
  const route = useRoute();
  const orgId = route.params.orgId;

  async function loadList(options?: {
    offset?: number;
    search?: string;
    filters?: ProductFilters;
  }) {
    const offset = options?.offset ?? 0;
    const from = offset * PAGINATION_LIMIT;
    const to = from + PAGINATION_LIMIT - 1;

    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get product list");

    let productSearch = supabase
      .from("i_products")
      .select("*")
      .eq("org_id", organization.org_id)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (options?.search) {
      productSearch = productSearch.textSearch("name", options.search, {
        type: "plain",
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        productSearch = productSearch.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await productSearch;
  }

  async function loadListByIds(options?: {
    offset?: number;
    productIds: string[];
  }) {
    const offset = options?.offset ?? 0;
    const from = offset * PAGINATION_LIMIT;
    const to = from + PAGINATION_LIMIT - 1;

    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get product list");

    const productSearch = supabase
      .from("i_products")
      .select("*")
      .eq("org_id", organization.org_id)
      .in("id", options?.productIds ?? [])
      .range(from, to);

    return await productSearch;
  }

  async function createProduct(formValues: CreateProduct) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to create a product");
    const { product_id, ...otherFormValues } = formValues;
    await supabase
      .from("i_products")
      .insert([
        {
          ...otherFormValues,
          org_id: organization.org_id,
        },
      ])
      .select()
      .single();
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

  return {
    loadList,
    loadListByIds,
    createProduct,
    deleteProduct,
    updateProduct,
  };
}
