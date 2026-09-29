import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { SetupFlowScreen } from "@/components/SetupFlowScreen";
import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";

export default function FirstGoalSetupScreen() {
  const { goal, setGoal, skipGoal } = useSetup();
  const [title, setTitle] = useState(goal?.title ?? "تليفون جديد");
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : "950");
  const [savedAmount, setSavedAmount] = useState(goal ? String(goal.savedAmount) : "300");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "ديسمبر 2024");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetAmount(String(goal.targetAmount));
      setSavedAmount(String(goal.savedAmount));
      setTargetDate(goal.targetDate ?? "");
    }
  }, [goal]);

  async function handleAddGoal() {
    await setGoal({
      title: title.trim() || "هدفي الأول",
      targetAmount: Number(targetAmount) || 0,
      savedAmount: Number(savedAmount) || 0,
      targetDate: targetDate.trim() || undefined
    });
    router.replace("/setup/success");
  }

  async function handleSkipGoal() {
    await skipGoal();
    router.replace("/setup/success");
  }

  return (
    <SetupFlowScreen
      progress={3}
      title="أول هدف لك"
      subtitle="شنو هي أول حاجة تحب توفّر لها؟"
      buttonLabel="إضافة الهدف"
      onNext={handleAddGoal}
      secondaryButtonLabel="تخطي الهدف"
      onSecondary={handleSkipGoal}
    >
      <View style={styles.targetIcon}>
        <MaterialCommunityIcons name="target" color={colors.coral} size={36} />
      </View>

      <View style={styles.form}>
        <InputField label="اسم الهدف" value={title} onChangeText={setTitle} />
        <InputField label="المبلغ المطلوب (د)" value={targetAmount} onChangeText={setTargetAmount} keyboardType="numeric" />
        <InputField label="المبلغ إلي عندك توا (د)" value={savedAmount} onChangeText={setSavedAmount} keyboardType="numeric" />

        <View style={styles.dateField}>
          <MaterialCommunityIcons name="calendar-month-outline" color={colors.primary} size={23} />
          <TextInput
            value={targetDate}
            onChangeText={setTargetDate}
            style={styles.dateInput}
            textAlign="right"
            placeholder="ديسمبر 2024"
            placeholderTextColor={colors.mutedText}
          />
          <Text style={styles.fieldLabel}>التاريخ المستهدف (اختياري)</Text>
        </View>
      </View>
    </SetupFlowScreen>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  keyboardType = "default"
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
        textAlign="right"
        placeholderTextColor={colors.mutedText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  targetIcon: {
    position: "absolute",
    right: 14,
    top: 24
  },
  form: {
    gap: 12,
    marginTop: 24
  },
  field: {
    minHeight: 66,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right"
  },
  input: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    padding: 0
  },
  dateField: {
    minHeight: 62,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface
  },
  dateInput: {
    flex: 1,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
    padding: 0
  }
});
