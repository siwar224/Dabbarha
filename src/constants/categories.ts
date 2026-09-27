import type { ExpenseCategory } from "@/types/finance";
import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type CategoryOption = {
  id: ExpenseCategory;
  label: string;
  icon: IconName;
};

export const expenseCategories: CategoryOption[] = [
  { id: "home", label: "دار", icon: "home-outline" },
  { id: "food", label: "أكل", icon: "silverware-fork-knife" },
  { id: "transport", label: "ترانسبور", icon: "car" },
  { id: "other", label: "أخرى", icon: "dots-horizontal" },
  { id: "care", label: "عناية", icon: "bottle-tonic-outline" },
  { id: "coffee", label: "قهوة", icon: "coffee" }
];
