import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  loadSetupData,
  saveAllocations,
  saveGoal,
  saveGoalSkipped,
  saveIncome,
  savePrimaryGoal,
  saveTransaction,
  saveUpdatedGoal
} from "@/db";
import type { SetupAllocation, SetupData, SetupGoal, SetupGoalInput, SetupTransaction } from "@/types/setup";

export type { SetupAllocation, SetupGoal, SetupGoalInput, SetupTransaction } from "@/types/setup";

type SetupContextValue = SetupData & {
  isLoaded: boolean;
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
  goals: [],
  goalSkipped: false,
  transactions: []
};

const SetupContext = createContext<SetupContextValue | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SetupData>(defaultSetupData);
  const [isLoaded, setIsLoaded] = useState(false);

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
    () => ({
      ...data,
      isLoaded,
      setIncome: async (income: number) => {
        const nextData = { ...data, income };
        updateData(nextData);
        await saveIncome(income);
      },
      setAllocations: async (allocations: SetupAllocation[]) => {
        const nextData = { ...data, allocations };
        updateData(nextData);
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
    }),
    [data, isLoaded, updateData]
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
