import type { ExpenseCategory } from "@/types/finance";

export type SetupAllocation = {
  id: string;
  label: string;
  amount: number;
  icon: "home-outline" | "cart-outline" | "target" | "cash-multiple";
  tone: "coral" | "lavender" | "blue" | "gold";
};

export type SetupGoal = {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  imageUri?: string;
};

export type SetupGoalInput = Omit<SetupGoal, "id">;

export type SetupTransaction = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  isUnplanned: boolean;
  createdAt: string;
};

export type SetupIncomeEntry = {
  id: string;
  monthKey: string;
  type: "salary" | "advance";
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
};

export type SetupCategoryBudget = {
  category: ExpenseCategory;
  amount: number;
};

export type SetupRecurringExpense = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  intervalDays: number;
  nextDate: string;
  endDate?: string;
  createdAt: string;
};

export type SetupMonthlyPlan = {
  monthKey: string;
  income: number;
  advance: number;
  allocations: SetupAllocation[];
  categoryBudgets: SetupCategoryBudget[];
};

export type SetupData = {
  income: number;
  advance: number;
  allocations: SetupAllocation[];
  categoryBudgets: SetupCategoryBudget[];
  monthlyPlans: SetupMonthlyPlan[];
  incomeEntries: SetupIncomeEntry[];
  recurringExpenses: SetupRecurringExpense[];
  goal?: SetupGoal;
  goals: SetupGoal[];
  goalSkipped: boolean;
  transactions: SetupTransaction[];
};
