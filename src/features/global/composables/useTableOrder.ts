import { ref } from "vue";

export function useTableOrder(context: {
  options: { initialOrder: [string, "asc" | "desc"] };
}) {
  const tableOrder = ref(context.options.initialOrder);

  function toggleTableOrder(column: string) {
    const isSameColumn = tableOrder.value[0] === column;
    const isDesc = tableOrder.value[1] === "desc";
    const nextOrderValue = (() => {
      if (!isSameColumn) return "asc";

      return isDesc ? "asc" : "desc";
    })();
    tableOrder.value = [column, nextOrderValue];
  }

  return {
    tableOrder,
    toggleTableOrder,
  };
}
