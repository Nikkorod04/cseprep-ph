import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useSettings } from "@/lib/store/settings";
import { daysUntil } from "@/lib/utils/date";
import { colors, radius, spacing } from "@/theme/tokens";

/** Compact exam countdown for the app bar. */
export function ExamCountdownChip() {
  const examDate = useSettings((s) => s.examDate);
  const days = daysUntil(examDate);

  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name="calendar-month-outline" size={12} color={colors.white} />
      <AppText variant="tiny" color={colors.white}>
        {days !== null && days > 0 ? `${days}D` : "EXAM"}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
  },
});
