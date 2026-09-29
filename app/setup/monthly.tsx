import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { SetupFlowScreen } from "@/components/SetupFlowScreen";
import { colors } from "@/theme/colors";

export default function MonthlySetupScreen() {
  return (
    <SetupFlowScreen
      progress={1}
      title="إعداد الشهرية"
      subtitle="كم هي قيمة دخلك الشهري؟ (تقدر تغيّرها لاحقًا)"
      buttonLabel="التالي"
      onNext={() => router.push("/setup/plan")}
    >
      <View style={styles.salaryCard}>
        <Text style={styles.fieldLabel}>الشهرية (د)</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currency}>د</Text>
          <TextInput
            value="800"
            editable={false}
            style={styles.input}
            textAlign="center"
            keyboardType="numeric"
          />
          <View style={styles.walletIcon}>
            <MaterialCommunityIcons name="wallet-outline" color={colors.primary} size={27} />
          </View>
        </View>
      </View>
    </SetupFlowScreen>
  );
}

const styles = StyleSheet.create({
  salaryCard: {
    minHeight: 126,
    marginTop: 48,
    borderRadius: 20,
    padding: 12,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right"
  },
  inputRow: {
    minHeight: 64,
    marginTop: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: "#FBFAF8"
  },
  currency: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: "900"
  },
  input: {
    flex: 1,
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    padding: 0
  },
  walletIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.lavender
  }
});
