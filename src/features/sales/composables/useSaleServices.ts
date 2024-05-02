import { supabase } from '@/config/supabase';
import { LoadListOptions, useServiceHelpers } from '@/features/global';
import { Tables } from '../../../../types_db';

export type CreateSale = {
  sale_id?: NonNullable<Tables<'i_sales'>['id']>;
  sale_date: NonNullable<Tables<'i_sales'>['sale_date']>;
  status: NonNullable<Sale['status']>;
  customer_id: NonNullable<Sale['customer_id']>;
  notes: NonNullable<Sale['notes']>;
  cancellation_notes: NonNullable<Sale['cancellation_notes']>;
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

  async function loadList(options?: LoadListOptions) {
    const [from, to] = serviceHelpers.getPaginationRange(options?.offset);

    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get sale list');

    let saleQuery = supabase
      .from('i_sales')
      .select('*, i_sale_products(*), i_customers!inner(*)')
      .eq('org_id', organization.org_id)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (options?.search) {
      saleQuery = saleQuery.ilike('i_customers.name', `%${options.search}%`);
    }

    if (options?.order) {
      const [column = 'created_at', order = 'desc'] = options?.order;
      saleQuery = saleQuery.order(column, {
        ascending: order === 'asc',
      });
    }

    if (options?.filters) {
      options?.filters.forEach((filter) => {
        saleQuery = saleQuery.filter(
          filter.column,
          filter.operator,
          filter.value
        );
      });
    }

    return await saleQuery;
  }

  async function createSale(formValues: CreateSale) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to create a sale');

    await supabase.rpc('create_sale', {
      ...formValues,
      organization_id: organization?.org_id,
    });
  }

  async function updateSale(formValues: UpdateSale) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to update a sale');

    await supabase.rpc('update_sale', {
      cancellation_notes_input: formValues.cancellation_notes,
      notes_input: formValues.notes,
      customer_id_input: formValues.customer_id,
      products_input: formValues.products,
      sale_date_input: formValues.sale_date,
      sale_id_input: formValues.sale_id,
      shipping_cost_input: formValues.shipping_cost,
      status_input: formValues.status,
      organization_id_input: organization?.org_id,
    });
  }

  async function deleteSale(saleId: DeleteSale) {
    if (!saleId) throw new Error('Sale id is required to delete a sale');

    await supabase.from('i_sales').delete().eq('id', saleId);
  }

  async function getSalesCount(range?: { from: string; to: string }) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get customer count');

    return await supabase.rpc('get_sales_count', {
      organization_id_input: organization.org_id,
      ...(range
        ? { start_date_input: range.from, end_date_input: range.to }
        : {}),
    });
  }

  async function getSalesTotalIncome(range?: { from: string; to: string }) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get customer count');

    return await supabase.rpc('get_sales_total_income', {
      organization_id_input: organization.org_id,
      ...(range
        ? { start_date_input: range.from, end_date_input: range.to }
        : {}),
    });
  }

  async function getSalesTotalProfit(range?: { from: string; to: string }) {
    const organization = serviceHelpers.getCurrentOrganization();
    if (!organization?.org_id)
      throw new Error('Organization is required to get customer count');

    return await supabase.rpc('get_sales_total_profit', {
      organization_id_input: organization.org_id,
      ...(range
        ? { start_date_input: range.from, end_date_input: range.to }
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
