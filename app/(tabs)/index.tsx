import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { expenseCategories } from "@/constants/categories";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useSetup } from "@/context/SetupContext";
import { calculateFinanceSummary } from "@/services/financeService";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";
import { formatDay } from "@/utils/month";

const logoHeader = require("../../assets/images/logo-header.png");
const walletHero = require("../../assets/images/wallet-hero-transparent.png");

type HomeMetricPreview = {
  label: string;
  amount: number;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  tone: "lavender" | "gold" | "coral";
};

export default function HomeScreen() {
  const { income, advance, allocations, goal, transactions, selectedMonth } = useSetup();
  const summary = calculateFinanceSummary(income, allocations, transactions, selectedMonth);
  const activeGoal = goal ?? {
    title: "هدفي: تليفون",
    targetAmount: 950,
    savedAmount: 300
  };
  const goalProgress = Math.min(activeGoal.savedAmount / Math.max(activeGoal.targetAmount, 1), 1);
  const latestExpenses = summary.monthTransactions.slice(0, 3);

  const metrics: HomeMetricPreview[] = [
    {
      label: "صرفت",
      amount: summary.totalSpent,
      icon: "chart-bar",
      tone: "coral"
    },
    {
      label: "وفّرت",
      amount: summary.remainingSavings,
      icon: "piggy-bank-outline",
      tone: "gold"
    },
    {
      label: "باقيلي",
      amount: summary.remainingPlanned,
      icon: "clock-outline",
      tone: "lavender"
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} accessibilityLabel="الإشعارات">
            <MaterialCommunityIcons name="bell-outline" color={colors.primary} size={24} />
          </Pressable>

          <Image source={logoHeader} style={styles.logoHeader} resizeMode="contain" />

          <Pressable style={styles.iconButton} accessibilityLabel="الإعدادات">
            <MaterialCommunityIcons name="cog-outline" color={colors.primary} size={24} />
          </Pressable>
        </View>

        <MonthNavigator />

        <Pressable
          onPress={() => router.push("/monthly/edit")}
          style={styles.salaryHero}
          accessibilityRole="button"
          accessibilityLabel="تعديل الشهرية"
        >
          <View style={styles.heroShapeLarge} />
          <View style={styles.heroShapeSmall} />
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroLabel}>شهريتي</Text>
            <Text style={styles.heroAmount}>{formatMoney(income)}</Text>
            {advance > 0 ? <Text style={styles.heroAdvance}>منها avance {formatMoney(advance)}</Text> : null}
          </View>
          <Image source={walletHero} style={styles.heroImage} resizeMode="contain" />
          <MaterialCommunityIcons name="star-four-points" color={colors.gold} size={20} style={styles.heroSpark} />
        </Pressable>

        <View style={styles.metricsRow}>
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </View>

        <BudgetStatusCard summary={summary} />

        <Pressable style={styles.goalCard}>
          <View style={styles.goalIconWrap}>
            <MaterialCommunityIcons name="cellphone" color={colors.primary} size={48} />
            <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={16} style={styles.goalSpark} />
          </View>

          <View style={styles.goalContent}>
            <View style={styles.goalTitleRow}>
              <View style={styles.goalBadge}>
                <MaterialCommunityIcons name="cellphone" color={colors.primary} size={22} />
              </View>
              <Text style={styles.goalTitle}>هدفي: {activeGoal.title}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${goalProgress * 100}%` }]} />
            </View>
            <View style={styles.goalNumbers}>
              <Text style={styles.goalNumber}>{formatMoney(Math.max(activeGoal.targetAmount - activeGoal.savedAmount, 0))} باقي</Text>
              <Text style={styles.goalNumber}>
                {formatMoney(activeGoal.savedAmount)} / {formatMoney(activeGoal.targetAmount)}
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
          <Text style={styles.sectionDate}>{summary.isCurrentMonth ? `اليوم، ${formatDay(new Date())}` : "مصروفات الشهر"}</Text>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>مصروفات اليوم</Text>
              <MaterialCommunityIcons name="calendar-outline" color={colors.primary} size={22} />
            </View>
          </View>

          <View style={styles.expenseList}>
            {latestExpenses.length > 0 ? (
              latestExpenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))
            ) : (
              <Text style={styles.emptyText}>مازال ما سجلتش مصاريف اليوم</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ metric }: { metric: HomeMetricPreview }) {
  return (
    <View style={[styles.metricCard, metricToneStyles[metric.tone]]}>
      <MaterialCommunityIcons name={metric.icon} color={metricIconColors[metric.tone]} size={30} />
      <Text style={styles.metricLabel}>{metric.label}</Text>
      <Text style={styles.metricAmount}>{formatMoney(metric.amount)}</Text>
    </View>
  );
}

function BudgetStatusCard({ summary }: { summary: ReturnType<typeof calculateFinanceSummary> }) {
  return (
    <View style={styles.budgetCard}>
      <View style={styles.budgetHeader}>
        <MaterialCommunityIcons name="chart-donut" color={colors.primary} size={25} />
        <Text style={styles.budgetTitle}>متابعة الخطة</Text>
      </View>

      <BudgetRow label="مصاريف ثابتة" spent={summary.fixedSpent} budget={summary.fixedBudget} overrun={summary.fixedOverrun} />
      <BudgetRow label="مصاريف زايدة" spent={summary.extraSpent} budget={summary.extraBudget} overrun={summary.extraOverrun} />

      <View style={styles.transportSummary}>
        <View style={styles.transportIcon}>
          <MaterialCommunityIcons name="bus" color={colors.primary} size={22} />
        </View>
        <View style={styles.transportText}>
          <Text style={styles.transportTitle}>{summary.isCurrentMonth ? "ترانسبور اليوم" : "ترانسبور الشهر"}</Text>
          <Text style={styles.transportHint}>هذا الشهر: {formatMoney(summary.transportThisMonth)}</Text>
        </View>
        <Text style={styles.transportAmount}>{formatMoney(summary.todayTransport)}</Text>
      </View>

      {summary.savingsUsed > 0 ? (
        <View style={styles.savingsWarning}>
          <MaterialCommunityIcons name="alert-circle-outline" color={colors.coral} size={20} />
          <Text style={styles.savingsWarningText}>استعملت من الادخار {formatMoney(summary.savingsUsed)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function BudgetRow({ label, spent, budget, overrun }: { label: string; spent: number; budget: number; overrun: number }) {
  const progress = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const color = overrun > 0 ? colors.coral : colors.primary;

  return (
    <View style={styles.budgetRow}>
      <View style={styles.budgetRowText}>
        <Text style={styles.budgetRowLabel}>{label}</Text>
        <Text style={[styles.budgetRowAmount, { color }]}>
          {formatMoney(spent)} / {formatMoney(budget)}
        </Text>
      </View>
      <View style={styles.budgetTrack}>
        <View style={[styles.budgetFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ExpenseRow({ expense }: { expense: ReturnType<typeof useSetup>["transactions"][number] }) {
  const category = expenseCategories.find((item) => item.id === expense.category);

  return (
    <Pressable style={styles.expenseRow}>
      <MaterialCommunityIcons name="chevron-left" color={colors.mutedText} size={24} />
      <Text style={styles.expenseAmount}>{formatMoney(expense.amount)}</Text>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseTitle}>{category?.label ?? "مصروف"}</Text>
        <View style={[styles.expenseIcon, expense.isUnplanned ? styles.expenseIconCoral : styles.expenseIconLavender]}>
          <MaterialCommunityIcons name={category?.icon ?? "cash"} color={expense.isUnplanned ? colors.coral : colors.primary} size={24} />
        </View>
      </View>
    </Pressable>
  );
}

const metricToneStyles = StyleSheet.create({
  lavender: {
    backgroundColor: colors.lavender
  },
  gold: {
    backgroundColor: colors.softGold
  },
  coral: {
    backgroundColor: colors.softCoral
  }
});

const metricIconColors = {
  lavender: colors.primary,
  gold: "#8A5A1D",
  coral: colors.coral
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28
  },
  header: {
    minHeight: 80,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  logoHeader: {
    width: 156,
    height: 82
  },
  monthPill: {
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  monthText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700"
  },
  salaryHero: {
    height: 136,
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  heroShapeLarge: {
    position: "absolute",
    left: -38,
    bottom: -48,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(238,232,255,0.24)"
  },
  heroShapeSmall: {
    position: "absolute",
    left: 10,
    top: -34,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  heroTextBlock: {
    position: "absolute",
    top: 30,
    right: 126,
    left: 90,
    alignItems: "center"
  },
  heroLabel: {
    color: colors.surface,
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center"
  },
  heroAmount: {
    marginTop: 4,
    color: colors.surface,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 50,
    textAlign: "center"
  },
  heroAdvance: {
    marginTop: -2,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },
  heroImage: {
    position: "absolute",
    right: 10,
    bottom: 0,
    width: 118,
    height: 118
  },
  heroSpark: {
    position: "absolute",
    right: 124,
    top: 35
  },
  metricsRow: {
    flexDirection: "row-reverse",
    gap: 12,
    marginTop: 16
  },
  metricCard: {
    flex: 1,
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    paddingVertical: 14
  },
  metricLabel: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center"
  },
  metricAmount: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center"
  },
  budgetCard: {
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  budgetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  budgetTitle: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "right"
  },
  budgetRow: {
    marginTop: 14
  },
  budgetRowText: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  budgetRowLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right"
  },
  budgetRowAmount: {
    fontSize: 14,
    fontWeight: "900"
  },
  budgetTrack: {
    height: 10,
    marginTop: 7,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "#F0EDEB"
  },
  budgetFill: {
    height: "100%",
    borderRadius: 5
  },
  transportSummary: {
    minHeight: 54,
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  transportIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.lavender
  },
  transportText: {
    flex: 1,
    alignItems: "flex-end"
  },
  transportTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right"
  },
  transportHint: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right"
  },
  transportAmount: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900"
  },
  savingsWarning: {
    marginTop: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6
  },
  savingsWarningText: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right"
  },
  goalCard: {
    minHeight: 140,
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  goalIconWrap: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 44,
    backgroundColor: colors.lavender
  },
  goalSpark: {
    position: "absolute",
    right: 10,
    top: 8
  },
  goalContent: {
    flex: 1
  },
  goalTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12
  },
  goalBadge: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.softCoral
  },
  goalTitle: {
    flex: 1,
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "right"
  },
  progressTrack: {
    height: 16,
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "#E8E6E2"
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: colors.coral
  },
  goalNumbers: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  goalNumber: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800"
  },
  sectionCard: {
    marginTop: 16,
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionDate: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "700"
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right"
  },
  expenseList: {
    gap: 12,
    marginTop: 16
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  },
  expenseRow: {
    minHeight: 66,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: colors.surface
  },
  expenseAmount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  expenseInfo: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12
  },
  expenseTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "right"
  },
  expenseIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24
  },
  expenseIconCoral: {
    backgroundColor: colors.softCoral
  },
  expenseIconLavender: {
    backgroundColor: colors.lavender
  }
});
