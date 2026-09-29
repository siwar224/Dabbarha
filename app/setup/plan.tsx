import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { SetupFlowScreen } from "@/components/SetupFlowScreen";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const rows: {
  label: string;
  amount: number;
  icon: IconName;
  backgroundColor: string;
  iconColor: string;
}[] = [
  {
    label: "مصاريف ثابتة",
    amount: 200,
    icon: "home-outline",
    backgroundColor: colors.softCoral,
    iconColor: colors.coral
  },
  {
    label: "مصاريف زايدة",
    amount: 100,
    icon: "cart-outline",
    backgroundColor: colors.lavender,
    iconColor: "#756BD8"
  },
  {
    label: "ادخار",
    amount: 500,
    icon: "target",
    backgroundColor: colors.softBlue,
    iconColor: colors.primary
  }
];

export default function PlanSetupScreen() {
  return (
    <SetupFlowScreen
      progress={2}
      title="توزيع الشهر"
      subtitle="كيفاش تخطط لشهريتك؟"
      buttonLabel="التالي"
      onNext={() => router.push("/setup/goal")}
    >
      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.label} style={[styles.planRow, { backgroundColor: row.backgroundColor }]}>
            <Text style={styles.amount}>{formatMoney(row.amount)}</Text>
            <View style={styles.labelWrap}>
              <Text style={styles.label}>{row.label}</Text>
              <MaterialCommunityIcons name={row.icon} color={row.iconColor} size={27} />
            </View>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalAmount}>{formatMoney(800)}</Text>
          <View style={styles.labelWrap}>
            <Text style={styles.totalLabel}>المجموع</Text>
            <MaterialCommunityIcons name="check-circle" color={colors.success} size={31} />
          </View>
        </View>
      </View>
    </SetupFlowScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginTop: 28
  },
  planRow: {
    minHeight: 66,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 18
  },
  amount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "left"
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
    minHeight: 70,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: "#F4EDDF"
  },
  totalAmount: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "left"
  },
  totalLabel: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right"
  }
});
