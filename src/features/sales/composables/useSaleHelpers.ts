import { useProductServices } from "@/features/products";
import { CreateSale, UpdateSale } from "./useSaleServices";
import { notifyIfHasError } from "@/features/global";
import { useToast } from "@/components/ui";

export function useSaleHelpers() {
  const productServices = useProductServices();
  const { toast } = useToast();

  async function notifyLowOnStockProducts(
    orgId: string,
    formValues: CreateSale | UpdateSale,
    lowStockThreshold: number
  ) {
    const productIds = formValues.products.map(
      (formProduct) => formProduct.product_id
    );

    if (!productIds.length) return;

    const saleProducts = await productServices.loadList({
      orgId,
      filters: productIds.map((productId) => ({
        column: "id",
        operator: "eq",
        value: productId,
        filterType: "or",
      })),
    });

    notifyIfHasError(saleProducts.error);

    if (!saleProducts.data?.length) return;

    const lowStockProducts = saleProducts.data?.filter(
      (product) => Number(product.current_stock) <= lowStockThreshold
    );

    if (!lowStockProducts.length) return;

    const lowStockProductNames = lowStockProducts
      ?.map((product) => `• ${product.name}: ${product.current_stock} ${product.current_stock ? '⚠️' : '❌'}`)
      .join("\r\n");

    toast({
      title: "Los siguientes productos están bajos en stock",
      description: lowStockProductNames,
      duration: 10_000,
      class: 'whitespace-pre'
    });
  }

  return { notifyLowOnStockProducts };
}
