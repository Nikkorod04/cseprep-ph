import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Touchable } from "@/components/ui/Touchable";
import { colors, radius, spacing } from "@/theme/tokens";

const REASONS = [
  "Wrong answer key",
  "Unclear or ambiguous",
  "Typo or formatting",
  "Duplicate item",
  "Other",
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  alreadyReported?: boolean;
}

export function ReportSheet({
  visible,
  onClose,
  onSubmit,
  alreadyReported = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (visible) setSelected(null);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={styles.handle} />
          <AppText variant="heading">Report this item</AppText>
          <AppText variant="small" color={colors.muted}>
            {alreadyReported
              ? "You already reported this item. You can add another reason."
              : "What is wrong with it?"}
          </AppText>

          <View style={styles.options}>
            {REASONS.map((reason) => {
              const active = selected === reason;
              return (
                <Touchable
                  key={reason}
                  onPress={() => setSelected(reason)}
                  haptic="select"
                  scaleTo={0.99}
                  style={[styles.option, active && styles.optionActive]}
                >
                  <MaterialCommunityIcons
                    name={active ? "radiobox-marked" : "radiobox-blank"}
                    size={18}
                    color={active ? colors.primary : colors.muted}
                  />
                  <AppText variant="small" style={{ flex: 1 }}>
                    {reason}
                  </AppText>
                </Touchable>
              );
            })}
          </View>

          <Button
            label="Submit report"
            disabled={!selected}
            onPress={() => {
              if (!selected) return;
              onSubmit(selected);
              onClose();
            }}
          />
          <Button label="Cancel" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginBottom: spacing.sm,
  },
  options: { gap: spacing.xs, marginVertical: spacing.xs },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
});
