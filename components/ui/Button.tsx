import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AppText } from "./AppText";
import { Touchable } from "./Touchable";
import { colors, radius, spacing } from "@/theme/tokens";
import type { HapticKind } from "@/lib/utils/haptics";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type IconName = ComponentProps<typeof Ionicons>["name"];

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  full?: boolean;
  haptic?: HapticKind;
  style?: StyleProp<ViewStyle>;
}

const BACKGROUND: Record<Variant, string> = {
  primary: colors.primary,
  secondary: colors.primarySoft,
  ghost: "transparent",
  gold: colors.gold,
  danger: colors.danger,
};

const FOREGROUND: Record<Variant, string> = {
  primary: colors.white,
  secondary: colors.primaryDark,
  ghost: colors.primary,
  gold: colors.ink,
  danger: colors.white,
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  icon,
  full = true,
  haptic,
  style,
}: Props) {
  const inactive = disabled || loading;
  const fg = FOREGROUND[variant];

  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      haptic={haptic ?? (variant === "danger" ? "warning" : "light")}
      onPress={onPress}
      style={[
        styles.base,
        full && styles.full,
        { backgroundColor: BACKGROUND[variant] },
        variant === "ghost" && styles.ghost,
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <AppText variant="label" color={fg} style={styles.label}>
            {label}
          </AppText>
        </View>
      )}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  full: { alignSelf: "stretch" },
  ghost: { paddingHorizontal: spacing.sm },
  disabled: { opacity: 0.45 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { fontSize: 15 },
});
