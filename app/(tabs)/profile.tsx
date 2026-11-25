import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Switch, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { Touchable } from "@/components/ui/Touchable";
import { QUESTION_BY_ID, topicName } from "@/lib/content";
import type { Question, Track } from "@/lib/content/types";
import { TRACK_LABEL } from "@/lib/content/types";
import { getMissedQuestionIds, resetProgress } from "@/lib/db";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { disableDailyReminder, enableDailyReminder } from "@/lib/notifications";
import { formatStudyTime } from "@/lib/quiz/engine";
import { useSettings } from "@/lib/store/settings";
import { colors, radius, spacing } from "@/theme/tokens";
import { formatDate } from "@/lib/utils/date";

const GOALS = [10, 20, 30];

export default function ProfileScreen() {
  const { overview, streak, accuracy, mocks, refresh } = useDashboard();
  const {
    track,
    dailyGoal,
    examDate,
    remindersEnabled,
    setTrack,
    setDailyGoal,
    setReminders,
  } = useSettings();

  const [missed, setMissed] = useState<Question[]>([]);

  useFocusEffect(
    useCallback(() => {
      const ids = getMissedQuestionIds(5);
      setMissed(
        ids
          .map((id) => QUESTION_BY_ID.get(id))
          .filter((q): q is Question => Boolean(q)),
      );
    }, []),
  );

  const bestMock = mocks.reduce((max, m) => Math.max(max, m.rating), 0);

  async function toggleReminders(value: boolean) {
    if (!value) {
      setReminders(false);
      await disableDailyReminder();
      return;
    }
    const ok = await enableDailyReminder(19);
    setReminders(ok);
    if (!ok) {
      Alert.alert(
        "Reminders unavailable",
        "Local notifications may be blocked in Expo Go. They work in a development build.",
      );
    }
  }

  function confirmReset() {
    Alert.alert(
      "Reset progress?",
      "This deletes every attempt, mock result, and streak on this device. Your settings stay.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetProgress();
            setMissed([]);
            refresh();
          },
        },
      ],
    );
  }

  return (
    <Screen appBar="Profile" banner={false}>

      <View style={styles.statsGrid}>
        <StatCard label="Items answered" value={String(overview.total)} icon="checkmark-done-outline" />
        <StatCard label="Accuracy" value={`${Math.round(accuracy)}%`} icon="analytics-outline" />
        <StatCard label="Day streak" value={String(streak)} icon="flame-outline" />
        <StatCard label="Study time" value={formatStudyTime(overview.ms)} icon="time-outline" />
      </View>

      <Card style={{ gap: spacing.sm }}>
        <View style={styles.rowBetween}>
          <AppText variant="heading">Best mock</AppText>
          <AppText variant="label" color={colors.primary}>
            {bestMock > 0 ? `${Math.round(bestMock)}%` : "—"}
          </AppText>
        </View>
        <AppText variant="small" color={colors.muted}>
          {bestMock >= 80
            ? "You are at passing level on a full run."
            : "Passing starts at 80%. Run a full mock to check."}
        </AppText>
      </Card>

      <AppText variant="heading" style={styles.sectionTitle}>
        Settings
      </AppText>

      <Card style={{ gap: spacing.md }}>
        <AppText variant="label" color={colors.inkSoft}>
          Exam track
        </AppText>
        <View style={styles.chipWrap}>
          {(["professional", "subprofessional"] as Track[]).map((t) => (
            <Chip
              key={t}
              label={TRACK_LABEL[t]}
              selected={track === t}
              onPress={() => setTrack(t)}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <AppText variant="label" color={colors.inkSoft}>
          Daily goal
        </AppText>
        <View style={styles.chipWrap}>
          {GOALS.map((goal) => (
            <Chip
              key={goal}
              label={`${goal} items`}
              selected={dailyGoal === goal}
              onPress={() => setDailyGoal(goal)}
            />
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <AppText variant="label">Daily reminder</AppText>
            <AppText variant="tiny" color={colors.muted}>
              7:00 PM · skips if you already hit your goal
            </AppText>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={(value) => void toggleReminders(value)}
            trackColor={{ true: colors.primary, false: colors.line }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <AppText variant="label">Exam date</AppText>
          <AppText variant="small" color={colors.inkSoft}>
            {formatDate(examDate)}
          </AppText>
        </View>
      </Card>

      <AppText variant="heading" style={styles.sectionTitle}>
        Error log
      </AppText>

      {missed.length === 0 ? (
        <Card>
          <AppText variant="small" color={colors.muted}>
            No mistakes logged yet. Wrong answers collect here automatically so
            you can retry them.
          </AppText>
        </Card>
      ) : (
        missed.map((question) => (
          <Card key={question.id} style={{ gap: spacing.xs }}>
            <AppText variant="tiny" color={colors.muted}>
              {question.section.replace("-", " ").toUpperCase()} ·{" "}
              {topicName(question.section, question.topic).toUpperCase()}
            </AppText>
            <AppText variant="small" numberOfLines={3}>
              {question.stem}
            </AppText>
            <AppText variant="tiny" color={colors.success}>
              ANSWER: {question.answer} · {question.explanation}
            </AppText>
          </Card>
        ))
      )}

      <AppText variant="heading" style={styles.sectionTitle}>
        About
      </AppText>

      <Card style={{ gap: spacing.sm }}>
        <AppText variant="label">CSE Prep PH · v1.0.0</AppText>
        <AppText variant="small" color={colors.muted}>
          An independent reviewer. Not affiliated with, endorsed by, or
          connected to the Civil Service Commission. All practice items are
          original.
        </AppText>
        <AppText variant="tiny" color={colors.muted}>
          {mocks.length} mock attempts · {overview.total} total items
        </AppText>
      </Card>

      <Touchable
        onPress={confirmReset}
        haptic="warning"
        scaleTo={0.99}
        style={styles.resetRow}
      >
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
        <AppText variant="label" color={colors.danger}>
          Reset progress
        </AppText>
      </Touchable>
    </Screen>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="tiny" color={colors.muted}>
        {label.toUpperCase()}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: "48.2%",
    gap: spacing.xs,
    padding: spacing.md,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  resetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
});
