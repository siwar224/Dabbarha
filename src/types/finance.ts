export type ExpenseCategory =
  | "transport"
  | "food"
  | "home"
  | "care"
  | "coffee"
  | "other";

export type Transaction = {
  id: number;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  isUnplanned: boolean;
  createdAt: string;
};

export type MonthlyPlan = {
  id: number;
  month: number;
  year: number;
  income: number;
  plannedExpenses: number;
  savingsTarget: number;
  createdAt: string;
  updatedAt: string;
};

export type SavingsGoalStatus = "active" | "completed" | "paused";

export type SavingsGoal = {
  id: number;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  status: SavingsGoalStatus;
  createdAt: string;
  updatedAt: string;
};
