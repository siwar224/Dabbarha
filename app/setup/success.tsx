import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

const successCheck = require("../../assets/images/setup-success-check.png");
const successWallet = require("../../assets/images/setup-success-wallet.png");

export default function SetupSuccessScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.confettiLayer}>
          <View style={[styles.confetti, styles.confettiBlue]} />
          <View style={[styles.confetti, styles.confettiGreen]} />
          <View style={[styles.confetti, styles.confettiCoral]} />
          <View style={[styles.confetti, styles.confettiGold]} />
          <View style={[styles.confetti, styles.confettiPurple]} />
        </View>

        <Image source={successCheck} style={styles.checkImage} resizeMode="contain" />

        <View style={styles.copy}>
          <Text style={styles.title}>تم الإعداد بنجاح!</Text>
          <Text style={styles.subtitle}>
            توا تنجم تبدأ تستعمل دبّرها وتعدّي في مصاريفك وأهدافك
          </Text>
        </View>

        <View style={styles.walletWrap}>
          <View style={[styles.softShape, styles.softShapeLeft]} />
          <View style={[styles.softShape, styles.softShapeRight]} />
          <Image source={successWallet} style={styles.walletImage} resizeMode="contain" />
        </View>

        <Pressable onPress={() => router.replace("/(tabs)")} style={styles.primaryButton}>
          <Text style={styles.primaryText}>الذهاب إلى الرئيسية</Text>
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
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 18
  },
  confettiLayer: {
    position: "absolute",
    top: 72,
    right: 28,
    left: 28,
    height: 150
  },
  confetti: {
    position: "absolute",
    width: 9,
    height: 26,
    borderRadius: 5
  },
  confettiBlue: {
    left: 20,
    top: 60,
    backgroundColor: "#8B7CF6",
    transform: [{ rotate: "48deg" }]
  },
  confettiGreen: {
    left: 76,
    top: 10,
    backgroundColor: "#49C89A",
    transform: [{ rotate: "-22deg" }]
  },
  confettiCoral: {
    right: 64,
    top: 14,
    backgroundColor: colors.coral,
    transform: [{ rotate: "24deg" }]
  },
  confettiGold: {
    right: 116,
    top: 0,
    backgroundColor: colors.gold,
    transform: [{ rotate: "44deg" }]
  },
  confettiPurple: {
    right: 12,
    top: 86,
    backgroundColor: "#8B7CF6",
    transform: [{ rotate: "-36deg" }]
  },
  checkImage: {
    alignSelf: "center",
    width: 164,
    height: 164,
    marginTop: 10
  },
  copy: {
    alignItems: "center",
    marginTop: 6
  },
  title: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 40,
    textAlign: "center"
  },
  subtitle: {
    marginTop: 8,
    maxWidth: 286,
    color: colors.mutedText,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 28,
    textAlign: "center"
  },
  walletWrap: {
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    overflow: "hidden"
  },
  softShape: {
    position: "absolute",
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: colors.softCoral,
    opacity: 0.75
  },
  softShapeLeft: {
    left: 28,
    top: 34
  },
  softShapeRight: {
    right: 18,
    top: 50
  },
  walletImage: {
    width: "104%",
    height: "100%"
  },
  primaryButton: {
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
  primaryText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  }
});
