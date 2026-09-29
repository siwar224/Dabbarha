import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  loadSetupData,
  saveAllocations,
  saveGoal,
  saveGoalSkipped,
  saveIncome,
  saveMonthlyPlan,
  savePrimaryGoal,
  saveTransaction,
  saveUpdatedGoal
} from "@/db";
import type { SetupAllocation, SetupData, SetupGoal, SetupGoalInput, SetupMonthlyPlan, SetupTransaction } from "@/types/setup";
import { addMonths, startOfMonth } from "@/utils/month";

export type { SetupAllocation, SetupGoal, SetupGoalInput, SetupTransaction } from "@/types/setup";

type SetupContextValue = SetupData & {
  isLoaded: boolean;
  selectedMonth: Date;
  setSelectedMonth: (month: Date) => void;
  moveSelectedMonth: (amount: number) => void;
  setAdvance: (advance: number) => Promise<void>;
  setIncome: (income: number) => Promise<void>;
  setAllocations: (allocations: SetupAllocation[]) => Promise<void>;
  setGoal: (goal: SetupGoalInput) => Promise<void>;
  addGoal: (goal: SetupGoalInput) => Promise<string>;
  updateGoal: (goalId: string, goal: SetupGoalInput) => Promise<void>;
  skipGoal: () => Promise<void>;
  addTransaction: (transaction: Omit<SetupTransaction, "id" | "createdAt">) => Promise<void>;
};

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
  monthlyPlans: [],
  goals: [],
  goalSkipped: false,
  transactions: []
};

const SetupContext = createContext<SetupContextValue | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SetupData>(defaultSetupData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    async function hydrateSetupData() {
      try {
        setData(await loadSetupData(defaultSetupData));
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
      const activeMonthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`;
      const saveActiveMonthlyPlan = async (overrides: Partial<SetupMonthlyPlan>) => {
        const plan: SetupMonthlyPlan = {
          monthKey: activeMonthKey,
          income: overrides.income ?? data.income,
          advance: overrides.advance ?? data.advance,
          allocations: overrides.allocations ?? data.allocations
        };
        const monthlyPlans = data.monthlyPlans.some((item) => item.monthKey === activeMonthKey)
          ? data.monthlyPlans.map((item) => (item.monthKey === activeMonthKey ? plan : item))
          : [plan, ...data.monthlyPlans];
        updateData({ ...data, income: plan.income, advance: plan.advance, allocations: plan.allocations, monthlyPlans });
        await saveMonthlyPlan(plan);
      };
      const selectMonth = (month: Date) => {
        const nextMonth = startOfMonth(month);
        const monthKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
        const existingPlan = data.monthlyPlans.find((item) => item.monthKey === monthKey);
        const nextPlan = existingPlan ?? {
          monthKey,
          income: data.income,
          advance: data.advance,
          allocations: data.allocations.map((allocation) => ({ ...allocation }))
        };
        const monthlyPlans = existingPlan ? data.monthlyPlans : [nextPlan, ...data.monthlyPlans];
        updateData({ ...data, income: nextPlan.income, advance: nextPlan.advance, allocations: nextPlan.allocations, monthlyPlans });
        setSelectedMonth(nextMonth);
        if (!existingPlan) {
          void saveMonthlyPlan(nextPlan);
        }
      };

      return {
        ...data,
        isLoaded,
        selectedMonth,
        setSelectedMonth: selectMonth,
        moveSelectedMonth: (amount: number) => selectMonth(addMonths(selectedMonth, amount)),
        setIncome: async (income: number) => {
          await saveActiveMonthlyPlan({ income });
          await saveIncome(income);
        },
        setAdvance: async (advance: number) => {
          await saveActiveMonthlyPlan({ advance });
        },
        setAllocations: async (allocations: SetupAllocation[]) => {
          await saveActiveMonthlyPlan({ allocations });
          await saveAllocations(allocations);
        },
        setGoal: async (goal: SetupGoalInput) => {
        const configuredGoal: SetupGoal = {
          ...goal,
          id: data.goal?.id ?? data.goals[0]?.id ?? `${Date.now()}`
        };
        const goals = data.goals.some((item) => item.id === configuredGoal.id)
          ? data.goals.map((item) => (item.id === configuredGoal.id ? configuredGoal : item))
          : [configuredGoal, ...data.goals];

        const nextData = { ...data, goal: configuredGoal, goals, goalSkipped: false };
        updateData(nextData);
        await savePrimaryGoal(configuredGoal, goals);
      },
        addGoal: async (goal: SetupGoalInput) => {
        const newGoal: SetupGoal = {
          ...goal,
          id: `${Date.now()}`
        };

        const nextData = {
          ...data,
          goal: data.goal ?? newGoal,
          goals: [newGoal, ...data.goals],
          goalSkipped: false
        };

        updateData(nextData);
        await saveGoal(newGoal, !data.goal);

        return newGoal.id;
      },
        updateGoal: async (goalId: string, goal: SetupGoalInput) => {
        const updatedGoal: SetupGoal = {
          ...goal,
          id: goalId
        };

        const nextData = {
          ...data,
          goal: data.goal?.id === goalId ? updatedGoal : data.goal,
          goals: data.goals.map((item) => (item.id === goalId ? updatedGoal : item))
        };

        updateData(nextData);
        await saveUpdatedGoal(goalId, goal);
      },
        skipGoal: async () => {
        const nextData = { ...data, goal: undefined, goalSkipped: true };
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
          ...data,
          transactions: [savedTransaction, ...data.transactions]
        };

        updateData(nextData);
        await saveTransaction(savedTransaction);
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
