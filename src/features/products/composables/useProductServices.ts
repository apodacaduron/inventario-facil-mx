import { supabase } from "@/config/supabase";
import { useAsyncState } from "@vueuse/core";
import { useRoute } from "vue-router";

type CreateProduct = {
  name: string;
  description: string;
  image_url: string;
  current_stock: number;
};

export function useProductServices() {
  const route = useRoute();
  const orgId = route.params.orgId;

  async function loadList() {
    return await supabase
      .from("i_products")
      .select()
      .eq("org_id", orgId.toString());
  }

  async function createProduct(formValues: CreateProduct) {
    const createdProductResponse = await supabase
      .from("i_products")
      .insert([
        {
          name: formValues.name,
          description: formValues.description,
          image_url: formValues.image_url,
          org_id: orgId,
        },
      ])
      .select()
      .single();
    await supabase.from("i_stock").insert([
      {
        product_id: createdProductResponse.data.id,
        org_id: orgId,
        current_stock: formValues.current_stock,
      },
    ]);
  }

  return { loadList, createProduct };
}
