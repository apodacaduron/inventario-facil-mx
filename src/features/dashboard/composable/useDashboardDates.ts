import { MaybeRef, computed, ref, toRef, toValue, watch } from 'vue';

export function useDashboardDates(options: {
  period: MaybeRef<'daily' | 'weekly' | 'monthly' | 'yearly'>;
}) {
  const selectedMonth = ref(new Date().getMonth());
  const selectedYear = ref(new Date().getFullYear());
  const dropdownOptions = ref(generateMonthOptions(selectedYear.value));
  const isCurrentYearSelected = toRef(
    () => selectedYear.value === new Date().getFullYear()
  );
  const selectedMonthName = toRef(() =>
    generateMonthName({ year: selectedYear.value, month: selectedMonth.value })
  );
  const dateRangeFromPeriod = computed(() => {
    const date = new Date();
    if (toValue(options.period) === 'daily') {
      return {
        from: getStartOfDay(date),
        to: getEndOfDay(date),
      };
    }
    if (toValue(options.period) === 'weekly') {
      return {
        from: getStartOfWeek(date),
        to: getEndOfWeek(date),
      };
    }
    if (toValue(options.period) === 'monthly') {
      return {
        from: getFirstDayOfMonth({
          year: selectedYear.value,
          month: selectedMonth.value,
        }),
        to: getLastDayOfMonth({
          year: selectedYear.value,
          month: selectedMonth.value,
        }),
      };
    }
    if (toValue(options.period) === 'yearly') {
      return {
        from: getStartOfYear(date.getFullYear()),
        to: getEndOfYear(date.getFullYear()),
      };
    }

    return {
      from: getFirstDayOfMonth({
        year: selectedYear.value,
        month: selectedMonth.value,
      }),
      to: getLastDayOfMonth({
        year: selectedYear.value,
        month: selectedMonth.value,
      }),
    };
  });

  function generateMonthName(data: { year: number; month: number }) {
    return new Date(data.year, data.month, 1)
      .toLocaleString('es-MX', {
        month: 'long',
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

  type DateObj = {
    year: number;
    month: number;
  };

  function getFirstDayOfMonth({ year, month }: DateObj): Date {
    return new Date(year, month, 1);
  }

  function getLastDayOfMonth({ year, month }: DateObj): Date {
    return new Date(year, month + 1, 0);
  }

  function getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getEndOfDay(date: Date): Date {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59
    );
  }

  function getStartOfWeek(date: Date): Date {
    const copiedDate = new Date(date);
    const day = copiedDate.getDay();
    const diff = copiedDate.getDate() - day + (day === 0 ? -6 : 0); // adjust when day is Sunday
    return new Date(copiedDate.setDate(diff));
  }

  function getEndOfWeek(date: Date): Date {
    const copiedDate = new Date(date);
    const startOfWeek = getStartOfWeek(copiedDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return new Date(
      endOfWeek.getFullYear(),
      endOfWeek.getMonth(),
      endOfWeek.getDate(),
      23,
      59,
      59
    );
  }

  // Función para obtener el inicio del año
  function getStartOfYear(year: number): Date {
    return new Date(year, 0, 1);
  }

  // Función para obtener el fin del año
  function getEndOfYear(year: number): Date {
    return new Date(year, 11, 31, 23, 59, 59);
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
    dateRangeFromPeriod,
    // Handlers
    generateMonthName,
  };
}
