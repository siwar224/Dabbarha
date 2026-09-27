import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type PlaceholderScreenProps = {
  title: string;
};

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>جاهز باش نخدموه من Figma screen by screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background
  },
  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center"
  },
  subtitle: {
    marginTop: 12,
    color: colors.mutedText,
    fontSize: 15,
    textAlign: "center"
  }
});
