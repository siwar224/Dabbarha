import type { SetupAllocation, SetupTransaction } from "@/types/setup";

export type BudgetBucket = "fixed" | "extra";

export type FinanceSummary = {
  monthTransactions: SetupTransaction[];
  categoryTotals: Record<SetupTransaction["category"], number>;
  totalSpent: number;
  fixedBudget: number;
  extraBudget: number;
  savingsBudget: number;
  fixedSpent: number;
  extraSpent: number;
  fixedRemaining: number;
  extraRemaining: number;
  fixedOverrun: number;
  extraOverrun: number;
  unplannedSpent: number;
  savingsUsed: number;
  remainingSavings: number;
  remainingPlanned: number;
  todayTransport: number;
  transportThisMonth: number;
};

const expenseCategories = ["transport", "food", "home", "care", "coffee", "other"] as const;

// Transport is the recurring/fixed envelope in this app. Everything else is variable.
export function getBudgetBucket(category: SetupTransaction["category"]): BudgetBucket {
  return category === "transport" ? "fixed" : "extra";
}

function getMonthKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function getDayKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${getMonthKey(date)}-${date.getDate()}`;
}

export function calculateFinanceSummary(
  income: number,
  allocations: SetupAllocation[],
  transactions: SetupTransaction[],
  referenceDate = new Date()
): FinanceSummary {
  const monthTransactions = transactions.filter(
    (transaction) => getMonthKey(transaction.date) === getMonthKey(referenceDate)
  );
  const categoryTotals = Object.fromEntries(expenseCategories.map((category) => [category, 0])) as FinanceSummary["categoryTotals"];

  for (const transaction of monthTransactions) {
    categoryTotals[transaction.category] += transaction.amount;
  }

  const fixedBudget = allocations.find((allocation) => allocation.id === "fixed")?.amount ?? 0;
  const extraBudget = allocations.find((allocation) => allocation.id === "extra")?.amount ?? 0;
  const savingsBudget = allocations.find((allocation) => allocation.id === "saving")?.amount ?? 0;
  const plannedTransactions = monthTransactions.filter((transaction) => !transaction.isUnplanned);
  const fixedSpent = plannedTransactions
    .filter((transaction) => getBudgetBucket(transaction.category) === "fixed")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const extraSpent = plannedTransactions
    .filter((transaction) => getBudgetBucket(transaction.category) === "extra")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const unplannedSpent = monthTransactions
    .filter((transaction) => transaction.isUnplanned)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const fixedOverrun = Math.max(fixedSpent - fixedBudget, 0);
  const extraOverrun = Math.max(extraSpent - extraBudget, 0);
  const savingsUsed = unplannedSpent + fixedOverrun + extraOverrun;
  const todayTransport = monthTransactions
    .filter(
      (transaction) =>
        transaction.category === "transport" && getDayKey(transaction.date) === getDayKey(referenceDate)
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    monthTransactions,
    categoryTotals,
    totalSpent: monthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    fixedBudget,
    extraBudget,
    savingsBudget,
    fixedSpent,
    extraSpent,
    fixedRemaining: Math.max(fixedBudget - fixedSpent, 0),
    extraRemaining: Math.max(extraBudget - extraSpent, 0),
    fixedOverrun,
    extraOverrun,
    unplannedSpent,
    savingsUsed,
    remainingSavings: Math.max(savingsBudget - savingsUsed, 0),
    remainingPlanned: Math.max(fixedBudget - fixedSpent, 0) + Math.max(extraBudget - extraSpent, 0),
    todayTransport,
    transportThisMonth: categoryTotals.transport
  };
}

export type GoalImpact = {
  deficit: number;
  nextMonthRequiredSavings: number;
  canCompensateNextMonth: boolean;
  oldEstimatedCompletionDate?: string;
  newEstimatedCompletionDate?: string;
  delayInMonths: number;
  message: string;
};

export function calculateGoalImpact(deficit = 0): GoalImpact {
  return {
    deficit,
    nextMonthRequiredSavings: deficit,
    canCompensateNextMonth: deficit > 0,
    delayInMonths: 0,
    message: deficit > 0 ? "يلزم تعويض المبلغ من الادخار" : "الهدف ما تأثرش"
  };
}
