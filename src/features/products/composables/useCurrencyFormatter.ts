export function useCurrencyFormatter() {
  function parse(cents: number | null | undefined) {
    if (typeof cents !== 'number') return cents ?? null;

    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "MXN",
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
