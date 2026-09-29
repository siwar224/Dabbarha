import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

const logoHeader = require("../../assets/images/logo-header.png");

type SetupFlowScreenProps = {
  progress: 1 | 2 | 3;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onNext: () => void;
  children: ReactNode;
  secondaryButtonLabel?: string;
  onSecondary?: () => void;
};

export function SetupFlowScreen({
  progress,
  title,
  subtitle,
  buttonLabel,
  onNext,
  children,
  secondaryButtonLabel,
  onSecondary
}: SetupFlowScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="رجوع">
            <MaterialCommunityIcons name="chevron-left" color={colors.primary} size={28} />
          </Pressable>

          <Image source={logoHeader} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(progress / 3) * 100}%` }]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {children}
        </ScrollView>

        <View style={styles.footer}>
          {secondaryButtonLabel && onSecondary ? (
            <Pressable onPress={onSecondary} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>{secondaryButtonLabel}</Text>
            </Pressable>
          ) : null}

          <Pressable onPress={onNext} style={styles.nextButton}>
            <Text style={styles.nextText}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 18
  },
  header: {
    minHeight: 80,
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
  logo: {
    width: 132,
    height: 70
  },
  headerSpacer: {
    width: 48
  },
  progressTrack: {
    width: "56%",
    height: 8,
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#E6DED8"
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#8D80F4"
  },
  content: {
    flexGrow: 1,
    paddingTop: 36,
    paddingBottom: 18
  },
  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 38,
    textAlign: "center"
  },
  subtitle: {
    marginTop: 8,
    color: colors.mutedText,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 28,
    textAlign: "center"
  },
  footer: {
    gap: 10
  },
  secondaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  nextButton: {
    minHeight: 58,
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
  nextText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  }
});
