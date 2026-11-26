import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, StyleSheet, Switch, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { Touchable } from "@/components/ui/Touchable";
import { QUESTION_BY_ID, topicName } from "@/lib/content";
import type { Question, Track } from "@/lib/content/types";
import { TRACK_LABEL } from "@/lib/content/types";
import { sendReportEmail } from "@/lib/reportEmail";
import {
  clearReports,
  getMissedQuestionIds,
  getReports,
  resetProgress,
  type ReportRow,
} from "@/lib/db";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { disableDailyReminder, enableDailyReminder } from "@/lib/notifications";
import { formatStudyTime } from "@/lib/quiz/engine";
import { useSettings } from "@/lib/store/settings";
import { colors, radius, spacing } from "@/theme/tokens";
import { formatDate } from "@/lib/utils/date";

const GOALS = [10, 20, 30];

export default function ProfileScreen() {
  const router = useRouter();
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
  const [reports, setReports] = useState<ReportRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      const ids = getMissedQuestionIds(5);
      setMissed(
        ids
          .map((id) => QUESTION_BY_ID.get(id))
          .filter((q): q is Question => Boolean(q)),
      );
      setReports(getReports(20));
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

  async function emailReports() {
    if (reports.length === 0) return;
    const ok = await sendReportEmail(reports);
    if (!ok) {
      Alert.alert(
        "No mail app found",
        "Set up a mail app on this device, then try again.",
      );
    }
  }

  function confirmClearReports() {
    Alert.alert(
      "Clear reports?",
      "This removes the saved reports from this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearReports();
            setReports([]);
          },
        },
      ],
    );
  }

  return (
    <Screen appBar="Profile" banner={false}>

      <View style={styles.statsGrid}>
        <StatCard label="Items answered" value={String(overview.total)} icon="check-all" />
        <StatCard label="Accuracy" value={`${Math.round(accuracy)}%`} icon="chart-line" />
        <StatCard label="Day streak" value={String(streak)} icon="fire" />
        <StatCard label="Study time" value={formatStudyTime(overview.ms)} icon="clock-outline" />
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
        Content reports
      </AppText>

      <Card style={{ gap: spacing.sm }}>
        <View style={styles.rowBetween}>
          <AppText variant="label">Reported items</AppText>
          <AppText variant="label" color={colors.primary}>
            {reports.length}
          </AppText>
        </View>

        {reports.length === 0 ? (
          <AppText variant="small" color={colors.muted}>
            Tap the flag on any quiz item to report a wrong key or typo.
          </AppText>
        ) : (
          <>
            {reports.slice(0, 3).map((report) => {
              const question = QUESTION_BY_ID.get(report.question_id);
              return (
                <View key={report.id} style={{ gap: 2 }}>
                  <AppText variant="small">{report.reason}</AppText>
                  <AppText variant="tiny" color={colors.muted}>
                    {question
                      ? `${question.section.toUpperCase()} · ${topicName(
                          question.section,
                          question.topic,
                        )}`
                      : report.question_id}
                    {" · "}
                    {new Date(report.created_at).toLocaleDateString()}
                  </AppText>
                </View>
              );
            })}

            <Button
              label="Email report"
              variant="secondary"
              onPress={() => void emailReports()}
            />
            <AppText variant="tiny" color={colors.muted}>
              Nothing is sent until you tap Send in your mail app.
            </AppText>

            <Touchable
              onPress={confirmClearReports}
              haptic="warning"
              scaleTo={0.99}
              style={styles.clearRow}
            >
              <AppText variant="tiny" color={colors.danger}>
                CLEAR REPORTS
              </AppText>
            </Touchable>
          </>
        )}
      </Card>

      <AppText variant="heading" style={styles.sectionTitle}>
        About
      </AppText>

      <Card style={{ gap: spacing.sm }}>
        <View style={styles.aboutRow}>
          <Image
            source={require("../../assets/brand-mark.png")}
            style={styles.aboutMark}
          />
          <AppText variant="label">CSE Prep PH · v1.0.0</AppText>
        </View>
        <AppText variant="small" color={colors.muted}>
          An independent reviewer. Not affiliated with, endorsed by, or
          connected to the Civil Service Commission. All practice items are
          original.
        </AppText>
        <View style={styles.divider} />
        <Touchable
          onPress={() => router.push("/legal")}
          haptic="light"
          scaleTo={0.99}
          style={styles.legalRow}
          accessibilityLabel="Privacy and legal"
        >
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={18}
            color={colors.primary}
          />
          <AppText variant="label" color={colors.primary}>
            Privacy & legal
          </AppText>
          <View style={{ flex: 1 }} />
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={colors.muted}
          />
        </Touchable>
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
        <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
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
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statIcon}>
        <MaterialCommunityIcons name={icon} size={16} color={colors.primary} />
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
  legalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  resetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  clearRow: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  aboutMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
});
