import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DatePickerModal } from "@/components/DatePickerModal";
import { expenseCategories, type CategoryOption } from "@/constants/categories";
import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import type { ExpenseCategory } from "@/types/finance";
import { formatDay } from "@/utils/month";

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction } = useSetup();
  const transaction = transactions.find((item) => item.id === id);
  const [amount, setAmount] = useState(transaction ? String(transaction.amount) : "");
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>(transaction?.category ?? "transport");
  const [isUnplanned, setIsUnplanned] = useState(transaction?.isUnplanned ?? false);
  const [note, setNote] = useState(transaction?.note ?? "");
  const [date, setDate] = useState(transaction ? new Date(transaction.date) : new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    if (!transaction) {
      return;
    }
    setAmount(String(transaction.amount));
    setSelectedCategory(transaction.category);
    setIsUnplanned(transaction.isUnplanned);
    setNote(transaction.note ?? "");
    setDate(new Date(transaction.date));
  }, [transaction]);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>المصروف ما عادش موجود</Text>
          <Pressable onPress={() => router.back()} style={styles.submitButton}>
            <Text style={styles.submitText}>رجوع</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentTransaction = transaction;

  async function handleSave() {
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("تنبيه", "المبلغ لازم يكون أكبر من صفر");
      return;
    }

    await updateTransaction({
      ...currentTransaction,
      amount: parsedAmount,
      category: selectedCategory,
      date: date.toISOString(),
      note: note.trim() || undefined,
      isUnplanned
    });
    router.back();
  }

  function handleDelete() {
    Alert.alert("حذف المصروف", "متأكد تحب تحذف المصروف هذا؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(currentTransaction.id);
          router.back();
        }
      }
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={30} />
          </Pressable>
          <Text style={styles.title}>تعديل مصروف</Text>
          <Pressable onPress={handleDelete} style={styles.deleteButton} accessibilityLabel="حذف المصروف">
            <MaterialCommunityIcons name="trash-can-outline" color={colors.coral} size={24} />
          </Pressable>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.fieldLabel}>المبلغ (د)</Text>
          <View style={styles.amountBox}>
            <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.amountInput} textAlign="center" />
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

        <Pressable onPress={() => setDatePickerVisible(true)} style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar-month-outline" color={colors.primary} size={24} />
          <Text style={styles.dateValue}>{formatDay(date)}</Text>
          <MaterialCommunityIcons name="chevron-down" color={colors.primary} size={23} />
        </Pressable>

        <View style={styles.switchRow}>
          <SwitchPreview isOn={isUnplanned} onPress={() => setIsUnplanned((value) => !value)} />
          <Text style={styles.switchLabel}>هذا المصروف موش في الخطة؟</Text>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>ملاحظة (اختياري)</Text>
          <TextInput value={note} onChangeText={setNote} style={styles.noteInput} placeholder="مثال تاكسي للجامعة" placeholderTextColor={colors.mutedText} textAlign="right" />
        </View>

        <Pressable onPress={handleSave} style={styles.submitButton}>
          <Text style={styles.submitText}>حفظ التغييرات</Text>
        </Pressable>
      </ScrollView>
      <DatePickerModal visible={isDatePickerVisible} value={date} onChange={setDate} onClose={() => setDatePickerVisible(false)} />
    </SafeAreaView>
  );
}

function CategoryCard({ category, isSelected, onPress }: { category: CategoryOption; isSelected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}>
      <MaterialCommunityIcons name={category.icon} color={isSelected ? colors.primary : "#B66651"} size={28} />
      <Text style={styles.categoryText}>{category.label}</Text>
    </Pressable>
  );
}

function SwitchPreview({ isOn, onPress }: { isOn: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.switchTrack, isOn ? styles.switchTrackOn : styles.switchTrackOff]} accessibilityRole="switch" accessibilityState={{ checked: isOn }}>
      <View style={styles.switchThumb} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 18 },
  header: { minHeight: 68, alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  deleteButton: { width: 44, height: 44, alignItems: "flex-end", justifyContent: "center" },
  title: { color: colors.primary, fontSize: 22, fontWeight: "900", textAlign: "center" },
  amountSection: { marginTop: 4 },
  fieldLabel: { color: colors.primary, fontSize: 14, fontWeight: "900", textAlign: "right" },
  amountBox: { minHeight: 58, marginTop: 7, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface },
  amountInput: { width: "100%", color: colors.primary, fontSize: 20, fontWeight: "900", padding: 0 },
  categoryGrid: { marginTop: 16, flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 },
  categoryCard: { width: "31%", minHeight: 76, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#FFF3EE" },
  categoryCardSelected: { borderWidth: 1.5, borderColor: "#244ACF", backgroundColor: colors.lavender },
  categoryText: { marginTop: 5, color: colors.primary, fontSize: 14, fontWeight: "800", textAlign: "center" },
  dateRow: { minHeight: 52, marginTop: 14, alignItems: "center", flexDirection: "row", justifyContent: "space-between", borderRadius: 12, paddingHorizontal: 14, backgroundColor: colors.surface },
  dateValue: { color: colors.primary, fontSize: 16, fontWeight: "900", textAlign: "center" },
  switchRow: { minHeight: 50, marginTop: 10, alignItems: "center", flexDirection: "row", justifyContent: "space-between", borderRadius: 12, paddingHorizontal: 14, backgroundColor: colors.surface },
  switchLabel: { color: colors.primary, fontSize: 14, fontWeight: "900", textAlign: "right" },
  switchTrack: { width: 56, height: 32, justifyContent: "center", borderRadius: 16, paddingHorizontal: 4 },
  switchTrackOn: { alignItems: "flex-end", backgroundColor: "#244ACF" },
  switchTrackOff: { alignItems: "flex-start", backgroundColor: "#D9D6D0" },
  switchThumb: { width: 25, height: 25, borderRadius: 13, backgroundColor: colors.surface },
  noteBox: { minHeight: 66, marginTop: 10, justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, backgroundColor: colors.surface },
  noteTitle: { color: colors.mutedText, fontSize: 13, fontWeight: "800", textAlign: "right" },
  noteInput: { color: colors.primary, fontSize: 14, fontWeight: "800", padding: 0, textAlign: "right" },
  submitButton: { minHeight: 56, marginTop: 14, alignItems: "center", justifyContent: "center", borderRadius: 18, backgroundColor: colors.primary },
  submitText: { color: colors.surface, fontSize: 17, fontWeight: "900", textAlign: "center" },
  notFound: { flex: 1, justifyContent: "center", padding: 20 },
  notFoundText: { color: colors.primary, fontSize: 18, fontWeight: "900", textAlign: "center" }
});
