import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonthNavigator } from "@/components/MonthNavigator";
import { useSetup, type SetupAllocation } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";
import { addMonths, formatMonthName } from "@/utils/month";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const logoHeader = require("../../assets/images/logo-header.png");
const planWallet = require("../../assets/images/wallet-plan.png");
const phoneGoal = require("../../assets/images/phone-goal.png");

export default function PlanScreen() {
  const { income, advance, allocations, goal, selectedMonth } = useSetup();
  const upcomingMonths = [
    { month: formatMonthName(addMonths(selectedMonth, 0)), amount: 300, color: colors.coral, background: colors.softCoral, progress: 0.44 },
    { month: formatMonthName(addMonths(selectedMonth, 1)), amount: 500, color: "#756BD8", background: colors.lavender, progress: 0.56 },
    { month: formatMonthName(addMonths(selectedMonth, 2)), amount: 500, color: "#76B8FF", background: colors.softBlue, progress: 0.98 }
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

        <View style={styles.titleWrap}>
          <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={18} />
          <Text style={styles.screenTitle}>خطّتي</Text>
          <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={18} />
        </View>

        <View style={styles.salaryCard}>
          <View style={styles.heroShapeLarge} />
          <View style={styles.heroShapeSmall} />
          <Image source={planWallet} style={styles.walletImage} resizeMode="contain" />
          <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={17} style={styles.heroSparkOne} />
          <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={13} style={styles.heroSparkTwo} />

          <View style={styles.salaryTextBlock}>
            <Text style={styles.salaryLabel}>شهريتي الحالية</Text>
            <Text style={styles.salaryAmount}>{formatMoney(income)}</Text>
            <View style={styles.growthPill}>
              <MaterialCommunityIcons name="cash-fast" color={colors.surface} size={20} />
              <Text style={styles.growthText}>{advance > 0 ? `تسلّمت مسبقًا ${formatMoney(advance)}` : "خطة الشهر الحالية"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.distributionCard}>
          <View style={styles.donutWrap}>
            <AllocationDonut />
            <View style={styles.donutCenter}>
              <Text style={styles.donutLabel}>توزيع</Text>
              <Text style={styles.donutLabel}>شهريتي</Text>
              <Text style={styles.donutAmount}>{formatMoney(income)}</Text>
            </View>
          </View>

          <View style={styles.allocationList}>
            {allocations.map((item) => (
              <AllocationRow key={item.id} item={item} />
            ))}
          </View>
        </View>

        <Pressable onPress={() => router.push("/monthly/plan")} style={styles.editPlanButton}>
          <Text style={styles.editPlanText}>تعديل خطة الشهر</Text>
          <MaterialCommunityIcons name="pencil-outline" color={colors.surface} size={22} />
        </Pressable>

        <View style={styles.monthsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الثلاثة شهور الجاية</Text>
            <MaterialCommunityIcons name="calendar-outline" color={colors.primary} size={24} />
          </View>
          <View style={styles.monthCards}>
            {upcomingMonths.map((item) => (
              <View key={item.month} style={[styles.monthCard, { backgroundColor: item.background }]}>
                <Text style={styles.monthName}>{item.month}</Text>
                <Text style={[styles.monthAmount, { color: item.color }]}>{formatMoney(item.amount)}</Text>
                <Text style={styles.monthCaption}>ادخار متوقع</Text>
                <View style={styles.monthProgressTrack}>
                  <View
                    style={[
                      styles.monthProgressFill,
                      { backgroundColor: item.color, width: `${item.progress * 100}%` }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.goalForecast}>
          <View style={styles.phoneWrap}>
            <Image source={phoneGoal} style={styles.phoneImage} resizeMode="contain" />
            <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={16} style={styles.phoneSparkOne} />
            <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={14} style={styles.phoneSparkTwo} />
          </View>

          <Text style={styles.forecastText}>
            إذا تمشي على الخطة، تنجم توصل لهدف {goal?.title ?? "التليفون"}{" "}
            <Text style={styles.forecastHighlight}>{goal?.targetDate ?? "في ديسمبر"}</Text>
          </Text>
          <Text style={styles.celebration}>🎉</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AllocationRow({
  item
}: {
  item: SetupAllocation;
}) {
  const toneStyle = allocationToneStyles[item.tone];
  const iconColor = allocationIconColors[item.tone];

  return (
    <View style={[styles.allocationRow, toneStyle]}>
      <Text style={[styles.allocationAmount, { color: iconColor }]}>{formatMoney(item.amount)}</Text>
      <View style={styles.allocationLabelWrap}>
        <Text style={styles.allocationLabel}>{item.label}</Text>
        <MaterialCommunityIcons name={item.icon as IconName} color={iconColor} size={27} />
      </View>
    </View>
  );
}

function AllocationDonut() {
  return (
    <View style={styles.donut}>
      <View style={[styles.donutArc, styles.donutArcCoral]} />
      <View style={[styles.donutArc, styles.donutArcBlue]} />
      <View style={[styles.donutArc, styles.donutArcLavender]} />
    </View>
  );
}

const allocationToneStyles = StyleSheet.create({
  coral: {
    backgroundColor: colors.softCoral
  },
  lavender: {
    backgroundColor: colors.lavender
  },
  blue: {
    backgroundColor: colors.softBlue
  },
  gold: {
    backgroundColor: colors.softGold
  }
});

const allocationIconColors = {
  coral: "#B34F3E",
  lavender: "#37318C",
  blue: colors.primary,
  gold: "#8A5A1D"
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
  titleWrap: {
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 18
  },
  screenTitle: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 40,
    textAlign: "center"
  },
  salaryCard: {
    height: 138,
    marginTop: 14,
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  heroShapeLarge: {
    position: "absolute",
    left: -42,
    bottom: -52,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(238,232,255,0.22)"
  },
  heroShapeSmall: {
    position: "absolute",
    left: 12,
    top: -36,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  walletImage: {
    position: "absolute",
    left: 36,
    bottom: 10,
    width: 126,
    height: 112
  },
  heroSparkOne: {
    position: "absolute",
    left: 172,
    top: 28
  },
  heroSparkTwo: {
    position: "absolute",
    left: 196,
    top: 48
  },
  salaryTextBlock: {
    position: "absolute",
    right: 18,
    top: 24,
    width: "56%",
    alignItems: "flex-end"
  },
  salaryLabel: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "right"
  },
  salaryAmount: {
    marginTop: 2,
    color: colors.surface,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 50,
    textAlign: "right"
  },
  growthPill: {
    minHeight: 42,
    marginTop: 4,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  growthText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "800"
  },
  distributionCard: {
    minHeight: 210,
    marginTop: 14,
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    borderRadius: 22,
    padding: 16,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  donutWrap: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center"
  },
  donut: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70
  },
  donutArc: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 18,
    borderColor: "transparent"
  },
  donutArcCoral: {
    borderRightColor: colors.coral,
    borderBottomColor: colors.coral,
    transform: [{ rotate: "-18deg" }]
  },
  donutArcBlue: {
    borderTopColor: "#76B8FF",
    transform: [{ rotate: "-8deg" }]
  },
  donutArcLavender: {
    borderLeftColor: "#8A7BEA",
    transform: [{ rotate: "12deg" }]
  },
  donutCenter: {
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 43,
    backgroundColor: colors.surface
  },
  donutLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
    textAlign: "center"
  },
  donutAmount: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center"
  },
  allocationList: {
    flex: 1,
    gap: 10
  },
  allocationRow: {
    minHeight: 58,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 14
  },
  allocationAmount: {
    fontSize: 20,
    fontWeight: "900"
  },
  allocationLabelWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  allocationLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right"
  },
  editPlanButton: {
    minHeight: 58,
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderRadius: 24,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  editPlanText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  monthsCard: {
    marginTop: 14,
    borderRadius: 22,
    padding: 16,
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
    gap: 10
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "right"
  },
  monthCards: {
    marginTop: 16,
    flexDirection: "row-reverse",
    gap: 10
  },
  monthCard: {
    flex: 1,
    minHeight: 126,
    borderRadius: 16,
    padding: 12
  },
  monthName: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  monthAmount: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  monthCaption: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center"
  },
  monthProgressTrack: {
    height: 16,
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.72)"
  },
  monthProgressFill: {
    height: "100%",
    borderRadius: 8
  },
  goalForecast: {
    minHeight: 126,
    marginTop: 14,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderRadius: 22,
    paddingHorizontal: 14,
    backgroundColor: "#E8F8EA"
  },
  phoneWrap: {
    width: 126,
    height: 106,
    alignItems: "center",
    justifyContent: "center"
  },
  phoneImage: {
    width: 110,
    height: 110
  },
  phoneSparkOne: {
    position: "absolute",
    right: 10,
    top: 22
  },
  phoneSparkTwo: {
    position: "absolute",
    left: 5,
    top: 34
  },
  forecastText: {
    flex: 1,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 29,
    textAlign: "right"
  },
  forecastHighlight: {
    color: colors.success,
    fontSize: 22,
    fontWeight: "900"
  },
  celebration: {
    fontSize: 28
  }
});
