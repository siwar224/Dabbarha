import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMonthYear } from "@/utils/month";

export function MonthNavigator() {
  const { selectedMonth, moveSelectedMonth } = useSetup();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => moveSelectedMonth(-1)} style={styles.arrowButton} accessibilityLabel="الشهر السابق">
        <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={24} />
      </Pressable>
      <Text style={styles.monthText}>{formatMonthYear(selectedMonth)}</Text>
      <Pressable onPress={() => moveSelectedMonth(1)} style={styles.arrowButton} accessibilityLabel="الشهر التالي">
        <MaterialCommunityIcons name="chevron-right" color={colors.primary} size={24} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    minHeight: 52,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 24,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  arrowButton: {
    width: 38,
    height: 42,
    alignItems: "center",
    justifyContent: "center"
  },
  monthText: {
    minWidth: 136,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center"
  }
});
