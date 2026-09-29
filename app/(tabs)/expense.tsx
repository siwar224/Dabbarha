import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { expenseCategories, type CategoryOption } from "@/constants/categories";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useSetup } from "@/context/SetupContext";
import { calculateFinanceSummary } from "@/services/financeService";
import { colors } from "@/theme/colors";
import type { ExpenseCategory } from "@/types/finance";
import { formatDay, isSameMonth } from "@/utils/month";

export default function ExpenseScreen() {
  const { addTransaction, allocations, income, selectedMonth, transactions } = useSetup();
  const [amount, setAmount] = useState("25");
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>("transport");
  const [isUnplanned, setIsUnplanned] = useState(false);
  const [note, setNote] = useState("");
  const expenseDate = isSameMonth(selectedMonth, new Date()) ? new Date() : selectedMonth;

  async function handleSubmit() {
    const parsedAmount = Number(amount);
    if (!parsedAmount) {
      return;
    }

    const expense = {
      amount: parsedAmount,
      category: selectedCategory,
      date: expenseDate.toISOString(),
      note: note.trim() || undefined,
      isUnplanned
    };
    const projectedTransactions = [
      {
        ...expense,
        id: "pending-expense",
        createdAt: new Date().toISOString()
      },
      ...transactions
    ];
    const projectedSummary = calculateFinanceSummary(income, allocations, projectedTransactions, selectedMonth);

    await addTransaction(expense);

    if (projectedSummary.fixedOverrun > 0 || projectedSummary.extraOverrun > 0) {
      Alert.alert("تنبيه", "دخلنا في الطبعة");
    } else if (projectedSummary.totalSpent > income) {
      Alert.alert("تنبيه", "هاي يا معلّم، نقّص شوية مصروف، راك خلّيتها شهر هاذي 😂");
    }

    setAmount("");
    setNote("");
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={30} />
          </Pressable>
          <Text style={styles.screenTitle}>زيد مصروف</Text>
          <View style={styles.headerSpacer} />
        </View>

        <MonthNavigator />

        <View style={styles.amountSection}>
          <Text style={styles.fieldLabel}>المبلغ (د)</Text>
          <View style={styles.amountBox}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.amountInput}
              textAlign="center"
              placeholder="0"
              placeholderTextColor={colors.mutedText}
            />
          </View>
        </View>

        <View style={styles.categoryGrid}>
          {expenseCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </View>

        <Pressable style={styles.dateRow}>
          <MaterialCommunityIcons name="chevron-down" color={colors.primary} size={23} />
          <Text style={styles.dateValue}>{formatDay(expenseDate)}</Text>
          <MaterialCommunityIcons name="calendar-month-outline" color={colors.primary} size={24} />
        </Pressable>

        <View style={styles.switchRow}>
          <SwitchPreview isOn={isUnplanned} onPress={() => setIsUnplanned((value) => !value)} />
          <View style={styles.switchTextGroup}>
            <Text style={styles.switchLabel}>هذا المصروف موش في الخطة؟</Text>
            <MaterialCommunityIcons name="information-outline" color={colors.mutedText} size={19} />
          </View>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>ملاحظة (اختياري)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="مثال تاكسي للجامعة"
            placeholderTextColor={colors.mutedText}
            textAlign="right"
          />
        </View>

        <Pressable onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitText}>سجّل المصروف</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({
  category,
  isSelected,
  onPress
}: {
  category: CategoryOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
    >
      <MaterialCommunityIcons
        name={category.icon}
        color={isSelected ? colors.primary : "#B66651"}
        size={30}
      />
      <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
        {category.label}
      </Text>
    </Pressable>
  );
}

function SwitchPreview({ isOn, onPress }: { isOn: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.switchTrack, isOn ? styles.switchTrackOn : styles.switchTrackOff]}
      accessibilityRole="switch"
      accessibilityState={{ checked: isOn }}
    >
      <View style={[styles.switchThumb, isOn ? styles.switchThumbOn : styles.switchThumbOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  header: {
    minHeight: 64,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  headerSpacer: {
    width: 44
  },
  screenTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center"
  },
  amountSection: {
    marginTop: 4
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right"
  },
  amountBox: {
    minHeight: 58,
    marginTop: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface
  },
  amountInput: {
    width: "100%",
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
    padding: 0
  },
  categoryGrid: {
    marginTop: 16,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10
  },
  categoryCard: {
    width: "31%",
    minHeight: 82,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
    borderRadius: 14,
    backgroundColor: "#FFF3EE"
  },
  categoryCardSelected: {
    borderColor: "#244ACF",
    backgroundColor: colors.lavender
  },
  categoryText: {
    marginTop: 7,
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center"
  },
  categoryTextSelected: {
    fontWeight: "900"
  },
  dateRow: {
    minHeight: 50,
    marginTop: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1
  },
  dateValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  switchRow: {
    minHeight: 48,
    marginTop: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface
  },
  switchTextGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7
  },
  switchLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right"
  },
  switchTrack: {
    width: 56,
    height: 32,
    justifyContent: "center",
    borderRadius: 16,
    paddingHorizontal: 4
  },
  switchTrackOn: {
    alignItems: "flex-end",
    backgroundColor: "#244ACF"
  },
  switchTrackOff: {
    alignItems: "flex-start",
    backgroundColor: "#D9D6D0"
  },
  switchThumb: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.surface
  },
  switchThumbOn: {
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  switchThumbOff: {
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  noteBox: {
    minHeight: 66,
    marginTop: 10,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface
  },
  noteTitle: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right"
  },
  noteInput: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    padding: 0,
    textAlign: "right"
  },
  submitButton: {
    minHeight: 56,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  submitText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  }
});
