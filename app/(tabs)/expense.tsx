import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { expenseCategories, type CategoryOption } from "@/constants/categories";
import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";
import type { ExpenseCategory } from "@/types/finance";
import { formatMoney } from "@/utils/formatMoney";

const logoHeader = require("../../assets/images/logo-header.png");

export default function ExpenseScreen() {
  const { allocations, addTransaction } = useSetup();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>("transport");
  const [isUnplanned, setIsUnplanned] = useState(true);
  const [note, setNote] = useState("");

  const savingsTarget = allocations.find((item) => item.id === "saving")?.amount ?? 0;
  const nextMonthRequired = savingsTarget + (Number(amount) || 0);

  async function handleSubmit() {
    const parsedAmount = Number(amount);
    if (!parsedAmount) {
      return;
    }

    await addTransaction({
      amount: parsedAmount,
      category: selectedCategory,
      date: new Date().toISOString(),
      note: note.trim() || undefined,
      isUnplanned
    });

    setAmount("");
    setNote("");
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={32} />
          </Pressable>

          <Image source={logoHeader} style={styles.logoHeader} resizeMode="contain" />

          <Pressable style={styles.iconButton} accessibilityLabel="الإعدادات">
            <MaterialCommunityIcons name="cog-outline" color={colors.primary} size={24} />
          </Pressable>
        </View>

        <Text style={styles.screenTitle}>زيد مصروف</Text>

        <View style={styles.formPanel}>
          <Text style={styles.fieldLabel}>المبلغ</Text>
          <View style={styles.amountBox}>
            <Text style={styles.currency}>د</Text>
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

          <Text style={[styles.fieldLabel, styles.categoryLabel]}>الصنف</Text>
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
        </View>

        <Pressable style={styles.dateRow}>
          <MaterialCommunityIcons name="chevron-down" color={colors.primary} size={24} />
          <Text style={styles.dateValue}>15 نوفمبر 2024</Text>
          <View style={styles.rowLabel}>
            <Text style={styles.rowLabelText}>التاريخ</Text>
            <MaterialCommunityIcons name="calendar-outline" color={colors.primary} size={24} />
          </View>
        </Pressable>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>ملاحظة (اختياري)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="مثلا: تاكسي للجامعة"
            placeholderTextColor={colors.mutedText}
            textAlign="right"
          />
        </View>

        <View style={styles.switchRow}>
          <SwitchPreview isOn={isUnplanned} onPress={() => setIsUnplanned((value) => !value)} />
          <View style={styles.switchTextGroup}>
            <Text style={styles.switchLabel}>هذا المصروف موش في الخطة</Text>
            <MaterialCommunityIcons name="information-outline" color={colors.primary} size={21} />
          </View>
        </View>

        <View style={styles.impactCard}>
          <View style={styles.impactIconWrap}>
            <MaterialCommunityIcons name="chart-bar" color={colors.coral} size={46} />
            <MaterialCommunityIcons name="arrow-up-right" color={colors.coral} size={24} style={styles.impactArrow} />
          </View>
          <Text style={styles.impactText}>
            إذا تسجل هذا المصروف، الشهر الجاي يلزمك توفّر{" "}
            <Text style={styles.impactAmount}>{formatMoney(nextMonthRequired)}</Text> باش تبقى في نفس الهدف.
          </Text>
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
        size={32}
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
    paddingHorizontal: 20,
    paddingBottom: 28
  },
  header: {
    minHeight: 80,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  logoHeader: {
    width: 156,
    height: 82
  },
  screenTitle: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 44,
    textAlign: "center"
  },
  formPanel: {
    marginTop: 16,
    borderRadius: 22,
    padding: 14,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right"
  },
  amountBox: {
    minHeight: 76,
    marginTop: 6,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    borderRadius: 18,
    backgroundColor: "#F3F1F4"
  },
  currency: {
    color: colors.primary,
    fontSize: 39,
    fontWeight: "900",
    lineHeight: 48
  },
  amountInput: {
    minWidth: 72,
    color: colors.primary,
    fontSize: 45,
    fontWeight: "900",
    lineHeight: 54,
    padding: 0
  },
  categoryLabel: {
    marginTop: 18
  },
  categoryGrid: {
    marginTop: 10,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10
  },
  categoryCard: {
    width: "31.2%",
    minHeight: 96,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 16,
    backgroundColor: "#FFF3EE"
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.lavender
  },
  categoryText: {
    marginTop: 8,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  },
  categoryTextSelected: {
    fontWeight: "900"
  },
  dateRow: {
    minHeight: 66,
    marginTop: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.surface
  },
  dateValue: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "800"
  },
  rowLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  rowLabelText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800"
  },
  noteBox: {
    minHeight: 78,
    marginTop: 12,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: colors.surface
  },
  noteTitle: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right"
  },
  noteInput: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 4
  },
  switchRow: {
    minHeight: 66,
    marginTop: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: colors.surface
  },
  switchTextGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  switchLabel: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right"
  },
  switchTrack: {
    width: 66,
    height: 36,
    justifyContent: "center",
    borderRadius: 18,
    paddingHorizontal: 4
  },
  switchTrackOn: {
    alignItems: "flex-end",
    backgroundColor: colors.primary
  },
  switchTrackOff: {
    alignItems: "flex-start",
    backgroundColor: "#D9D6D0"
  },
  switchThumb: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: colors.surface
  },
  switchThumbOn: {
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2
  },
  switchThumbOff: {
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  impactCard: {
    minHeight: 118,
    marginTop: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.softCoral
  },
  impactIconWrap: {
    width: 86,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.62)"
  },
  impactArrow: {
    position: "absolute",
    right: 18,
    top: 8
  },
  impactText: {
    flex: 1,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 30,
    textAlign: "right"
  },
  impactAmount: {
    color: colors.coral,
    fontWeight: "900"
  },
  submitButton: {
    minHeight: 66,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  submitText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  }
});
