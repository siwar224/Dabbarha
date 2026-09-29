import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { ExpenseCategory } from "@/types/finance";

export type SetupAllocation = {
  id: string;
  label: string;
  amount: number;
  icon: "home-outline" | "cart-outline" | "target" | "cash-multiple";
  tone: "coral" | "lavender" | "blue" | "gold";
};

export type SetupGoal = {
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
};

export type SetupTransaction = {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
  isUnplanned: boolean;
  createdAt: string;
};

type SetupData = {
  income: number;
  allocations: SetupAllocation[];
  goal?: SetupGoal;
  goalSkipped: boolean;
  transactions: SetupTransaction[];
};

type SetupContextValue = SetupData & {
  isLoaded: boolean;
  setIncome: (income: number) => Promise<void>;
  setAllocations: (allocations: SetupAllocation[]) => Promise<void>;
  setGoal: (goal: SetupGoal) => Promise<void>;
  skipGoal: () => Promise<void>;
  addTransaction: (transaction: Omit<SetupTransaction, "id" | "createdAt">) => Promise<void>;
};

const STORAGE_KEY = "dabbirha.setup.v1";

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
  goalSkipped: false,
  transactions: []
};

const SetupContext = createContext<SetupContextValue | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SetupData>(defaultSetupData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadSetupData() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setData({
            ...defaultSetupData,
            ...parsed,
            transactions: parsed.transactions ?? []
          });
        }
      } finally {
        setIsLoaded(true);
      }
    }

    loadSetupData();
  }, []);

  const updateData = useCallback(async (nextData: SetupData) => {
    setData(nextData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  }, []);

  const value = useMemo<SetupContextValue>(
    () => ({
      ...data,
      isLoaded,
      setIncome: async (income: number) => {
        await updateData({ ...data, income });
      },
      setAllocations: async (allocations: SetupAllocation[]) => {
        await updateData({ ...data, allocations });
      },
      setGoal: async (goal: SetupGoal) => {
        await updateData({ ...data, goal, goalSkipped: false });
      },
      skipGoal: async () => {
        await updateData({ ...data, goal: undefined, goalSkipped: true });
      },
      addTransaction: async (transaction) => {
        await updateData({
          ...data,
          transactions: [
            {
              ...transaction,
              id: `${Date.now()}`,
              createdAt: new Date().toISOString()
            },
            ...data.transactions
          ]
        });
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
