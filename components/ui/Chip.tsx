import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { Touchable } from "./Touchable";
import { colors, radius, spacing } from "@/theme/tokens";

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];
}

export function Chip({ label, selected = false, onPress, icon }: Props) {
  return (
    <Touchable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      haptic="select"
      scaleTo={0.94}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={selected ? colors.primary : colors.inkSoft}
        />
      ) : null}
      <AppText
        variant="label"
        color={selected ? colors.primary : colors.inkSoft}
      >
        {label}
      </AppText>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
});
