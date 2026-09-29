import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSetup, type SetupGoal } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";

const fallbackGoalImage = require("../../assets/images/phone-goal.png");

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, goal: primaryGoal, updateGoal } = useSetup();
  const goal = useMemo(
    () => goals.find((item) => item.id === id) ?? (primaryGoal?.id === id ? primaryGoal : undefined),
    [goals, id, primaryGoal]
  );
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);

  if (!goal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyScreen}>
          <Text style={styles.emptyTitle}>الهدف موش موجود</Text>
          <Pressable onPress={() => router.back()} style={styles.primaryButton}>
            <Text style={styles.primaryText}>رجوع</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const progress = Math.min(goal.savedAmount / Math.max(goal.targetAmount, 1), 1);
  const monthlySuggested = Math.max(Math.ceil(remaining / 3), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={29} />
          </Pressable>
          <Text style={styles.title}>تفاصيل الهدف</Text>
          <Pressable style={styles.headerButton} accessibilityLabel="المزيد">
            <MaterialCommunityIcons name="dots-vertical" color={colors.primary} size={25} />
          </Pressable>
        </View>

        <View style={styles.imageHero}>
          <View style={[styles.softShape, styles.softShapeLeft]} />
          <View style={[styles.softShape, styles.softShapeRight]} />
          <Image source={goal.imageUri ? { uri: goal.imageUri } : fallbackGoalImage} style={styles.goalImage} resizeMode="contain" />
        </View>

        <Text style={styles.goalTitle}>{goal.title}</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.progressNumbers}>
          <Text style={styles.remainingText}>باقي {formatMoney(remaining)}</Text>
          <Text style={styles.savedText}>{formatMoney(goal.savedAmount)} / {formatMoney(goal.targetAmount)}</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow icon="clock-outline" label="التاريخ المستهدف" value={goal.targetDate ?? "موش محدد"} />
          <DetailRow icon="calendar-clock" label="تقدير الوصول" value={goal.targetDate ? `في ${goal.targetDate}` : "بعد ما تحدد التاريخ"} />
          <DetailRow icon="cash-plus" label="المبلغ الشهري المقترح" value={formatMoney(monthlySuggested)} />
        </View>

        <Pressable onPress={() => setIsAmountModalOpen(true)} style={styles.primaryButton}>
          <Text style={styles.primaryText}>إضافة مبلغ</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/goal/add")} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>تعديل الهدف</Text>
        </Pressable>
      </ScrollView>

      <AddAmountModal
        goal={goal}
        visible={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
        onSave={async (amount) => {
          await updateGoal(goal.id, {
            title: goal.title,
            targetAmount: goal.targetAmount,
            savedAmount: goal.savedAmount + amount,
            targetDate: goal.targetDate,
            imageUri: goal.imageUri
          });
          setIsAmountModalOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }: { icon: ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailValueWrap}>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      <View style={styles.detailLabelWrap}>
        <Text style={styles.detailLabel}>{label}</Text>
        <MaterialCommunityIcons name={icon} color={colors.primary} size={23} />
      </View>
    </View>
  );
}

function AddAmountModal({
  goal,
  visible,
  onClose,
  onSave
}: {
  goal: SetupGoal;
  visible: boolean;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>إضافة مبلغ</Text>
          <Text style={styles.modalSubtitle}>{goal.title}</Text>

          <View style={styles.modalInputWrap}>
            <Text style={styles.modalCurrency}>د</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.modalInput}
              textAlign="center"
              placeholder="0"
              placeholderTextColor={colors.mutedText}
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.modalSecondaryButton}>
              <Text style={styles.modalSecondaryText}>إلغاء</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                await onSave(Number(amount) || 0);
                setAmount("");
              }}
              style={styles.modalPrimaryButton}
            >
              <Text style={styles.modalPrimaryText}>حفظ</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  header: {
    minHeight: 66,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  imageHero: {
    height: 174,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  softShape: {
    position: "absolute",
    width: 148,
    height: 86,
    borderRadius: 48,
    opacity: 0.68
  },
  softShapeLeft: {
    left: 18,
    bottom: 28,
    backgroundColor: colors.softCoral,
    transform: [{ rotate: "-12deg" }]
  },
  softShapeRight: {
    right: 22,
    bottom: 20,
    backgroundColor: colors.lavender,
    transform: [{ rotate: "16deg" }]
  },
  goalImage: {
    width: 174,
    height: 150
  },
  goalTitle: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center"
  },
  progressTrack: {
    height: 18,
    marginTop: 16,
    overflow: "hidden",
    borderRadius: 9,
    backgroundColor: "#E8E1DA"
  },
  progressFill: {
    height: "100%",
    borderRadius: 9,
    backgroundColor: "#8A7BEA"
  },
  progressNumbers: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  remainingText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  savedText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  detailsCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  detailRow: {
    minHeight: 58,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 14
  },
  detailValueWrap: {
    flex: 1
  },
  detailValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "left"
  },
  detailLabelWrap: {
    flex: 1.2,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8
  },
  detailLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right"
  },
  primaryButton: {
    minHeight: 58,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary
  },
  primaryText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900"
  },
  secondaryButton: {
    minHeight: 58,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.coral,
    borderRadius: 17,
    backgroundColor: colors.surface
  },
  secondaryText: {
    color: colors.coral,
    fontSize: 17,
    fontWeight: "900"
  },
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(28,41,87,0.28)"
  },
  modalCard: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.surface
  },
  modalTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  modalSubtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  modalInputWrap: {
    minHeight: 62,
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#FBFAF8"
  },
  modalCurrency: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900"
  },
  modalInput: {
    minWidth: 80,
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    padding: 0
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  modalPrimaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primary
  },
  modalPrimaryText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900"
  },
  modalSecondaryButton: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface
  },
  modalSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  }
});
