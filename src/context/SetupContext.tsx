import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  loadSetupData,
  deleteTransaction,
  saveIncomeEntry,
  saveRecurringExpense,
  saveAllocations,
  saveGoal,
  saveGoalContribution,
  saveGoalSkipped,
  saveIncome,
  saveMonthlyPlan,
  savePrimaryGoal,
  saveTransaction,
  saveUpdatedGoal,
  updateTransaction
} from "@/db";
import type {
  SetupAllocation,
  SetupCategoryBudget,
  SetupData,
  SetupGoal,
  SetupGoalInput,
  SetupIncomeEntry,
  SetupMonthlyPlan,
  SetupRecurringExpense,
  SetupTransaction
} from "@/types/setup";
import { addMonths, startOfMonth } from "@/utils/month";

export type { SetupAllocation, SetupCategoryBudget, SetupGoal, SetupGoalInput, SetupTransaction } from "@/types/setup";

type SetupContextValue = SetupData & {
  isLoaded: boolean;
  selectedMonth: Date;
  setSelectedMonth: (month: Date) => void;
  moveSelectedMonth: (amount: number) => void;
  setAdvance: (advance: number) => Promise<void>;
  setMonthlyPlan: (changes: Partial<SetupMonthlyPlan>) => Promise<void>;
  addIncomeEntry: (entry: Omit<SetupIncomeEntry, "id" | "createdAt">) => Promise<void>;
  setIncome: (income: number) => Promise<void>;
  setAllocations: (allocations: SetupAllocation[]) => Promise<void>;
  setCategoryBudgets: (budgets: SetupCategoryBudget[]) => Promise<void>;
  setGoal: (goal: SetupGoalInput) => Promise<void>;
  addGoal: (goal: SetupGoalInput) => Promise<string>;
  addGoalContribution: (amount: number) => Promise<boolean>;
  updateGoal: (goalId: string, goal: SetupGoalInput) => Promise<void>;
  skipGoal: () => Promise<void>;
  addTransaction: (transaction: Omit<SetupTransaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (transaction: SetupTransaction) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  addRecurringExpense: (recurring: Omit<SetupRecurringExpense, "id" | "createdAt">) => Promise<void>;
};

const defaultCategoryBudgets: SetupCategoryBudget[] = [
  { category: "transport", amount: 200 },
  { category: "food", amount: 25 },
  { category: "home", amount: 25 },
  { category: "care", amount: 15 },
  { category: "coffee", amount: 15 },
  { category: "other", amount: 20 }
];

const defaultSetupData: SetupData = {
  income: 800,
  advance: 0,
  allocations: [
    {
      id: "fixed",
      label: "مصاريف ثابتة",
      amount: 200,
      icon: "home-outline",
      tone: "coral"
    },
    {
      id: "extra",
      label: "مصاريف زايدة",
      amount: 100,
      icon: "cart-outline",
      tone: "lavender"
    },
    {
      id: "saving",
      label: "ادخار",
      amount: 500,
      icon: "target",
      tone: "blue"
    }
  ],
  categoryBudgets: defaultCategoryBudgets,
  monthlyPlans: [],
  incomeEntries: [],
  recurringExpenses: [],
  goals: [],
  goalSkipped: false,
  transactions: []
};

function normalizeSetupData(value: Partial<SetupData> | undefined): SetupData {
  return {
    ...defaultSetupData,
    ...value,
    advance: value?.advance ?? defaultSetupData.advance,
    allocations: value?.allocations ?? defaultSetupData.allocations,
    categoryBudgets: value?.categoryBudgets ?? defaultSetupData.categoryBudgets,
    monthlyPlans: value?.monthlyPlans ?? [],
    incomeEntries: value?.incomeEntries ?? [],
    recurringExpenses: value?.recurringExpenses ?? [],
    goals: value?.goals ?? [],
    goalSkipped: value?.goalSkipped ?? false,
    transactions: value?.transactions ?? []
  };
}

const SetupContext = createContext<SetupContextValue | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SetupData>(() => normalizeSetupData(defaultSetupData));
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    async function hydrateSetupData() {
      try {
        setData(normalizeSetupData(await loadSetupData(defaultSetupData)));
      } finally {
        setIsLoaded(true);
      }
    }

    hydrateSetupData();
  }, []);

  const updateData = useCallback((nextData: SetupData) => {
    setData(nextData);
  }, []);

  const value = useMemo<SetupContextValue>(
    () => {
      const normalizedData = normalizeSetupData(data);
      const activeMonthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`;
      const saveActiveMonthlyPlan = async (overrides: Partial<SetupMonthlyPlan>) => {
        const plan: SetupMonthlyPlan = {
          monthKey: activeMonthKey,
          income: overrides.income ?? normalizedData.income,
          advance: overrides.advance ?? normalizedData.advance,
          allocations: overrides.allocations ?? normalizedData.allocations,
          categoryBudgets: overrides.categoryBudgets ?? normalizedData.categoryBudgets
        };
        const monthlyPlans = normalizedData.monthlyPlans.some((item) => item.monthKey === activeMonthKey)
          ? normalizedData.monthlyPlans.map((item) => (item.monthKey === activeMonthKey ? plan : item))
          : [plan, ...normalizedData.monthlyPlans];
        updateData({
          ...normalizedData,
          income: plan.income,
          advance: plan.advance,
          allocations: plan.allocations,
          categoryBudgets: plan.categoryBudgets,
          monthlyPlans
        });
        void saveMonthlyPlan(plan).catch(() => undefined);
      };
      const selectMonth = (month: Date) => {
        const nextMonth = startOfMonth(month);
        const monthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
        const existingPlan = normalizedData.monthlyPlans.find((item) => item.monthKey === monthKey);
        const nextPlan = existingPlan ?? {
          monthKey,
          income: normalizedData.income,
          advance: normalizedData.advance,
          allocations: normalizedData.allocations.map((allocation) => ({ ...allocation })),
          categoryBudgets: normalizedData.categoryBudgets.map((budget) => ({ ...budget }))
        };
        const monthlyPlans = existingPlan ? normalizedData.monthlyPlans : [nextPlan, ...normalizedData.monthlyPlans];
        const monthIncomeEntries = normalizedData.incomeEntries.filter((entry) => entry.monthKey === monthKey);
        const nextAdvance = monthIncomeEntries
          .filter((entry) => entry.type === "advance")
          .reduce((sum, entry) => sum + entry.amount, 0);
        updateData({
          ...normalizedData,
          income: nextPlan.income,
          advance: nextAdvance || nextPlan.advance,
          allocations: nextPlan.allocations,
          categoryBudgets: nextPlan.categoryBudgets,
          monthlyPlans
        });
        setSelectedMonth(nextMonth);
        if (!existingPlan) {
          void saveMonthlyPlan(nextPlan);
        }
      };

      return {
        ...normalizedData,
        isLoaded,
        selectedMonth,
        setSelectedMonth: selectMonth,
        moveSelectedMonth: (amount: number) => selectMonth(addMonths(selectedMonth, amount)),
        setMonthlyPlan: saveActiveMonthlyPlan,
        setIncome: async (income: number) => {
          await saveActiveMonthlyPlan({ income });
          void saveIncome(income).catch(() => undefined);
        },
        setAdvance: async (advance: number) => {
          await saveActiveMonthlyPlan({ advance });
        },
        addIncomeEntry: async (entry) => {
          const savedEntry: SetupIncomeEntry = {
            ...entry,
            id: `${Date.now()}`,
            createdAt: new Date().toISOString()
          };
          const incomeEntries = [savedEntry, ...normalizedData.incomeEntries];
          const monthAdvance = incomeEntries
            .filter((item) => item.monthKey === activeMonthKey && item.type === "advance")
            .reduce((sum, item) => sum + item.amount, 0);
          const monthlyPlans = normalizedData.monthlyPlans.map((plan) =>
            plan.monthKey === activeMonthKey ? { ...plan, advance: monthAdvance } : plan
          );
          updateData({ ...normalizedData, advance: monthAdvance, incomeEntries, monthlyPlans });
          await saveIncomeEntry(savedEntry);
          const activePlan = monthlyPlans.find((plan) => plan.monthKey === activeMonthKey);
          if (activePlan) {
            await saveMonthlyPlan(activePlan);
          }
        },
        setAllocations: async (allocations: SetupAllocation[]) => {
          await saveActiveMonthlyPlan({ allocations });
          void saveAllocations(allocations).catch(() => undefined);
        },
        setCategoryBudgets: async (categoryBudgets: SetupCategoryBudget[]) => {
          await saveActiveMonthlyPlan({ categoryBudgets });
        },
        setGoal: async (goal: SetupGoalInput) => {
        const configuredGoal: SetupGoal = {
          ...goal,
          id: normalizedData.goal?.id ?? normalizedData.goals[0]?.id ?? `${Date.now()}`
        };
        const goals = normalizedData.goals.some((item) => item.id === configuredGoal.id)
          ? normalizedData.goals.map((item) => (item.id === configuredGoal.id ? configuredGoal : item))
          : [configuredGoal, ...normalizedData.goals];

        const nextData = { ...normalizedData, goal: configuredGoal, goals, goalSkipped: false };
        updateData(nextData);
        await savePrimaryGoal(configuredGoal, goals);
      },
        addGoal: async (goal: SetupGoalInput) => {
        const newGoal: SetupGoal = {
          ...goal,
          id: `${Date.now()}`
        };

        const nextData = {
          ...normalizedData,
          goal: normalizedData.goal ?? newGoal,
          goals: [newGoal, ...normalizedData.goals],
          goalSkipped: false
        };

        updateData(nextData);
        await saveGoal(newGoal, !normalizedData.goal);

        return newGoal.id;
      },
        addGoalContribution: async (amount: number) => {
          if (!normalizedData.goal || !Number.isFinite(amount) || amount <= 0) {
            return false;
          }
          const source = `monthly-savings:${activeMonthKey}`;
          const saved = await saveGoalContribution(normalizedData.goal.id, amount, new Date().toISOString(), source);
          if (!saved) {
            return false;
          }
          const updatedGoal: SetupGoal = {
            ...normalizedData.goal,
            savedAmount: normalizedData.goal.savedAmount + amount
          };
          const goals = normalizedData.goals.map((item) => (item.id === updatedGoal.id ? updatedGoal : item));
          updateData({ ...normalizedData, goal: updatedGoal, goals });
          await saveUpdatedGoal(updatedGoal.id, {
            title: updatedGoal.title,
            targetAmount: updatedGoal.targetAmount,
            savedAmount: updatedGoal.savedAmount,
            targetDate: updatedGoal.targetDate,
            imageUri: updatedGoal.imageUri
          });
          return true;
        },
        updateGoal: async (goalId: string, goal: SetupGoalInput) => {
        const updatedGoal: SetupGoal = {
          ...goal,
          id: goalId
        };

        const nextData = {
          ...normalizedData,
          goal: normalizedData.goal?.id === goalId ? updatedGoal : normalizedData.goal,
          goals: normalizedData.goals.map((item) => (item.id === goalId ? updatedGoal : item))
        };

        updateData(nextData);
        await saveUpdatedGoal(goalId, goal);
      },
        skipGoal: async () => {
        const nextData = { ...normalizedData, goal: undefined, goalSkipped: true };
        updateData(nextData);
        await saveGoalSkipped();
      },
        addTransaction: async (transaction) => {
        const savedTransaction = {
          ...transaction,
          id: `${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        const nextData = {
          ...normalizedData,
          transactions: [savedTransaction, ...normalizedData.transactions]
        };

        updateData(nextData);
        await saveTransaction(savedTransaction);
        },
        updateTransaction: async (transaction) => {
          updateData({
            ...normalizedData,
            transactions: normalizedData.transactions.map((item) => (item.id === transaction.id ? transaction : item))
          });
          await updateTransaction(transaction);
        },
        deleteTransaction: async (transactionId: string) => {
          updateData({
            ...normalizedData,
            transactions: normalizedData.transactions.filter((item) => item.id !== transactionId)
          });
          await deleteTransaction(transactionId);
        },
        addRecurringExpense: async (recurring) => {
          const savedRecurring: SetupRecurringExpense = {
            ...recurring,
            id: `${Date.now()}`,
            createdAt: new Date().toISOString()
          };
          updateData({
            ...normalizedData,
            recurringExpenses: [savedRecurring, ...normalizedData.recurringExpenses]
          });
          await saveRecurringExpense(savedRecurring);
        }
      };
    },
    [data, isLoaded, selectedMonth, updateData]
  );

  return <SetupContext.Provider value={value}>{children}</SetupContext.Provider>;
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error("useSetup must be used within SetupProvider");
  }

  return context;
}
