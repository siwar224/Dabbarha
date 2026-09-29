import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

const logoHeader = require("../../assets/images/logo-header.png");

type OnboardingScreenProps = {
  activeStep: 0 | 1 | 2;
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  buttonLabel: string;
  onNext: () => void;
  onSkip: () => void;
  featureTitle?: string;
  featureBody?: string;
};

export function OnboardingScreen({
  activeStep,
  image,
  title,
  subtitle,
  buttonLabel,
  onNext,
  onSkip,
  featureTitle,
  featureBody
}: OnboardingScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>تخطي</Text>
          </Pressable>
          <Image source={logoHeader} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.illustrationWrap}>
          <View style={[styles.softShape, styles.softShapeLeft]} />
          <View style={[styles.softShape, styles.softShapeRight]} />
          <View style={[styles.softShapeSmall, styles.softShapeSmallLeft]} />
          <View style={[styles.softShapeSmall, styles.softShapeSmallRight]} />
          <Image source={image} style={styles.illustration} resizeMode="contain" />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.dotsRow}>
          {[0, 1, 2].map((step) => (
            <View key={step} style={[styles.dot, activeStep === step && styles.activeDot]} />
          ))}
        </View>

        {featureTitle ? (
          <View style={styles.featureBlock}>
            <Text style={styles.featureTitle}>{featureTitle}</Text>
            <Text style={styles.featureBody}>{featureBody}</Text>
          </View>
        ) : (
          <View style={styles.featurePlaceholder} />
        )}

        <Pressable onPress={onNext} style={styles.nextButton}>
          <Text style={styles.nextText}>{buttonLabel}</Text>
        </Pressable>
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
  skipButton: {
    minWidth: 62,
    minHeight: 44,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  skipText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800"
  },
  logo: {
    width: 132,
    height: 70
  },
  headerSpacer: {
    width: 62
  },
  illustrationWrap: {
    height: 282,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  softShape: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: colors.lavender,
    opacity: 0.78
  },
  softShapeLeft: {
    left: -8,
    top: 48
  },
  softShapeRight: {
    right: 8,
    top: 84,
    backgroundColor: colors.softCoral
  },
  softShapeSmall: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.78
  },
  softShapeSmallLeft: {
    left: 48,
    bottom: 34,
    backgroundColor: "#F1EAFE"
  },
  softShapeSmallRight: {
    right: 58,
    bottom: 42,
    backgroundColor: "#FFF0E9"
  },
  illustration: {
    width: "92%",
    height: "94%"
  },
  copy: {
    alignItems: "center",
    minHeight: 124,
    justifyContent: "center"
  },
  title: {
    color: colors.primary,
    fontSize: 37,
    fontWeight: "900",
    lineHeight: 48,
    textAlign: "center"
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 302,
    color: colors.mutedText,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 30,
    textAlign: "center"
  },
  dotsRow: {
    minHeight: 28,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 9
  },
  dot: {
    width: 15,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9D5EA"
  },
  activeDot: {
    width: 30,
    backgroundColor: "#244ACF"
  },
  featureBlock: {
    minHeight: 116,
    alignItems: "center",
    justifyContent: "center"
  },
  featurePlaceholder: {
    flex: 1
  },
  featureTitle: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 30,
    textAlign: "center"
  },
  featureBody: {
    marginTop: 6,
    maxWidth: 270,
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 25,
    textAlign: "center"
  },
  nextButton: {
    minHeight: 56,
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
