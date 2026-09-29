import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MonthNavigator } from "@/components/MonthNavigator";
import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";

const logoHeader = require("../../assets/images/logo-header.png");
const phoneGoal = require("../../assets/images/phone-goal.png");
const piggyGoal = require("../../assets/images/piggy-goal.png");

type DisplayGoal = {
  id: string;
  title: string;
  icon: "cellphone" | "shield-outline" | "target";
  image: ImageSourcePropType;
  target: number;
  saved: number;
  remaining?: number;
  progress: number;
  fill: string;
  showRemaining: boolean;
  estimate?: string;
};

const goals = [
  {
    id: "phone",
    title: "تليفون جديد",
    icon: "cellphone",
    image: phoneGoal,
    target: 950,
    saved: 300,
    remaining: 650,
    progress: 300 / 950,
    fill: colors.coral,
    showRemaining: true,
    estimate: "تقدير: 3 شهور"
  },
  {
    id: "emergency",
    title: "صندوق طوارئ",
    icon: "shield-outline",
    image: piggyGoal,
    target: 1000,
    saved: 180,
    progress: 180 / 1000,
    fill: "#8A7BEA",
    showRemaining: false,
    estimate: undefined
  }
] as const;

export default function GoalsScreen() {
  const { goal, goals: savedGoals, goalSkipped } = useSetup();
  const activeGoals = savedGoals.length > 0 ? savedGoals : goal ? [goal] : [];
  const displayGoals: DisplayGoal[] = activeGoals.length > 0
    ? activeGoals.map((item) => ({
        id: item.id,
        title: item.title,
        icon: "target",
        image: item.imageUri ? { uri: item.imageUri } : phoneGoal,
        target: item.targetAmount,
        saved: item.savedAmount,
        remaining: Math.max(item.targetAmount - item.savedAmount, 0),
        progress: Math.min(item.savedAmount / Math.max(item.targetAmount, 1), 1),
        fill: colors.coral,
        showRemaining: true,
        estimate: item.targetDate ? `تقدير: ${item.targetDate}` : undefined
      }))
    : goalSkipped
      ? []
      : goals.map((item) => ({ ...item }));

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

        <View style={styles.titleSection}>
          <View style={styles.targetBadge}>
            <MaterialCommunityIcons name="target" color={colors.coral} size={42} />
          </View>
          <View style={styles.titleCopy}>
            <Text style={styles.screenTitle}>أهدافي</Text>
            <Text style={styles.subtitle}>أحلامك أقرب مع كل دينار توفّرو</Text>
          </View>
        </View>

        <View style={styles.goalList}>
          {displayGoals.length > 0 ? (
            displayGoals.map((item) => (
              <GoalCard key={item.id} goal={item} />
            ))
          ) : (
            <View style={styles.emptyGoalCard}>
              <Text style={styles.emptyGoalTitle}>مازال ما عندكش هدف</Text>
              <Text style={styles.emptyGoalText}>تنجم تزيد هدف وقت ما تحب وتتابع تقدّمك</Text>
            </View>
          )}
        </View>

        <View style={styles.impactNotice}>
          <View style={styles.noticeIconWrap}>
            <MaterialCommunityIcons name="lightbulb-on-outline" color={colors.gold} size={36} />
          </View>
          <Text style={styles.noticeText}>
            إذا زاد مصروف خارج الخطة بـ 150 د،{" "}
            <Text style={styles.noticeStrong}>الهدف يتأخر شهر</Text>
          </Text>
          <View style={styles.noticeCalendar}>
            <MaterialCommunityIcons name="calendar-plus" color={colors.primary} size={34} />
          </View>
        </View>

        <Pressable onPress={() => router.push("/goal/add")} style={styles.addButton}>
          <Text style={styles.addText}>زيد هدف</Text>
          <View style={styles.addIcon}>
            <MaterialCommunityIcons name="plus" color={colors.primary} size={28} />
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalCard({ goal }: { goal: DisplayGoal }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/goal/[id]", params: { id: goal.id } })}
      style={styles.goalCard}
    >
      <View style={styles.goalImageWrap}>
        <Image source={goal.image} style={styles.goalImage} resizeMode="contain" />
        {goal.id === "phone" ? (
          <>
            <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={17} style={styles.phoneSparkOne} />
            <MaterialCommunityIcons name="star-four-points" color={colors.coral} size={14} style={styles.phoneSparkTwo} />
          </>
        ) : null}
      </View>

      <View style={styles.goalContent}>
        <View style={styles.goalHeader}>
          <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={26} />
          <View style={styles.goalTitleWrap}>
            <MaterialCommunityIcons name={goal.icon} color={colors.primary} size={30} />
            <Text style={styles.goalTitle}>{goal.title}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { backgroundColor: goal.fill, width: `${goal.progress * 100}%` }]} />
        </View>

        <View style={goal.showRemaining ? styles.threeStats : styles.twoStats}>
          {goal.showRemaining ? (
            <GoalStat label="المتبقي" value={formatMoney(goal.remaining ?? Math.max(goal.target - goal.saved, 0))} valueColor="#C75A48" />
          ) : null}
          <GoalStat label="الموفر" value={formatMoney(goal.saved)} valueColor={goal.id === "phone" ? colors.success : colors.primary} />
          <GoalStat label="المستهدف" value={formatMoney(goal.target)} valueColor={colors.primary} />
        </View>

        {goal.estimate ? (
          <View style={styles.estimatePill}>
            <MaterialCommunityIcons name="clock-outline" color={colors.mutedText} size={22} />
            <Text style={styles.estimateText}>{goal.estimate}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function GoalStat({
  label,
  value,
  valueColor
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

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
  titleSection: {
    marginTop: 26,
    alignItems: "center",
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 18,
    paddingRight: 18
  },
  targetBadge: {
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 43,
    backgroundColor: colors.softCoral
  },
  titleCopy: {
    alignItems: "flex-end"
  },
  screenTitle: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 42,
    textAlign: "right"
  },
  subtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right"
  },
  goalList: {
    gap: 14,
    marginTop: 20
  },
  emptyGoalCard: {
    minHeight: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface
  },
  emptyGoalTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  emptyGoalText: {
    marginTop: 8,
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  },
  goalCard: {
    minHeight: 178,
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  goalImageWrap: {
    width: 118,
    height: 118,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 59,
    backgroundColor: "#FFF0ED"
  },
  goalImage: {
    width: 108,
    height: 108
  },
  phoneSparkOne: {
    position: "absolute",
    right: 7,
    top: 26
  },
  phoneSparkTwo: {
    position: "absolute",
    left: 6,
    top: 54
  },
  goalContent: {
    flex: 1
  },
  goalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  goalTitleWrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  goalTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "right"
  },
  progressTrack: {
    height: 18,
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 9,
    backgroundColor: "#E8E6E2"
  },
  progressFill: {
    height: "100%",
    borderRadius: 9
  },
  threeStats: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  twoStats: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  statBlock: {
    minWidth: 72,
    alignItems: "center"
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center"
  },
  statValue: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  estimatePill: {
    alignSelf: "flex-start",
    marginTop: 18,
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFF5F0"
  },
  estimateText: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "800"
  },
  impactNotice: {
    minHeight: 94,
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: colors.softCoral
  },
  noticeIconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.6)"
  },
  noticeText: {
    flex: 1,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 30,
    textAlign: "right"
  },
  noticeStrong: {
    color: colors.coral,
    fontSize: 21,
    fontWeight: "900"
  },
  noticeCalendar: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.42)"
  },
  addButton: {
    minHeight: 66,
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 14,
    borderRadius: 28,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  addText: {
    color: colors.surface,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center"
  },
  addIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.surface
  }
});
