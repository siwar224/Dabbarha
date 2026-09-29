import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { addMonths, formatMonthYear } from "@/utils/month";

const weekdayLabels = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];

export function DatePickerModal({
  visible,
  value,
  onChange,
  onClose
}: {
  visible: boolean;
  value: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}) {
  const month = new Date(value.getFullYear(), value.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOffset = (month.getDay() + 1) % 7;
  const days = Array.from({ length: firstDayOffset + daysInMonth }, (_, index) =>
    index < firstDayOffset ? null : index - firstDayOffset + 1
  );

  function selectDay(day: number) {
    onChange(new Date(month.getFullYear(), month.getMonth(), day, 12));
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel="إغلاق">
              <MaterialCommunityIcons name="close" color={colors.primary} size={22} />
            </Pressable>
            <Text style={styles.title}>اختار التاريخ</Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.monthHeader}>
            <Pressable onPress={() => onChange(addMonths(month, -1))} style={styles.arrowButton} accessibilityLabel="الشهر السابق">
              <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={26} />
            </Pressable>
            <Text style={styles.monthTitle}>{formatMonthYear(month)}</Text>
            <Pressable onPress={() => onChange(addMonths(month, 1))} style={styles.arrowButton} accessibilityLabel="الشهر التالي">
              <MaterialCommunityIcons name="chevron-right" color={colors.primary} size={26} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {weekdayLabels.map((label) => (
              <Text key={label} style={styles.weekdayLabel}>{label}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => (
              <View key={`${month.toISOString()}-${index}`} style={styles.daySlot}>
                {day ? (
                  <Pressable
                    onPress={() => selectDay(day)}
                    style={[styles.dayButton, day === value.getDate() && month.getMonth() === value.getMonth() && month.getFullYear() === value.getFullYear() ? styles.selectedDay : undefined]}
                  >
                    <Text style={[styles.dayText, day === value.getDate() && month.getMonth() === value.getMonth() && month.getFullYear() === value.getFullYear() ? styles.selectedDayText : undefined]}>
                      {day}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>

          <Pressable onPress={onClose} style={styles.doneButton}>
            <Text style={styles.doneText}>تم</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(28,41,87,0.28)"
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.background,
    shadowColor: "#1C2957",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center"
  },
  monthHeader: {
    marginTop: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 6,
    backgroundColor: colors.surface
  },
  arrowButton: {
    width: 42,
    height: 46,
    alignItems: "center",
    justifyContent: "center"
  },
  monthTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  },
  weekdayRow: {
    marginTop: 16,
    flexDirection: "row-reverse",
    justifyContent: "space-around"
  },
  weekdayLabel: {
    width: 38,
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  daysGrid: {
    marginTop: 8,
    flexDirection: "row-reverse",
    flexWrap: "wrap"
  },
  daySlot: {
    width: "14.2857%",
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  dayButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18
  },
  dayText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center"
  },
  selectedDay: {
    backgroundColor: colors.primary
  },
  selectedDayText: {
    color: colors.surface
  },
  doneButton: {
    minHeight: 48,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primary
  },
  doneText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  }
});
