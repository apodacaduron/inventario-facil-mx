import { ref, toRef, watch } from "vue";

export function useDashboardDates() {
  const selectedMonth = ref(new Date().getMonth());
  const selectedYear = ref(new Date().getFullYear());
  const dropdownOptions = ref(generateMonthOptions(selectedYear.value));
  const isCurrentYearSelected = toRef(
    () => selectedYear.value === new Date().getFullYear()
  );
  const firstDayOfTheSelectedMonth = toRef(
    () => new Date(selectedYear.value, selectedMonth.value, 1)
  );
  const lastDayOfTheSelectedMonth = toRef(
    () => new Date(selectedYear.value, selectedMonth.value + 1, 0)
  );
  const selectedMonthName = toRef(() =>
    generateMonthName({ year: selectedYear.value, month: selectedMonth.value })
  );
  function generateMonthName(data: { year: number; month: number }) {
    return new Date(data.year, data.month, 1)
      .toLocaleString("es-MX", {
        month: "long",
      })
      .toLocaleUpperCase();
  }

  function generateMonthOptions(year: number) {
    const MONTHS_OF_YEAR = 12;

    const nextArrayLength =
      year === new Date().getFullYear()
        ? new Date().getMonth() + 1
        : MONTHS_OF_YEAR;

    return Array.from({
      length: nextArrayLength,
    }).map((_v, index) => ({
      monthName: generateMonthName({ year, month: index }),
      monthNumber: index,
    }));
  }

  watch(selectedYear, (nextFullYearNumber) => {
    const currentMonth = new Date().getMonth();
    if (isCurrentYearSelected.value && selectedMonth.value > currentMonth) {
      selectedMonth.value = currentMonth;
    }
    dropdownOptions.value = generateMonthOptions(nextFullYearNumber);
  });

  return {
    selectedMonth,
    selectedMonthName,
    selectedYear,
    dropdownOptions,
    firstDayOfTheSelectedMonth,
    lastDayOfTheSelectedMonth,
    // Handlers
    generateMonthName,
  };
}
