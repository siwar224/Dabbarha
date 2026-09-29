import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonthNavigator } from "@/components/MonthNavigator";
import { expenseCategories } from "@/constants/categories";
import { useSetup, type SetupAllocation, type SetupCategoryBudget } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type DraftAllocation = SetupAllocation & { amountText: string };
type DraftCategoryBudget = SetupCategoryBudget & { amountText: string };

const toneStyles = {
  coral: {
    backgroundColor: colors.softCoral,
    iconColor: colors.coral
  },
  lavender: {
    backgroundColor: colors.lavender,
    iconColor: "#756BD8"
  },
  blue: {
    backgroundColor: colors.softBlue,
    iconColor: colors.primary
  },
  gold: {
    backgroundColor: colors.softGold,
    iconColor: "#8A5A1D"
  }
} as const;

export default function EditMonthlyPlanScreen() {
  const { income, allocations, categoryBudgets, setMonthlyPlan } = useSetup();
  const [draftRows, setDraftRows] = useState<DraftAllocation[]>(() =>
    allocations.map((row) => ({ ...row, amountText: String(row.amount) }))
  );
  const [draftCategoryBudgets, setDraftCategoryBudgets] = useState<DraftCategoryBudget[]>(() =>
    categoryBudgets.map((budget) => ({ ...budget, amountText: String(budget.amount) }))
  );

  useEffect(() => {
    setDraftRows(allocations.map((row) => ({ ...row, amountText: String(row.amount) })));
    setDraftCategoryBudgets(categoryBudgets.map((budget) => ({ ...budget, amountText: String(budget.amount) })));
  }, [allocations, categoryBudgets]);

  const total = useMemo(
    () => draftRows.reduce((sum, row) => sum + (Number(row.amountText) || 0), 0),
    [draftRows]
  );
  const categoryTotal = useMemo(
    () => draftCategoryBudgets.reduce((sum, budget) => sum + (Number(budget.amountText) || 0), 0),
    [draftCategoryBudgets]
  );

  function updateRowAmount(rowId: string, amountText: string) {
    setDraftRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, amountText } : row))
    );
  }

  function updateCategoryBudget(category: SetupCategoryBudget["category"], amountText: string) {
    setDraftCategoryBudgets((currentBudgets) =>
      currentBudgets.map((budget) => (budget.category === category ? { ...budget, amountText } : budget))
    );
  }

  async function handleSave() {
    const nextAllocations = draftRows.map(({ amountText, ...row }) => ({
      ...row,
      amount: Number(amountText) || 0
    }));
    const nextCategoryBudgets = draftCategoryBudgets.map(({ amountText, ...budget }) => ({
      ...budget,
      amount: Number(amountText) || 0
    }));
    if (nextAllocations.some((row) => row.amount < 0) || nextCategoryBudgets.some((budget) => budget.amount < 0)) {
      Alert.alert("تنبيه", "المبالغ ما تنجمش تكون سالبة");
      return;
    }
    const envelopeTotal = nextAllocations
      .filter((row) => row.id !== "saving")
      .reduce((sum, row) => sum + row.amount, 0);
    const nextCategoryTotal = nextCategoryBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    if (nextCategoryTotal !== envelopeTotal) {
      Alert.alert("تنبيه", "مجموع ميزانيات الفئات لازم يساوي مصاريف ثابتة ومصاريف زايدة");
      return;
    }
    await setMonthlyPlan({ allocations: nextAllocations, categoryBudgets: nextCategoryBudgets });
    if (total > income) {
      Alert.alert("تنبيه", "هاي يا معلّم، نقّص شوية مصروف، راك خلّيتها شهر هاذي 😂");
    }
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={30} />
          </Pressable>
          <Text style={styles.title}>تعديل خطة الشهر</Text>
          <View style={styles.headerSpacer} />
        </View>

        <MonthNavigator />

        <View style={styles.rowsList}>
          {draftRows.map((row) => {
            const tone = toneStyles[row.tone];

            return (
              <View key={row.id} style={[styles.planRow, { backgroundColor: tone.backgroundColor }]}>
                <View style={styles.amountWrap}>
                  <Text style={styles.currency}>د</Text>
                  <TextInput
                    value={row.amountText}
                    onChangeText={(value) => updateRowAmount(row.id, value)}
                    keyboardType="numeric"
                    style={styles.amountInput}
                    textAlign="left"
                    placeholder="0"
                    placeholderTextColor={colors.mutedText}
                  />
                </View>

                <View style={styles.labelWrap}>
                  <Text style={styles.label}>{row.label}</Text>
                  <MaterialCommunityIcons name={row.icon as IconName} color={tone.iconColor} size={28} />
                </View>
              </View>
            );
          })}

          <View style={styles.totalRow}>
            <View style={styles.totalAmountWrap}>
              <Text style={styles.totalAmount}>{formatMoney(total)}</Text>
              <Text style={styles.incomeHint}>من {formatMoney(income)}</Text>
            </View>
            <View style={styles.labelWrap}>
              <Text style={styles.totalLabel}>المجموع</Text>
              <MaterialCommunityIcons
                name={total === income ? "check-circle" : "alert-circle-outline"}
                color={total === income ? colors.success : colors.coral}
                size={31}
              />
            </View>
          </View>
        </View>

        <View style={styles.categoryBudgetCard}>
          <View style={styles.categoryBudgetHeader}>
            <Text style={styles.categoryBudgetTitle}>ميزانية حسب الفئة</Text>
            <MaterialCommunityIcons name="tag-multiple-outline" color={colors.primary} size={25} />
          </View>
          <Text style={styles.categoryBudgetHint}>وزّع مصاريف ثابتة ومصاريف زايدة على الفئات</Text>

          <View style={styles.categoryBudgetList}>
            {draftCategoryBudgets.map((budget) => {
              const category = expenseCategories.find((item) => item.id === budget.category);
              return (
                <View key={budget.category} style={styles.categoryBudgetRow}>
                  <View style={styles.categoryAmountWrap}>
                    <Text style={styles.currency}>د</Text>
                    <TextInput
                      value={budget.amountText}
                      onChangeText={(value) => updateCategoryBudget(budget.category, value)}
                      keyboardType="numeric"
                      style={styles.categoryAmountInput}
                      textAlign="left"
                      placeholder="0"
                      placeholderTextColor={colors.mutedText}
                    />
                  </View>
                  <View style={styles.categoryLabelWrap}>
                    <Text style={styles.categoryLabel}>{category?.label ?? budget.category}</Text>
                    <MaterialCommunityIcons name={category?.icon ?? "cash"} color={colors.primary} size={22} />
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={styles.categoryBudgetTotal}>المجموع: {formatMoney(categoryTotal)}</Text>
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>حفظ التعديلات</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  header: {
    minHeight: 76,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center"
  },
  headerSpacer: {
    width: 48
  },
  monthPill: {
    minHeight: 56,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  monthText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  rowsList: {
    gap: 10,
    marginTop: 24
  },
  planRow: {
    minHeight: 66,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 18
  },
  amountWrap: {
    minWidth: 98,
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  currency: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  amountInput: {
    minWidth: 56,
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    padding: 0
  },
  labelWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  label: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right"
  },
  totalRow: {
    minHeight: 74,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: "#F4EDDF"
  },
  totalAmountWrap: {
    alignItems: "flex-start"
  },
  totalAmount: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "left"
  },
  incomeHint: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800"
  },
  totalLabel: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right"
  },
  categoryBudgetCard: {
    marginTop: 16,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2
  },
  categoryBudgetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  categoryBudgetTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right"
  },
  categoryBudgetHint: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right"
  },
  categoryBudgetList: {
    gap: 8,
    marginTop: 12
  },
  categoryBudgetRow: {
    minHeight: 48,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: "#FBFAF8"
  },
  categoryAmountWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5
  },
  categoryAmountInput: {
    minWidth: 50,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    padding: 0
  },
  categoryLabelWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  categoryLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right"
  },
  categoryBudgetTotal: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right"
  },
  saveButton: {
    minHeight: 58,
    marginTop: "auto",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  saveText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  }
});
