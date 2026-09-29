import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { SetupFlowScreen } from "@/components/SetupFlowScreen";
import { colors } from "@/theme/colors";

export default function FirstGoalSetupScreen() {
  return (
    <SetupFlowScreen
      progress={3}
      title="أول هدف لك"
      subtitle="شنو هي أول حاجة تحب توفّر لها؟"
      buttonLabel="إضافة الهدف"
      onNext={() => router.replace("/setup/success")}
    >
      <View style={styles.targetIcon}>
        <MaterialCommunityIcons name="target" color={colors.coral} size={36} />
      </View>

      <View style={styles.form}>
        <InputField label="اسم الهدف" value="تليفون جديد" />
        <InputField label="المبلغ المطلوب (د)" value="950" />
        <InputField label="المبلغ إلي عندك توا (د)" value="300" />

        <View style={styles.dateField}>
          <MaterialCommunityIcons name="calendar-month-outline" color={colors.primary} size={23} />
          <Text style={styles.dateValue}>ديسمبر 2024</Text>
          <Text style={styles.fieldLabel}>التاريخ المستهدف (اختياري)</Text>
        </View>
      </View>
    </SetupFlowScreen>
  );
}

function InputField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} editable={false} style={styles.input} textAlign="right" />
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
  dateValue: {
    flex: 1,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right"
  }
});
