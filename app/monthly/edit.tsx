import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";

export default function EditMonthlyScreen() {
  const { income, setIncome } = useSetup();
  const [salary, setSalary] = useState(String(income));
  const [copyPreviousMonth, setCopyPreviousMonth] = useState(true);

  useEffect(() => {
    setSalary(String(income));
  }, [income]);

  async function handleSave() {
    await setIncome(Number(salary) || 0);
    router.back();
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

        <View style={styles.monthPill}>
          <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={24} />
          <Text style={styles.monthText}>نوفمبر 2024</Text>
          <MaterialCommunityIcons name="chevron-right" color={colors.primary} size={24} />
        </View>

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

        <View style={styles.copyCard}>
          <Pressable
            onPress={() => setCopyPreviousMonth((value) => !value)}
            style={[
              styles.switchTrack,
              copyPreviousMonth ? styles.switchTrackOn : styles.switchTrackOff
            ]}
            accessibilityRole="switch"
            accessibilityState={{ checked: copyPreviousMonth }}
          >
            <View style={[styles.switchThumb, copyPreviousMonth ? styles.switchThumbOn : styles.switchThumbOff]} />
          </Pressable>

          <View style={styles.copyTextWrap}>
            <Text style={styles.copyTitle}>نسخ من الشهر السابق</Text>
            <Text style={styles.copySubtitle}>نسخ نفس التوزيع للمصاريف والادخار</Text>
          </View>
        </View>

        <Pressable onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveText}>حفظ التغييرات</Text>
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
  copyCard: {
    minHeight: 104,
    marginTop: 26,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 20,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    shadowColor: "#4B3B2D",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  copyTextWrap: {
    alignItems: "flex-end",
    flex: 1
  },
  copyTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right"
  },
  copySubtitle: {
    marginTop: 5,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right"
  },
  switchTrack: {
    width: 58,
    height: 34,
    justifyContent: "center",
    borderRadius: 17,
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
    width: 27,
    height: 27,
    borderRadius: 14,
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
    shadowOpacity: 0.14,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
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
