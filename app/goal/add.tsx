import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSetup } from "@/context/SetupContext";
import { colors } from "@/theme/colors";

const fallbackGoalImage = require("../../assets/images/phone-goal.png");

export default function AddGoalScreen() {
  const { addGoal } = useSetup();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("0");
  const [targetDate, setTargetDate] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Il faut autoriser l'accès aux photos pour ajouter une image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri);
    }
  }

  async function handleAddGoal() {
    const goalId = await addGoal({
      title: title.trim() || "هدف جديد",
      targetAmount: Number(targetAmount) || 0,
      savedAmount: Number(savedAmount) || 0,
      targetDate: targetDate.trim() || undefined,
      imageUri
    });

    router.replace({ pathname: "/goal/[id]", params: { id: goalId } });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton} accessibilityLabel="إغلاق">
            <MaterialCommunityIcons name="close" color={colors.primary} size={27} />
          </Pressable>
          <Text style={styles.title}>هدف جديد</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Pressable onPress={pickImage} style={styles.imageHero}>
          <View style={[styles.softShape, styles.softShapeLeft]} />
          <View style={[styles.softShape, styles.softShapeRight]} />
          <Image source={imageUri ? { uri: imageUri } : fallbackGoalImage} style={styles.goalImage} resizeMode="contain" />
          <View style={styles.imageBadge}>
            <MaterialCommunityIcons name="image-plus" color={colors.surface} size={21} />
            <Text style={styles.imageBadgeText}>اختار صورة</Text>
          </View>
        </Pressable>

        <View style={styles.form}>
          <InputField
            label="اسم الهدف"
            value={title}
            onChangeText={setTitle}
            placeholder="مثال: سفر، تروفين..."
          />
          <InputField
            label="المبلغ المطلوب (د)"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
            placeholder="0"
          />
          <InputField
            label="المبلغ إلي عندك توا (د)"
            value={savedAmount}
            onChangeText={setSavedAmount}
            keyboardType="numeric"
            placeholder="0"
          />

          <View style={styles.dateField}>
            <MaterialCommunityIcons name="calendar-month-outline" color={colors.primary} size={23} />
            <TextInput
              value={targetDate}
              onChangeText={setTargetDate}
              style={styles.dateInput}
              textAlign="right"
              placeholder="اختر التاريخ"
              placeholderTextColor={colors.mutedText}
            />
            <Text style={styles.fieldLabel}>التاريخ المستهدف (اختياري)</Text>
          </View>
        </View>

        <Pressable onPress={handleAddGoal} style={styles.submitButton}>
          <Text style={styles.submitText}>إضافة الهدف</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default"
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
        textAlign="right"
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
      />
    </View>
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
    paddingBottom: 18
  },
  header: {
    minHeight: 66,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  headerSpacer: {
    width: 44
  },
  title: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center"
  },
  imageHero: {
    height: 174,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  softShape: {
    position: "absolute",
    width: 148,
    height: 86,
    borderRadius: 48,
    opacity: 0.68
  },
  softShapeLeft: {
    left: 18,
    bottom: 28,
    backgroundColor: colors.softCoral,
    transform: [{ rotate: "-12deg" }]
  },
  softShapeRight: {
    right: 22,
    bottom: 20,
    backgroundColor: colors.lavender,
    transform: [{ rotate: "16deg" }]
  },
  goalImage: {
    width: 174,
    height: 150
  },
  imageBadge: {
    position: "absolute",
    right: 18,
    bottom: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.primary
  },
  imageBadgeText: {
    color: colors.surface,
    fontSize: 13,
    fontWeight: "900"
  },
  form: {
    gap: 10,
    marginTop: 6
  },
  field: {
    minHeight: 62,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right"
  },
  input: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    padding: 0
  },
  dateField: {
    minHeight: 62,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface
  },
  dateInput: {
    flex: 1,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
    padding: 0
  },
  submitButton: {
    minHeight: 58,
    marginTop: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
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
