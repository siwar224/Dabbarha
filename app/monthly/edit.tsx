import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DatePickerModal } from "@/components/DatePickerModal";
import { MonthNavigator } from "@/components/MonthNavigator";
import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import { formatDay, isSameMonth } from "@/utils/month";

export default function EditMonthlyScreen() {
  const { income, incomeEntries, addIncomeEntry, selectedMonth, setIncome } = useSetup();
  const [salary, setSalary] = useState(String(income));
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advanceDate, setAdvanceDate] = useState(new Date());
  const [isAdvancePickerVisible, setAdvancePickerVisible] = useState(false);
  const monthKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthAdvances = incomeEntries.filter((entry) => entry.monthKey === monthKey && entry.type === "advance");
  const totalAdvances = monthAdvances.reduce((sum, entry) => sum + entry.amount, 0);
  const remainingSalary = Math.max(income - totalAdvances, 0);

  useEffect(() => {
    setSalary(String(income));
    setAdvanceAmount("");
    setAdvanceDate(isSameMonth(selectedMonth, new Date()) ? new Date() : selectedMonth);
  }, [income, selectedMonth]);

  async function handleSave() {
    const parsedSalary = Number(salary);
    if (!Number.isFinite(parsedSalary) || parsedSalary < 0) {
      Alert.alert("تنبيه", "الشهرية ما تنجمش تكون سالبة");
      return;
    }
    if (totalAdvances > parsedSalary) {
      Alert.alert("تنبيه", "مجموع الدفعات المسبقة ما ينجمش يفوت الشهرية");
      return;
    }
    await setIncome(parsedSalary);
    router.back();
  }

  async function handleAddAdvance() {
    const amount = Number(advanceAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("تنبيه", "مبلغ الدفعة لازم يكون أكبر من صفر");
      return;
    }
    const entryMonthKey = `${advanceDate.getFullYear()}-${String(advanceDate.getMonth() + 1).padStart(2, "0")}`;
    const entryMonthTotal = incomeEntries
      .filter((entry) => entry.monthKey === entryMonthKey && entry.type === "advance")
      .reduce((sum, entry) => sum + entry.amount, 0);
    if (entryMonthTotal + amount > income) {
      Alert.alert("تنبيه", "مجموع الدفعات المسبقة ما ينجمش يفوت الشهرية");
      return;
    }
    await addIncomeEntry({
      monthKey: entryMonthKey,
      type: "advance",
      amount,
      date: advanceDate.toISOString()
    });
    setAdvanceAmount("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={30} />
          </Pressable>
          <Text style={styles.title}>تعديل الشهرية</Text>
          <View style={styles.headerSpacer} />
        </View>

        <MonthNavigator />

        <View style={styles.salaryCard}>
          <Text style={styles.fieldLabel}>الشهرية (د)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currency}>د</Text>
            <TextInput
              value={salary}
              onChangeText={setSalary}
              keyboardType="numeric"
              style={styles.input}
              textAlign="center"
              placeholder="0"
              placeholderTextColor={colors.mutedText}
            />
            <View style={styles.walletIcon}>
              <MaterialCommunityIcons name="wallet-outline" color={colors.primary} size={27} />
            </View>
          </View>
        </View>

        <View style={styles.advanceCard}>
          <Text style={styles.fieldLabel}>إضافة دفعة مسبقة (د)</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currency}>د</Text>
            <TextInput
              value={advanceAmount}
              onChangeText={setAdvanceAmount}
              keyboardType="numeric"
              style={styles.input}
              textAlign="center"
              placeholder="0"
              placeholderTextColor={colors.mutedText}
            />
            <View style={styles.advanceIcon}>
              <MaterialCommunityIcons name="cash-fast" color={colors.primary} size={27} />
            </View>
          </View>
          <Pressable onPress={() => setAdvancePickerVisible(true)} style={styles.advanceDateRow}>
            <MaterialCommunityIcons name="calendar-month-outline" color={colors.primary} size={21} />
            <Text style={styles.advanceDateText}>{formatDay(advanceDate)}</Text>
          </Pressable>
          <Pressable onPress={handleAddAdvance} style={styles.addAdvanceButton}>
            <MaterialCommunityIcons name="plus" color={colors.surface} size={20} />
            <Text style={styles.addAdvanceText}>إضافة الدفعة</Text>
          </Pressable>
          <Text style={styles.advanceHint}>الراتب المتبقي للاستلام: {remainingSalary} د</Text>
        </View>

        <View style={styles.advancesListCard}>
          <Text style={styles.advancesTitle}>الدفعات المسجلة</Text>
          {monthAdvances.length > 0 ? monthAdvances.map((entry) => (
            <View key={entry.id} style={styles.advanceEntryRow}>
              <Text style={styles.advanceEntryAmount}>{entry.amount} د</Text>
              <Text style={styles.advanceEntryDate}>{formatDay(new Date(entry.date))}</Text>
            </View>
          )) : <Text style={styles.emptyAdvances}>ما فماش دفعات مسبقة</Text>}
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>حفظ التغييرات</Text>
        </Pressable>
      </ScrollView>
      <DatePickerModal
        visible={isAdvancePickerVisible}
        value={advanceDate}
        onChange={setAdvanceDate}
        onClose={() => setAdvancePickerVisible(false)}
      />
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
  salaryCard: {
    minHeight: 126,
    marginTop: 24,
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
  },
  advanceCard: {
    minHeight: 126,
    marginTop: 16,
    borderRadius: 20,
    padding: 12,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  advanceHint: {
    marginTop: 8,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right"
  },
  advanceDateRow: {
    minHeight: 38,
    marginTop: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FBFAF8"
  },
  advanceDateText: {
    flex: 1,
    marginLeft: 8,
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right"
  },
  addAdvanceButton: {
    minHeight: 40,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 12,
    backgroundColor: colors.primary
  },
  addAdvanceText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "900"
  },
  advanceIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.softGold
  },
  advancesListCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 14,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2
  },
  advancesTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right"
  },
  advanceEntryRow: {
    minHeight: 42,
    marginTop: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  advanceEntryAmount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  advanceEntryDate: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "800"
  },
  emptyAdvances: {
    marginTop: 10,
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "700",
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
