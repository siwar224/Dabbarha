import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

const logo = require("../assets/images/logo.png");

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.logoWrap}>
          <View style={styles.softCircleLarge} />
          <View style={styles.softCircleSmall} />
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.loaderBlock}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28
  },
  logoWrap: {
    width: 270,
    height: 270,
    alignItems: "center",
    justifyContent: "center"
  },
  softCircleLarge: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: colors.lavender,
    opacity: 0.58
  },
  softCircleSmall: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.softCoral,
    opacity: 0.74
  },
  logo: {
    width: 210,
    height: 210
  },
  loaderBlock: {
    position: "absolute",
    right: 0,
    left: 0,
    bottom: 82,
    alignItems: "center"
  },
  loadingText: {
    marginTop: 14,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center"
  }
});
