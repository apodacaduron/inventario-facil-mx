import { supabase } from '@/config/supabase';
import { LoadListOptions, useServiceHelpers } from '@/features/global';
import { Tables } from '../../../../types_db';

export type CreateSale = {
  sale_id?: NonNullable<Tables<'i_sales'>['id']>;
  sale_date: NonNullable<Tables<'i_sales'>['sale_date']>;
  status: NonNullable<Sale['status']>;
  customer_id?: NonNullable<Sale['customer_id']>;
  notes: NonNullable<Sale['notes']>;
  cancellation_notes?: NonNullable<Sale['cancellation_notes']>;
  shipping_cost: NonNullable<Sale['shipping_cost']>;
  products: {
    product_id: SaleProduct['product_id'];
    price: SaleProduct['price'];
    unit_price: SaleProduct['unit_price'];
    qty: SaleProduct['qty'];
    name: SaleProduct['name'];
    image_url: SaleProduct['image_url'];
  }[];
};
export type UpdateSale = {
  sale_id: Sale['id'];
} & CreateSale;
export type DeleteSale = Sale['id'];

export type SaleList = Awaited<
  ReturnType<ReturnType<typeof useSaleServices>['loadList']>
>['data'];
export type Sale = NonNullable<SaleList>[number];
export const SALE_STATUS = ['in_progress', 'completed', 'cancelled'] as const;
export type SaleProductList = Sale['i_sale_products'];
export type SaleProduct = Sale['i_sale_products'][number];

export const saleServicesTypeguards = {
  isCreateSale(maybeSale: CreateSale | UpdateSale): maybeSale is CreateSale {
    return (
      !('sale_id' in maybeSale && maybeSale.sale_id) &&
      'sale_date' in maybeSale &&
      'status' in maybeSale
    );
  },
  isUpdateSale(maybeSale: CreateSale | UpdateSale): maybeSale is UpdateSale {
    return !this.isCreateSale(maybeSale);
  },
};

export function useSaleServices() {
  const serviceHelpers = useServiceHelpers();

  async function loadList(options: LoadListOptions & { orgId: string }) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    if (!options.orgId)
      throw new Error('Organization is required to get sale list');

    let saleQuery = supabase
      .from('i_sales')
      .select('*, i_sale_products(*), i_customers(*)')
      .eq('org_id', options.orgId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (options?.search) {
      saleQuery = saleQuery.ilike('i_customers.name', `%${options.search}%`);
    }

    serviceHelpers.appendFiltersToQuery(saleQuery, options);

    return await saleQuery;
  }

  async function createSale(orgId: string, formValues: CreateSale) {
    if (!orgId)
      throw new Error('Organization is required to create a sale'); 

    return await supabase.rpc('create_sale', {
      ...formValues,
      organization_id: orgId,
    });
  }

  async function updateSale(orgId: string, formValues: UpdateSale) {
    if (!orgId)
      throw new Error('Organization is required to update a sale');

    return await supabase.rpc('update_sale', {
      cancellation_notes_input: formValues.cancellation_notes,
      notes_input: formValues.notes,
      customer_id_input: formValues.customer_id,
      products_input: formValues.products,
      sale_date_input: formValues.sale_date,
      sale_id_input: formValues.sale_id,
      shipping_cost_input: formValues.shipping_cost,
      status_input: formValues.status,
      organization_id_input: orgId,
    });
  }

  async function deleteSale(saleId: DeleteSale) {
    if (!saleId) throw new Error('Sale id is required to delete a sale');

    await supabase.from('i_sales').delete().eq('id', saleId);
  }

  async function getSalesCount(options: { orgId: string; range?: { from: string; to: string }}) {
    if (!options.orgId)
      throw new Error('Organization is required to get customer count');

    return await supabase.rpc('get_sales_count', {
      organization_id_input: options.orgId,
      ...(options.range
        ? { start_date_input: options.range.from, end_date_input: options.range.to }
        : {}),
    });
  }

  async function getSalesTotalIncome(options: { orgId: string; range?: { from: string; to: string }}) {
    if (!options.orgId)
      throw new Error('Organization is required to get customer count');

    return await supabase.rpc('get_sales_total_income', {
      organization_id_input: options.orgId,
      ...(options.range
        ? { start_date_input: options.range.from, end_date_input: options.range.to }
        : {}),
    });
  }

  async function getSalesTotalProfit(options: {orgId: string; range?: { from: string; to: string }}) {
    if (!options.orgId)
      throw new Error('Organization is required to get customer count');

    return await supabase.rpc('get_sales_total_profit', {
      organization_id_input: options.orgId,
      ...(options.range
        ? { start_date_input: options.range.from, end_date_input: options.range.to }
        : {}),
    });
  }

  return {
    loadList,
    createSale,
    deleteSale,
    updateSale,
    getSalesCount,
    getSalesTotalIncome,
    getSalesTotalProfit,
  };
}
