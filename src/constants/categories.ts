import type { ExpenseCategory } from "@/types/finance";

export type CategoryOption = {
  id: ExpenseCategory;
  label: string;
};

export const expenseCategories: CategoryOption[] = [
  { id: "transport", label: "ترانسبور" },
  { id: "food", label: "أكل" },
  { id: "shopping", label: "مشتريات" },
  { id: "care", label: "عناية" },
  { id: "coffee", label: "قهوة" },
  { id: "other", label: "أخرى" }
];
