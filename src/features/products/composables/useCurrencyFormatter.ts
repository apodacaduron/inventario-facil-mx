export function useCurrencyFormatter() {
  function parse(cents: number | null | undefined, options?: Intl.NumberFormatOptions) {
    if (typeof cents !== 'number') return cents ?? null;

    return (cents / 100).toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      ...options,
    });
  }

  function parseRaw(cents: number | null | undefined) {
    if (!cents) return cents ?? null;

    return cents / 100;
  }

  function toCents(price: number | null | undefined) {
    if (!price) return price ?? null;

    return Math.trunc((price ?? 0) * 100);
  }

  return { parse, parseRaw, toCents };
}
