export function useCurrencyFormatter() {
  function parse(cents: number | null) {
    if (!cents) return cents;

    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "MXN",
    });
  }

  return { parse };
}
