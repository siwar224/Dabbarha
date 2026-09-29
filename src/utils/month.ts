export function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

export function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

export function isSameMonth(first: Date, second: Date) {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

export function formatMonthYear(value: Date) {
  return value.toLocaleDateString("ar-TN", {
    month: "long",
    year: "numeric"
  });
}

export function formatMonthName(value: Date) {
  return value.toLocaleDateString("ar-TN", {
    month: "long"
  });
}

export function formatDay(value: Date) {
  return value.toLocaleDateString("ar-TN", {
    day: "numeric",
    month: "long"
  });
}
