import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { expenseCategories } from "@/constants/categories";
import { useSetup, type SetupTransaction } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";

const logoHeader = require("../../assets/images/logo-header.png");

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type AccountMetric = {
  label: string;
  amount: number;
  icon: IconName;
  tone: "green" | "coral" | "lavender";
};

type CategoryBreakdownItem = {
  label: string;
  amount: number;
  percentage: number;
  icon: IconName;
  color: string;
  backgroundColor: string;
};

const monthComparisons = [
  { month: "أكتوبر", amount: 300, color: "#B9A4FF", progress: 0.6 },
  { month: "نوفمبر", amount: 500, color: colors.coral, progress: 1 },
  { month: "ديسمبر", amount: 500, color: "#B9A4FF", progress: 1 }
] as const;

export default function AccountsScreen() {
  const { income, transactions } = useSetup();
  const spent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const savings = Math.max(income - spent, 0);
  const latestTransactions = transactions.slice(0, 3);
  const accountMetrics: AccountMetric[] = [
    {
      label: "الدخل",
      amount: income,
      icon: "arrow-top-right",
      tone: "green"
    },
    {
      label: "المصروف",
      amount: spent,
      icon: "arrow-down",
      tone: "coral"
    },
    {
      label: "الادخار",
      amount: savings,
      icon: "piggy-bank-outline",
      tone: "lavender"
    }
  ];
  const categoryBreakdown: CategoryBreakdownItem[] = expenseCategories
    .map((category, index) => {
      const amount = transactions
        .filter((transaction) => transaction.category === category.id)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      return {
        label: category.label,
        amount,
        percentage: spent > 0 ? Math.round((amount / spent) * 100) : 0,
        icon: category.icon,
        color: index % 2 === 0 ? colors.coral : "#A994F5",
        backgroundColor: index % 2 === 0 ? colors.softCoral : colors.lavender
      };
    })
    .filter((category) => category.amount > 0);

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

        <Pressable style={styles.monthPill}>
          <MaterialCommunityIcons name="chevron-down" color={colors.primary} size={22} />
          <Text style={styles.monthText}>نوفمبر 2024</Text>
          <MaterialCommunityIcons name="calendar-month-outline" color={colors.primary} size={21} />
        </Pressable>

        <View style={styles.metricsRow}>
          {accountMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </View>

        <View style={styles.comparisonCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.chartIcon}>
              <View style={[styles.chartBarMini, styles.chartBarShort]} />
              <View style={[styles.chartBarMini, styles.chartBarMedium]} />
              <View style={[styles.chartBarMini, styles.chartBarTall]} />
            </View>
            <Text style={styles.sectionTitle}>مقارنة الأشهر</Text>
          </View>

          <View style={styles.monthChart}>
            {monthComparisons.map((item) => (
              <View key={item.month} style={styles.monthColumn}>
                <Text style={styles.chartAmount}>{formatMoney(item.amount)}</Text>
                <View style={styles.barSlot}>
                  <View
                    style={[
                      styles.monthBar,
                      {
                        backgroundColor: item.color,
                        height: `${item.progress * 100}%`
                      }
                    ]}
                  />
                </View>
                <Text style={styles.chartMonth}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.listHeader}>
            <Pressable style={styles.showAllButton}>
              <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={22} />
              <Text style={styles.showAllText}>عرض الكل</Text>
            </Pressable>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>أحدث العمليات</Text>
              <MaterialCommunityIcons name="clock-outline" color={colors.primary} size={28} />
            </View>
          </View>

          <View style={styles.transactionsList}>
            {latestTransactions.length > 0 ? (
              latestTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <Text style={styles.emptyText}>ما فماش عمليات مسجلة</Text>
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.listHeader}>
            <Pressable style={styles.showAllButton}>
              <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={22} />
              <Text style={styles.showAllText}>عرض الكل</Text>
            </Pressable>

            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>المصروف حسب الفئة</Text>
              <MaterialCommunityIcons name="chart-pie" color={colors.primary} size={29} />
            </View>
          </View>

          <View style={styles.categoryList}>
            {categoryBreakdown.length > 0 ? (
              categoryBreakdown.map((category) => (
                <CategoryBreakdownRow key={category.label} category={category} />
              ))
            ) : (
              <Text style={styles.emptyText}>المصروف حسب الفئة يظهر بعد أول عملية</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ metric }: { metric: AccountMetric }) {
  const toneStyle = metricToneStyles[metric.tone];
  const iconColor = metricIconColors[metric.tone];

  return (
    <View style={[styles.metricCard, toneStyle]}>
      <View style={[styles.metricIconWrap, { backgroundColor: metricIconBackgrounds[metric.tone] }]}>
        <MaterialCommunityIcons name={metric.icon} color={iconColor} size={32} />
      </View>
      <Text style={[styles.metricLabel, { color: iconColor }]}>{metric.label}</Text>
      <Text style={styles.metricAmount}>{formatMoney(metric.amount)}</Text>
    </View>
  );
}

function TransactionRow({
  transaction
}: {
  transaction: SetupTransaction;
}) {
  const category = expenseCategories.find((item) => item.id === transaction.category);

  return (
    <Pressable style={styles.transactionRow}>
      <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={24} />
      <Text style={styles.transactionAmount}>{formatMoney(transaction.amount)}</Text>

      <View style={styles.transactionInfo}>
        <View style={styles.transactionText}>
          <Text style={styles.transactionTitle}>{category?.label ?? "مصروف"}</Text>
          <Text style={styles.transactionDate}>{new Date(transaction.date).toLocaleDateString("ar-TN", { day: "numeric", month: "long" })}</Text>
        </View>
        <View style={[styles.transactionIcon, { backgroundColor: transaction.isUnplanned ? colors.softCoral : colors.lavender }]}>
          <MaterialCommunityIcons name={category?.icon ?? "cash"} color={transaction.isUnplanned ? colors.coral : colors.primary} size={24} />
        </View>
      </View>
    </Pressable>
  );
}

function CategoryBreakdownRow({
  category
}: {
  category: CategoryBreakdownItem;
}) {
  return (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryPercent}>{category.percentage}%</Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: category.color,
              width: `${category.percentage}%`
            }
          ]}
        />
      </View>
      <Text style={styles.categoryAmount}>{formatMoney(category.amount)}</Text>
      <View style={styles.categoryLabelWrap}>
        <Text style={styles.categoryLabel}>{category.label}</Text>
        <View style={[styles.categoryIcon, { backgroundColor: category.backgroundColor }]}>
          <MaterialCommunityIcons name={category.icon} color={category.color} size={22} />
        </View>
      </View>
    </View>
  );
}

const metricToneStyles = StyleSheet.create({
  green: {
    backgroundColor: "#EFF9F2"
  },
  coral: {
    backgroundColor: "#FFF3EE"
  },
  lavender: {
    backgroundColor: "#F6F3FF"
  }
});

const metricIconColors = {
  green: colors.success,
  coral: "#A84A3A",
  lavender: colors.primary
} as const;

const metricIconBackgrounds = {
  green: "#D7F0E0",
  coral: colors.softCoral,
  lavender: "#D6CAFF"
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
  metricsRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8
  },
  metricCard: {
    flex: 1,
    minHeight: 156,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 6,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1
  },
  metricIconWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32
  },
  metricLabel: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  },
  metricAmount: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 38,
    textAlign: "center"
  },
  comparisonCard: {
    minHeight: 180,
    marginTop: 14,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12
  },
  chartIcon: {
    height: 32,
    width: 32,
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4
  },
  chartBarMini: {
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.coral
  },
  chartBarShort: {
    height: 14,
    opacity: 0.65
  },
  chartBarMedium: {
    height: 22,
    opacity: 0.8
  },
  chartBarTall: {
    height: 29
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "right"
  },
  monthChart: {
    height: 124,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  monthColumn: {
    width: 92,
    alignItems: "center",
    justifyContent: "flex-end"
  },
  chartAmount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  barSlot: {
    height: 54,
    width: 76,
    marginTop: 8,
    justifyContent: "flex-end"
  },
  monthBar: {
    width: "100%",
    minHeight: 28,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  chartMonth: {
    marginTop: 9,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center"
  },
  sectionCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 14,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  listHeader: {
    minHeight: 38,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  showAllButton: {
    minHeight: 36,
    alignItems: "center",
    flexDirection: "row",
    gap: 4
  },
  showAllText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700"
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  transactionsList: {
    marginTop: 2
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "800",
    paddingVertical: 18,
    textAlign: "center"
  },
  transactionRow: {
    minHeight: 66,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8
  },
  transactionAmount: {
    minWidth: 48,
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "left"
  },
  transactionInfo: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12
  },
  transactionText: {
    alignItems: "flex-end"
  },
  transactionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right"
  },
  transactionDate: {
    marginTop: 1,
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right"
  },
  transactionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24
  },
  categoryList: {
    gap: 12,
    marginTop: 8
  },
  categoryRow: {
    minHeight: 32,
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  categoryPercent: {
    width: 46,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "left"
  },
  progressTrack: {
    flex: 1,
    height: 13,
    overflow: "hidden",
    borderRadius: 7,
    backgroundColor: "#F0EDEB"
  },
  progressFill: {
    height: "100%",
    borderRadius: 7
  },
  categoryAmount: {
    width: 50,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right"
  },
  categoryLabelWrap: {
    minWidth: 116,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  categoryLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right"
  },
  categoryIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19
  }
});
