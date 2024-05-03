export function useCurrencyFormatter() {
  function parse(cents: number | null | undefined) {
    if (!cents) return cents;

    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "MXN",
    });
  }

  function parseRaw(cents: number | null | undefined) {
    if (!cents) return cents;

    return cents / 100;
  }

  function toCents(price: number | null | undefined) {
    if (!price) return price;

    return Math.trunc((price ?? 0) * 100);
  }

  return { parse, parseRaw, toCents };
}
