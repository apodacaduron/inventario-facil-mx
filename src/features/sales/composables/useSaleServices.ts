import { supabase } from "@/config/supabase";
import { LoadListOptions, useServiceHelpers } from "@/features/global";
import { useProductServices } from "@/features/products";

export type CreateSale = {
  sale_id?: Sale["id"];
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
    name: NonNullable<SaleProduct["i_products"]>["name"];
    image_url: NonNullable<SaleProduct["i_products"]>["image_url"];
  }[];
};
export type UpdateSale = {
  sale_id: Sale["id"];
} & CreateSale;
export type DeleteSale = Sale["id"];

export type SaleList = Awaited<
  ReturnType<ReturnType<typeof useSaleServices>["loadList"]>
>["data"];
export type Sale = NonNullable<SaleList>[number];
export const SALE_STATUS = ["in_progress", "completed", "cancelled"] as const;
export type SaleProductList = Sale["i_sale_products"];
export type SaleProduct = Sale["i_sale_products"][number];

export const saleServicesTypeguards = {
  isCreateSale(maybeSale: CreateSale | UpdateSale): maybeSale is CreateSale {
    return (
      !("sale_id" in maybeSale && maybeSale.sale_id) &&
      "sale_date" in maybeSale &&
      "status" in maybeSale &&
      "customer_id" in maybeSale
    );
  },
  isUpdateSale(maybeSale: CreateSale | UpdateSale): maybeSale is UpdateSale {
    return !this.isCreateSale(maybeSale);
  },
};

const helpers = {
  async updateStockBasedOnSaleProducts(
    saleProducts: Array<{
      qty: number | null;
      product_id: string | null;
    }> | null,
    callback: (currentStock: number, saleProductQty: number) => number
  ) {
    const productServices = useProductServices();
    await Promise.all(
      saleProducts?.map(async (saleProduct) => {
        if (!saleProduct.product_id) return;
        const productResponse = await supabase
          .from("i_products")
          .select("current_stock")
          .eq("id", saleProduct.product_id)
          .single();

        const saleQuantity = saleProduct?.qty ?? 0;
        const currentStock = productResponse.data?.current_stock ?? 0;
        const nextCurrentStock = callback(currentStock, saleQuantity);

        await productServices.updateProduct({
          product_id: saleProduct.product_id,
          current_stock: nextCurrentStock,
        });
      }) ?? []
    );
  },
  formatSaleProduct(product: UpdateSale["products"][number]) {
    return {
      product_id: product.product_id,
      price: product.price,
      unit_price: product.unit_price,
      qty: product.qty,
      name: product.name,
      image_url: product.image_url,
    };
  },
};

export function useSaleServices() {
  const serviceHelpers = useServiceHelpers();

  async function loadList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error("Organization is required to get sale list");

    let saleQuery = supabase
      .from("i_sales")
      .select("*, i_sale_products(*, i_products(*)), i_customers!inner(*)")
      .eq("org_id", organization.org_id)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (options?.search) {
      saleQuery = saleQuery.ilike("i_customers.name", `%${options.search}%`);
    }

    return await saleQuery;
  }

  async function createSale(formValues: CreateSale) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error("Organization is required to create a sale");

    const { products, sale_id, ...otherFormValues } = formValues;
    const createdSaleResponse = await supabase
      .from("i_sales")
      .insert([
        {
          ...otherFormValues,
          org_id: organization.org_id,
        },
      ])
      .select()
      .single();
    if (!createdSaleResponse.data?.id)
      throw new Error("Sale id is required to add to sale detail");

    await supabase.from("i_sale_products").insert(
      formValues.products.map((product) => ({
        ...helpers.formatSaleProduct(product),
        sale_id: createdSaleResponse.data.id,
        org_id: organization.org_id,
      }))
    );

    await (async function updateNewStock() {
      await helpers.updateStockBasedOnSaleProducts(
        formValues.products,
        (currentStock, saleProductQty) => currentStock - saleProductQty
      );
    })();
  }

  async function updateSale(formValues: UpdateSale) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error("Organization is required to update a sale");
    const { sale_id, products, ...otherFormValues } = formValues;

    await supabase
      .from("i_sales")
      .update({
        ...otherFormValues,
      })
      .eq("id", formValues.sale_id);

    if (formValues.status === "completed") return;

    if (formValues.status === "in_progress") {
      const oldSaleProductsQuery = await supabase
        .from("i_sale_products")
        .delete()
        .eq("sale_id", formValues.sale_id)
        .select();

      await (async function restoreOldStock() {
        await helpers.updateStockBasedOnSaleProducts(
          oldSaleProductsQuery.data,
          (currentStock, saleProductQty) => currentStock + saleProductQty
        );
      })();

      const formattedSaleProducts = formValues.products.map((product) => ({
        ...helpers.formatSaleProduct(product),
        sale_id: formValues.sale_id,
        org_id: organization.org_id,
      }));
      await supabase.from("i_sale_products").insert(formattedSaleProducts);

      await (async function updateNewStock() {
        await helpers.updateStockBasedOnSaleProducts(
          formValues.products,
          (currentStock, saleProductQty) => currentStock - saleProductQty
        );
      })();
    } else if (formValues.status === "cancelled") {
      await (async function restoreOldStock() {
        await helpers.updateStockBasedOnSaleProducts(
          formValues.products,
          (currentStock, saleProductQty) => currentStock + saleProductQty
        );
      })();
    }
  }

  async function deleteSale(saleId: DeleteSale) {
    if (!saleId) throw new Error("Sale id is required to delete a sale");

    await supabase.from("i_sales").delete().eq("id", saleId);
  }

  return { loadList, createSale, deleteSale, updateSale };
}
