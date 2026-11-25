import { Ionicons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { RewardedBonus } from "@/components/ads/RewardedBonus";
import { AppText } from "@/components/ui/AppText";
import { Bar } from "@/components/ui/Bar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Screen } from "@/components/ui/Screen";
import { maybeShowInterstitial } from "@/lib/ads/interstitial";
import { topicName } from "@/lib/content";
import type { SectionId } from "@/lib/content/types";
import {
  formatClock,
  passTarget,
  ratingMessage,
  scoreSession,
} from "@/lib/quiz/engine";
import { startPractice, startStudy } from "@/lib/quiz/start";
import { useSession } from "@/lib/store/session";
import { colors, radius, spacing } from "@/theme/tokens";

export default function ResultsScreen() {
  const router = useRouter();
  const config = useSession((s) => s.config);
  const items = useSession((s) => s.items);
  const answers = useSession((s) => s.answers);
  const startedAt = useSession((s) => s.startedAt);
  const finishedAt = useSession((s) => s.finishedAt);
  const interstitialShown = useRef(false);

  useEffect(() => {
    if (!config || config.mode !== "mock" || interstitialShown.current) {
      return;
    }
    interstitialShown.current = true;
    const timer = setTimeout(() => {
      void maybeShowInterstitial();
    }, 900);
    return () => clearTimeout(timer);
  }, [config]);

  if (!config) return <Redirect href="/home" />;

  const summary = scoreSession(items, answers);
  const wallSeconds =
    startedAt && finishedAt
      ? Math.round((finishedAt - startedAt) / 1000)
      : 0;
  // Mock clocks pause when saved, so sum the active answer time instead.
  const elapsed = Math.max(
    1,
    config.mode === "mock" ? Math.round(summary.ms / 1000) : wallSeconds,
  );

  const weakest = [...summary.byTopic]
    .filter((row) => row.correct < row.total)
    .sort(
      (a, b) => a.correct / a.total - b.correct / b.total,
    )
    .slice(0, 4);

  const wrong = items
    .filter((q) => answers[q.id] && !answers[q.id]?.correct)
    .slice(0, 4);

  function drillWeakest() {
    const top = weakest[0];
    if (!top) return;
    const [section, topic] = top.key.split(":") as [SectionId, string];
    startPractice({ section, topic, count: 10, replace: true });
  }

  function studyWeakest() {
    const top = weakest[0];
    if (!top) return;
    const [section, topic] = top.key.split(":") as [SectionId, string];
    startStudy({ section, topic, title: topicName(section, topic) });
  }

  function startBonus() {
    const top = weakest[0];
    if (top) {
      const [section, topic] = top.key.split(":") as [SectionId, string];
      startPractice({
        section,
        topic,
        count: 10,
        title: "Bonus set",
        replace: true,
      });
      return;
    }
    startPractice({ count: 10, title: "Bonus set", replace: true });
  }

  function goHome() {
    useSession.getState().reset();
    router.replace("/home");
  }

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="tiny" color={colors.muted}>
          {config.mode === "mock" ? "MOCK EXAM COMPLETE" : "SESSION COMPLETE"}
        </AppText>
        <AppText variant="title">{config.title}</AppText>
      </View>

      <Card style={styles.scoreCard}>
        <ProgressRing
          progress={summary.rating / 100}
          size={148}
          stroke={13}
          color={summary.passed ? colors.success : colors.primary}
        >
          <AppText variant="display" style={{ fontSize: 34 }}>
            {Math.round(summary.rating)}%
          </AppText>
          <AppText variant="tiny" color={colors.muted}>
            {summary.correct} OF {summary.total}
          </AppText>
        </ProgressRing>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: summary.passed
                ? colors.successSoft
                : colors.goldSoft,
            },
          ]}
        >
          <Ionicons
            name={summary.passed ? "checkmark-circle" : "trending-up"}
            size={16}
            color={summary.passed ? colors.success : "#8A5A00"}
          />
          <AppText
            variant="label"
            color={summary.passed ? colors.success : "#8A5A00"}
          >
            {summary.passed ? "Passing level" : "Below 80%"}
          </AppText>
        </View>

        <AppText variant="body" color={colors.inkSoft} style={{ textAlign: "center" }}>
          {ratingMessage(summary.rating)}
        </AppText>

        <View style={styles.statRow}>
          <Stat label="Time" value={formatClock(elapsed)} />
          <Stat label="Answered" value={`${summary.answered}/${summary.total}`} />
          <Stat label="Target" value={`${passTarget(summary.total)}`} />
        </View>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <AppText variant="heading">By section</AppText>
        {summary.bySection.map((row) => (
          <View key={row.key} style={{ gap: spacing.xs }}>
            <View style={styles.rowBetween}>
              <AppText variant="label">{row.label}</AppText>
              <AppText variant="small" color={colors.muted}>
                {row.correct}/{row.total}
              </AppText>
            </View>
            <Bar
              progress={row.total ? row.correct / row.total : 0}
              color={
                row.correct / Math.max(1, row.total) >= 0.8
                  ? colors.success
                  : colors.primary
              }
              height={6}
            />
          </View>
        ))}
      </Card>

      {wrong.length > 0 ? (
        <Card style={{ gap: spacing.md }}>
          <View style={styles.rowBetween}>
            <AppText variant="heading">Review mistakes</AppText>
            <AppText variant="tiny" color={colors.muted}>
              TOP {wrong.length}
            </AppText>
          </View>
          {wrong.map((question) => {
            const record = answers[question.id];
            return (
              <View key={question.id} style={styles.wrongItem}>
                <AppText variant="tiny" color={colors.muted}>
                  {topicName(question.section, question.topic).toUpperCase()}
                </AppText>
                <AppText variant="small" numberOfLines={3}>
                  {question.stem}
                </AppText>
                <AppText variant="tiny" color={colors.danger}>
                  YOU: {record?.selected ?? "—"} · CORRECT: {question.answer}
                </AppText>
                <AppText variant="tiny" color={colors.inkSoft}>
                  {question.explanation}
                </AppText>
              </View>
            );
          })}
        </Card>
      ) : null}

      {weakest.length > 0 ? (
        <Card style={{ gap: spacing.sm }}>
          <AppText variant="heading">Next best move</AppText>
          <AppText variant="small" color={colors.muted}>
            Your weakest area here is {topicName(
              weakest[0]!.key.split(":")[0] as SectionId,
              weakest[0]!.key.split(":")[1]!,
            )}
            .
          </AppText>
          <View style={styles.actionRow}>
            <Button
              label="Drill 10"
              icon="flash"
              full={false}
              style={{ flex: 1 }}
              onPress={drillWeakest}
            />
            <Button
              label="Study topic"
              variant="secondary"
              icon="book-outline"
              full={false}
              style={{ flex: 1 }}
              onPress={studyWeakest}
            />
          </View>
        </Card>
      ) : null}

      <RewardedBonus onReward={startBonus} />

      <Button
        label="Back to home"
        variant="secondary"
        onPress={goHome}
        style={{ marginTop: spacing.sm }}
      />
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="tiny" color={colors.muted}>
        {label.toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.md, gap: 2 },
  scoreCard: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  statRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  stat: { alignItems: "center", gap: 2 },
  actionRow: { flexDirection: "row", gap: spacing.sm },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wrongItem: {
    gap: 3,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
