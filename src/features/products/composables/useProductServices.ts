import { supabase } from "@/config/supabase";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";

export type CreateProduct = {
  name: Product["name"];
  description: Product["description"];
  image_url: Product["image_url"];
  current_stock: Product["i_stock"][number]["current_stock"];
};
export type UpdateProduct = {
  product_id: Product["id"];
  stock_id: Product["i_stock"][number]["id"];
} & CreateProduct;
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
      !("product_id" in (maybeProduct as CreateProduct)) &&
      !("stock_id" in (maybeProduct as CreateProduct)) &&
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

export function useProductServices() {
  const organizationStore = useOrganizationStore();
  const route = useRoute();
  const orgId = route.params.orgId;

  async function loadList() {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to get product list");
    return await supabase
      .from("i_products")
      .select("*, i_stock(current_stock, id)")
      .eq("org_id", organization.org_id);
  }

  async function createProduct(formValues: CreateProduct) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to create a product");
    const createdProductResponse = await supabase
      .from("i_products")
      .insert([
        {
          name: formValues.name,
          description: formValues.description,
          image_url: formValues.image_url,
          org_id: organization.org_id,
        },
      ])
      .select()
      .single();
    if (!createdProductResponse.data?.id)
      throw new Error("Product id is required to add to stock");
    await supabase.from("i_stock").insert([
      {
        product_id: createdProductResponse.data.id,
        org_id: organization.org_id,
        current_stock: formValues.current_stock,
      },
    ]);
  }

  async function updateProduct(formValues: UpdateProduct) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to create a product");
    await supabase
      .from("i_products")
      .update({
        name: formValues.name,
        description: formValues.description,
        image_url: formValues.image_url,
        org_id: organization.org_id,
      })
      .eq("id", formValues.product_id);
    await supabase
      .from("i_stock")
      .update({
        product_id: formValues.product_id,
        org_id: organization.org_id,
        current_stock: formValues.current_stock,
      })
      .eq("id", formValues.stock_id);
  }

  async function deleteProduct(productId: DeleteProduct) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to delete a product");
    if (!productId)
      throw new Error("Product id is required to delete a product");

    await supabase.from("i_products").delete().eq("id", productId);
  }

  return { loadList, createProduct, deleteProduct, updateProduct };
}
