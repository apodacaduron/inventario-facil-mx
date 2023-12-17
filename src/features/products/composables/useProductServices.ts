import { supabase } from "@/config/supabase";
import { useOrganizationStore } from "@/stores";
import { useRoute } from "vue-router";

type CreateProduct = {
  name: string;
  description: string;
  image_url: string;
  current_stock: number;
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
      .select("*, i_stock(current_stock)")
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
    await supabase.from("i_stock").insert([
      {
        product_id: createdProductResponse.data.id,
        org_id: organization.org_id,
        current_stock: formValues.current_stock,
      },
    ]);
  }

  async function deleteProduct(productId: string | null) {
    const organization = organizationStore.findOrganizationById(
      orgId.toString()
    );
    if (!organization?.org_id)
      throw new Error("Organization is required to delete a product");
    if (!productId)
      throw new Error("Product id is required to delete a product");

    await supabase.from("i_products").delete().eq("id", productId);
  }

  return { loadList, createProduct, deleteProduct };
}
