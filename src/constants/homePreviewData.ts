import type { ComponentProps } from "react";

import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type HomeMetricPreview = {
  label: string;
  amount: number;
  icon: IconName;
  tone: "lavender" | "gold" | "coral";
};

export type HomeExpensePreview = {
  id: string;
  title: string;
  amount: number;
  icon: IconName;
  tone: "coral" | "lavender";
};

export const homePreviewData = {
  month: "نوفمبر 2024",
  todayLabel: "اليوم، 12 نوفمبر",
  salary: 800,
  metrics: [
    {
      label: "صرفت",
      amount: 287,
      icon: "chart-bar",
      tone: "coral"
    },
    {
      label: "وفّرت",
      amount: 513,
      icon: "piggy-bank-outline",
      tone: "gold"
    },
    {
      label: "باقيلي",
      amount: 213,
      icon: "clock-outline",
      tone: "lavender"
    }
  ] satisfies HomeMetricPreview[],
  primaryGoal: {
    title: "هدفي: تليفون",
    targetAmount: 950,
    savedAmount: 300,
    remainingAmount: 650,
    progress: 300 / 950
  },
  todayExpenses: [
    {
      id: "transport",
      title: "ترانسبور",
      amount: 4,
      icon: "bus",
      tone: "coral"
    },
    {
      id: "coffee",
      title: "قهوة",
      amount: 3,
      icon: "coffee",
      tone: "lavender"
    }
  ] satisfies HomeExpensePreview[]
} as const;
