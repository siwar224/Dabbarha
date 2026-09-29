import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { SetupFlowScreen } from "@/components/SetupFlowScreen";
import { useSetup, type SetupAllocation } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatMoney } from "@/utils/formatMoney";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

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

const newAllocationDefaults: SetupAllocation = {
  id: "custom",
  label: "",
  amount: 0,
  icon: "cash-multiple",
  tone: "gold"
};

export default function PlanSetupScreen() {
  const { income, allocations, categoryBudgets, setMonthlyPlan } = useSetup();
  const [draftRows, setDraftRows] = useState<SetupAllocation[]>(allocations);
  const [editingRow, setEditingRow] = useState<SetupAllocation | null>(null);

  useEffect(() => {
    setDraftRows(allocations);
  }, [allocations]);

  const total = useMemo(
    () => draftRows.reduce((sum, row) => sum + row.amount, 0),
    [draftRows]
  );

  async function handleNext() {
    if (draftRows.some((row) => row.amount < 0)) {
      Alert.alert("تنبيه", "المبالغ ما تنجمش تكون سالبة");
      return;
    }
    const fixedAmount = draftRows.find((row) => row.id === "fixed")?.amount ?? 0;
    const extraAmount = draftRows.find((row) => row.id === "extra")?.amount ?? 0;
    const variableBudgets = categoryBudgets.filter((budget) => budget.category !== "transport");
    const variableTotal = variableBudgets.reduce((sum, budget) => sum + budget.amount, 0) || 1;
    const adjustedVariableBudgets = variableBudgets.map((budget, index) => ({
      ...budget,
      amount: index === variableBudgets.length - 1
        ? Math.max(extraAmount - variableBudgets.slice(0, -1).reduce((sum, item) => sum + Math.round((item.amount / variableTotal) * extraAmount), 0), 0)
        : Math.max(Math.round((budget.amount / variableTotal) * extraAmount), 0)
    }));
    await setMonthlyPlan({
      allocations: draftRows,
      categoryBudgets: [{ category: "transport", amount: fixedAmount }, ...adjustedVariableBudgets]
    });
    if (total > income) {
      Alert.alert("تنبيه", "هاي يا معلّم، نقّص شوية مصروف، راك خلّيتها شهر هاذي 😂");
    }
    router.push("/setup/goal");
  }

  function openNewRow() {
    setEditingRow({ ...newAllocationDefaults, id: `custom-${Date.now()}` });
  }

  function saveRow(row: SetupAllocation) {
    setDraftRows((currentRows) => {
      const exists = currentRows.some((item) => item.id === row.id);
      if (exists) {
        return currentRows.map((item) => (item.id === row.id ? row : item));
      }

      return [...currentRows, row];
    });
    setEditingRow(null);
  }

  return (
    <SetupFlowScreen
      progress={2}
      title="توزيع الشهر"
      subtitle="كيفاش تخطط لشهريتك؟"
      buttonLabel="التالي"
      onNext={handleNext}
    >
      <View style={styles.list}>
        {draftRows.map((row) => {
          const tone = toneStyles[row.tone];

          return (
            <Pressable
              key={row.id}
              onPress={() => setEditingRow(row)}
              style={[styles.planRow, { backgroundColor: tone.backgroundColor }]}
            >
              <View style={styles.editHint}>
                <MaterialCommunityIcons name="pencil-outline" color={colors.primary} size={19} />
                <Text style={styles.amount}>{formatMoney(row.amount)}</Text>
              </View>
              <View style={styles.labelWrap}>
                <Text style={styles.label}>{row.label || "خانة جديدة"}</Text>
                <MaterialCommunityIcons name={row.icon as IconName} color={tone.iconColor} size={27} />
              </View>
            </Pressable>
          );
        })}

        <Pressable onPress={openNewRow} style={styles.addRow}>
          <Text style={styles.addText}>زيد خانة</Text>
          <MaterialCommunityIcons name="plus-circle-outline" color={colors.primary} size={25} />
        </Pressable>

        <View style={styles.totalRow}>
          <View>
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

      <AllocationModal
        row={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={saveRow}
      />
    </SetupFlowScreen>
  );
}

function AllocationModal({
  row,
  onClose,
  onSave
}: {
  row: SetupAllocation | null;
  onClose: () => void;
  onSave: (row: SetupAllocation) => void;
}) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("0");

  useEffect(() => {
    setLabel(row?.label ?? "");
    setAmount(row ? String(row.amount) : "0");
  }, [row]);

  if (!row) {
    return null;
  }

  return (
    <Modal transparent animationType="fade" visible={Boolean(row)} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>تعديل الخانة</Text>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>الاسم</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              style={styles.modalInput}
              textAlign="right"
              placeholder="مثلا: قهوة"
              placeholderTextColor={colors.mutedText}
            />
          </View>

          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>المبلغ (د)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              style={styles.modalInput}
              textAlign="right"
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.mutedText}
            />
          </View>

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.modalSecondaryButton}>
              <Text style={styles.modalSecondaryText}>إلغاء</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                onSave({
                  ...row,
                  label: label.trim() || "خانة جديدة",
                  amount: Number(amount) || 0
                })
              }
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
  editHint: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
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
  addRow: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface
  },
  addText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900"
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
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center"
  },
  modalField: {
    marginTop: 14
  },
  modalLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right"
  },
  modalInput: {
    minHeight: 54,
    marginTop: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800",
    backgroundColor: "#FBFAF8"
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
