import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExamCountdownChip } from "@/components/ui/ExamCountdownChip";
import { Screen } from "@/components/ui/Screen";
import { questionsFor, SECTION_BY_ID } from "@/lib/content";
import { TRACK_LABEL } from "@/lib/content/types";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { BLUEPRINT, mockSeconds } from "@/lib/quiz/engine";
import { startDiagnostic, startMock } from "@/lib/quiz/start";
import { useSettings } from "@/lib/store/settings";
import { colors, radius, spacing } from "@/theme/tokens";
import { relativeTime } from "@/lib/utils/date";

export default function MockScreen() {
  const track = useSettings((s) => s.track);
  const { mocks } = useDashboard();

  const plan = BLUEPRINT[track].map((row) => ({
    ...row,
    available: Math.min(
      row.count,
      questionsFor(track, { section: row.section }).length,
    ),
  }));
  const total = plan.reduce((sum, row) => sum + row.available, 0);
  const minutes = Math.round(mockSeconds(track, total) / 60);
  const best = mocks.reduce((max, m) => Math.max(max, m.rating), 0);

  return (
    <Screen
      appBar="Mock exam"
      appBarRight={<ExamCountdownChip />}
      banner={false}
    >
      <Card style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons name="timer" size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="heading">Full simulation</AppText>
            <AppText variant="small" color={colors.muted}>
              {TRACK_LABEL[track]} · {total} items · {minutes} min · target{" "}
              {Math.ceil(total * 0.8)} correct
            </AppText>
          </View>
        </View>

        <View style={styles.planList}>
          {plan.map((row) => (
            <View key={row.section} style={styles.planRow}>
              <AppText variant="small" color={colors.inkSoft}>
                {SECTION_BY_ID.get(row.section)?.short ?? row.section}
              </AppText>
              <AppText variant="label">
                {row.available}/{row.count}
              </AppText>
            </View>
          ))}
        </View>

        <Button
          label={`Start mock · ${minutes} min`}
          icon="play"
          onPress={() => startMock()}
          disabled={total === 0}
        />
        <AppText variant="tiny" color={colors.muted} style={{ textAlign: "center" }}>
          Auto-submits when the timer ends. Leave nothing blank.
        </AppText>
      </Card>

      <Card style={styles.diag}>
        <View style={{ flex: 1 }}>
          <AppText variant="label">Not ready for a full mock?</AppText>
          <AppText variant="small" color={colors.muted}>
            Take a 10-item diagnostic to set your baseline.
          </AppText>
        </View>
        <Button
          label="Start"
          variant="secondary"
          full={false}
          onPress={() => startDiagnostic()}
        />
      </Card>

      <View style={styles.sectionHead}>
        <AppText variant="heading">Past mocks</AppText>
        {mocks.length > 0 ? (
          <AppText variant="tiny" color={colors.muted}>
            BEST {Math.round(best)}%
          </AppText>
        ) : null}
      </View>

      {mocks.length === 0 ? (
        <Card>
          <AppText variant="small" color={colors.muted}>
            No mocks yet. Your first score becomes your baseline.
          </AppText>
        </Card>
      ) : (
        mocks.map((mock) => (
          <Card key={mock.id} style={styles.resultRow}>
            <View
              style={[
                styles.resultRating,
                {
                  backgroundColor: mock.passed
                    ? colors.successSoft
                    : colors.dangerSoft,
                },
              ]}
            >
              <AppText
                variant="label"
                color={mock.passed ? colors.success : colors.danger}
              >
                {Math.round(mock.rating)}%
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label">
                {mock.passed ? "Passed" : "Below 80%"}
              </AppText>
              <AppText variant="tiny" color={colors.muted}>
                {relativeTime(mock.finished_at)}
              </AppText>
            </View>
            <Ionicons
              name={mock.passed ? "checkmark-circle" : "alert-circle"}
              size={20}
              color={mock.passed ? colors.success : colors.gold}
            />
          </Card>
        ))
      )}

      <Card style={styles.note}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <AppText variant="small" color={colors.inkSoft} style={{ flex: 1 }}>
          CSC does not publish exact per-subtest counts. Item allocations here
          follow the working blueprint; the real exam is 170 items in 190
          minutes for Professional and 165 in 160 for Subprofessional.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: spacing.md, marginBottom: spacing.md },
  heroTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  planList: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  diag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
  },
  resultRating: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  note: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderColor: "#C9D6FA",
  },
});
