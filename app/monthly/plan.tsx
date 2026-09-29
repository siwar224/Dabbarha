import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSetup, type SetupAllocation } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];
type DraftAllocation = SetupAllocation & { amountText: string };

const toneStyles = {
  coral: {
    backgroundColor: colors.softCoral,
    iconColor: colors.coral
  },
  lavender: {
    backgroundColor: colors.lavender,
    iconColor: "#756BD8"
  },
  blue: {
    backgroundColor: colors.softBlue,
    iconColor: colors.primary
  },
  gold: {
    backgroundColor: colors.softGold,
    iconColor: "#8A5A1D"
  }
} as const;

export default function EditMonthlyPlanScreen() {
  const { income, allocations, setAllocations } = useSetup();
  const [draftRows, setDraftRows] = useState<DraftAllocation[]>(() =>
    allocations.map((row) => ({ ...row, amountText: String(row.amount) }))
  );

  useEffect(() => {
    setDraftRows(allocations.map((row) => ({ ...row, amountText: String(row.amount) })));
  }, [allocations]);

  const total = useMemo(
    () => draftRows.reduce((sum, row) => sum + (Number(row.amountText) || 0), 0),
    [draftRows]
  );

  function updateRowAmount(rowId: string, amountText: string) {
    setDraftRows((currentRows) =>
      currentRows.map((row) => (row.id === rowId ? { ...row, amountText } : row))
    );
  }

  async function handleSave() {
    await setAllocations(
      draftRows.map(({ amountText, ...row }) => ({
        ...row,
        amount: Number(amountText) || 0
      }))
    );
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={30} />
          </Pressable>
          <Text style={styles.title}>تعديل خطة الشهر</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.monthPill}>
          <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={24} />
          <Text style={styles.monthText}>نوفمبر 2024</Text>
          <MaterialCommunityIcons name="chevron-right" color={colors.primary} size={24} />
        </View>

        <View style={styles.rowsList}>
          {draftRows.map((row) => {
            const tone = toneStyles[row.tone];

            return (
              <View key={row.id} style={[styles.planRow, { backgroundColor: tone.backgroundColor }]}>
                <View style={styles.amountWrap}>
                  <Text style={styles.currency}>د</Text>
                  <TextInput
                    value={row.amountText}
                    onChangeText={(value) => updateRowAmount(row.id, value)}
                    keyboardType="numeric"
                    style={styles.amountInput}
                    textAlign="left"
                    placeholder="0"
                    placeholderTextColor={colors.mutedText}
                  />
                </View>

                <View style={styles.labelWrap}>
                  <Text style={styles.label}>{row.label}</Text>
                  <MaterialCommunityIcons name={row.icon as IconName} color={tone.iconColor} size={28} />
                </View>
              </View>
            );
          })}

          <View style={styles.totalRow}>
            <View style={styles.totalAmountWrap}>
              <Text style={styles.totalAmount}>{formatMoney(total)}</Text>
              <Text style={styles.incomeHint}>من {formatMoney(income)}</Text>
            </View>
            <View style={styles.labelWrap}>
              <Text style={styles.totalLabel}>المجموع</Text>
              <MaterialCommunityIcons
                name={total === income ? "check-circle" : "alert-circle-outline"}
                color={total === income ? colors.success : colors.coral}
                size={31}
              />
            </View>
          </View>
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>حفظ التعديلات</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24
  },
  header: {
    minHeight: 76,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center"
  },
  headerSpacer: {
    width: 48
  },
  monthPill: {
    minHeight: 56,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  monthText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  rowsList: {
    gap: 10,
    marginTop: 24
  },
  planRow: {
    minHeight: 66,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 18
  },
  amountWrap: {
    minWidth: 98,
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  currency: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  amountInput: {
    minWidth: 56,
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
    padding: 0
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
    minHeight: 74,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 18,
    backgroundColor: "#F4EDDF"
  },
  totalAmountWrap: {
    alignItems: "flex-start"
  },
  totalAmount: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: "900",
    textAlign: "left"
  },
  incomeHint: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800"
  },
  totalLabel: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right"
  },
  saveButton: {
    minHeight: 58,
    marginTop: "auto",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  saveText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  }
});
