import type { ReactNode } from "react";
import { Image, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, spacing } from "@/theme/tokens";

interface Props {
  title: string;
  right?: ReactNode;
}

/** Fixed Material-style app bar used by every tab screen. */
export function AppBar({ title, right }: Props) {
  return (
    <View style={styles.bar}>
      <Image
        source={require("../../assets/brand-mark.png")}
        style={styles.mark}
      />
      <AppText
        variant="heading"
        color={colors.white}
        numberOfLines={1}
        style={styles.title}
      >
        {title}
      </AppText>
      <View style={styles.spacer} />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    zIndex: 10,
    elevation: 8,
    shadowColor: "#0B1B3A",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
  },
  title: { fontSize: 19, fontWeight: "700", letterSpacing: 0.2, flexShrink: 1 },
  spacer: { flex: 1 },
});
