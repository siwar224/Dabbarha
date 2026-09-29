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

export type SetupMonthlyPlan = {
  monthKey: string;
  income: number;
  advance: number;
  allocations: SetupAllocation[];
};

export type SetupData = {
  income: number;
  advance: number;
  allocations: SetupAllocation[];
  monthlyPlans: SetupMonthlyPlan[];
  goal?: SetupGoal;
  goals: SetupGoal[];
  goalSkipped: boolean;
  transactions: SetupTransaction[];
};
