import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ReportSheet } from "@/components/ReportSheet";
import { Touchable } from "@/components/ui/Touchable";
import { SECTION_BY_ID, topicName } from "@/lib/content";
import type { Choice, ChoiceKey } from "@/lib/content/types";
import { saveDailyResult } from "@/lib/daily";
import {
  addReport,
  isBookmarked,
  isReported,
  saveSession,
  toggleBookmark,
} from "@/lib/db";
import { formatClock, scoreSession } from "@/lib/quiz/engine";
import { saveCurrentSession, useSession } from "@/lib/store/session";
import { tapFeedback } from "@/lib/utils/haptics";
import { colors, radius, spacing } from "@/theme/tokens";

type ChoiceState = "idle" | "selected" | "correct" | "wrong" | "dim";

export default function SessionScreen() {
  const router = useRouter();
  const config = useSession((s) => s.config);
  const items = useSession((s) => s.items);
  const index = useSession((s) => s.index);
  const startedAt = useSession((s) => s.startedAt);

  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reported, setReported] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const itemStart = useRef(Date.now());
  const finishRef = useRef(false);
  const stateRef = useRef<{ selected: ChoiceKey | null }>({ selected: null });
  const bookmarkScale = useRef(new Animated.Value(1)).current;

  stateRef.current = { selected };

  const current = items[index];
  const isStudy = config?.mode === "study";
  const isMock = config?.mode === "mock";
  const timed = Boolean(config?.endsAt);
  const remaining = config?.endsAt
    ? Math.max(0, Math.round((config.endsAt - now) / 1000))
    : 0;

  useEffect(() => {
    const question = items[index];
    const saved = question
      ? useSession.getState().answers[question.id]
      : undefined;
    const mode = useSession.getState().config?.mode;

    setSelected(saved?.selected ?? null);
    // Mock answers stay hidden; practice answers come back revealed.
    setRevealed(
      Boolean(saved?.selected) && mode !== "mock" && mode !== "study",
    );
    itemStart.current = Date.now();
  }, [index]);

  useEffect(() => {
    if (!current) return;
    setBookmarked(isBookmarked(current.id));
    setReported(isReported(current.id));
  }, [current?.id]);

  useEffect(() => {
    if (!config?.endsAt) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [config?.endsAt]);

  const complete = useCallback(() => {
    if (finishRef.current) return;

    const cfg = useSession.getState().config;
    const list = useSession.getState().items;
    if (!cfg || list.length === 0 || cfg.mode === "study") return;

    const map = { ...useSession.getState().answers };
    const idx = useSession.getState().index;
    const item = list[idx];
    const pending = stateRef.current.selected;

    if (cfg.mode === "mock" && item && pending) {
      map[item.id] = {
        questionId: item.id,
        selected: pending,
        correct: pending === item.answer,
        ms: Date.now() - itemStart.current,
      };
    }

    finishRef.current = true;
    const finishedAt = Date.now();
    const summary = scoreSession(list, map);

    const attempts = list
      .filter((q) => map[q.id]?.selected)
      .map((q) => {
        const record = map[q.id]!;
        return {
          questionId: q.id,
          section: q.section,
          topic: q.topic,
          difficulty: q.difficulty,
          selected: record.selected,
          correct: record.correct,
          ms: record.ms,
        };
      });

    saveSession({
      id: cfg.id,
      mode: cfg.mode,
      track: cfg.track,
      section: cfg.section,
      topic: cfg.topic,
      startedAt,
      finishedAt,
      total: list.length,
      correct: summary.correct,
      durationMs: summary.ms,
      answers: attempts,
      mock:
        cfg.mode === "mock"
          ? {
              rating: summary.rating,
              passed: summary.passed,
              breakdown: JSON.stringify(summary.bySection),
            }
          : undefined,
    });

    if (cfg.mode === "daily" && cfg.daily) {
      void saveDailyResult({
        date: cfg.daily,
        correct: summary.correct,
        total: list.length,
        rating: summary.rating,
        completedAt: finishedAt,
      });
    }

    useSession.setState({ answers: map });
    useSession.getState().finish();
    router.replace("/session/results");
  }, [router, startedAt]);

  useEffect(() => {
    if (!config?.endsAt) return;
    if (remaining <= 0) complete();
  }, [remaining, config?.endsAt, complete]);

  if (!config) return <Redirect href="/home" />;
  if (!current) return null;

  const isLast = index + 1 >= items.length;
  const wasAttempted = selected !== null;
  const isCorrect = revealed && selected === current.answer;
  const feedback = isCorrect ? "success" : wasAttempted ? "danger" : "neutral";
  const lowTime = timed && remaining <= 60;

  function haptic(correct: boolean) {
    tapFeedback(correct ? "success" : "error");
  }

  function choose(key: ChoiceKey) {
    if (revealed || !current) return;
    setSelected(key);

    if (isStudy) {
      haptic(key === current.answer);
      setRevealed(true);
      return;
    }

    // Mock answers must stay hidden, including from haptics.
    if (isMock) {
      tapFeedback("select");
      return;
    }

    haptic(key === current.answer);
    useSession.getState().select({
      questionId: current.id,
      selected: key,
      correct: key === current.answer,
      ms: Date.now() - itemStart.current,
    });
    setRevealed(true);
  }

  function goNext() {
    if (!current) return;

    if (isStudy) {
      if (isLast) {
        useSession.getState().reset();
        router.back();
        return;
      }
      setSelected(null);
      setRevealed(false);
      useSession.getState().next();
      return;
    }

    if (isMock && !selected) return;
    if (!isMock && !revealed) return;

    if (isMock && selected) {
      useSession.getState().select({
        questionId: current.id,
        selected,
        correct: selected === current.answer,
        ms: Date.now() - itemStart.current,
      });
    }

    if (isLast) {
      complete();
      return;
    }

    setSelected(null);
    setRevealed(false);
    useSession.getState().next();
  }

  function goPrev() {
    if (index === 0) return;
    setSelected(null);
    setRevealed(false);
    useSession.getState().prev();
  }

  function toggleSaved() {
    if (!current) return;
    setBookmarked(toggleBookmark(current.id));
    Animated.sequence([
      Animated.timing(bookmarkScale, {
        toValue: 1.3,
        duration: 110,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.spring(bookmarkScale, {
        toValue: 1,
        speed: 30,
        bounciness: 8,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
    tapFeedback("select");
  }

  function exit() {
    if (isStudy) {
      useSession.getState().reset();
      router.back();
      return;
    }

    // React Native Web does not implement Alert; make previews behave.
    if (Platform.OS === "web") {
      saveCurrentSession();
      router.back();
      return;
    }

    Alert.alert(
      "Leave this session?",
      "Your progress is saved. Pick it up again from Home.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save and exit",
          onPress: () => {
            saveCurrentSession();
            router.back();
          },
        },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            useSession.getState().reset();
            router.back();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Touchable
          onPress={exit}
          haptic="light"
          scaleTo={0.9}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Exit session"
        >
          <MaterialCommunityIcons name="close" size={22} color={colors.ink} />
        </Touchable>
        <View style={styles.topCenter}>
          <AppText variant="label" numberOfLines={1}>
            {config.title}
          </AppText>
          <AppText variant="tiny" color={colors.muted}>
            {index + 1} of {items.length}
          </AppText>
        </View>
        <View
          style={[
            styles.timerChip,
            lowTime && styles.timerLow,
            isStudy && styles.studyChip,
          ]}
        >
          <MaterialCommunityIcons
            name={isStudy ? "book-open-page-variant-outline" : timed ? "timer-outline" : "infinity"}
            size={14}
            color={lowTime ? colors.danger : isStudy ? colors.primary : colors.inkSoft}
          />
          <AppText
            variant="mono"
            color={lowTime ? colors.danger : isStudy ? colors.primary : colors.inkSoft}
            style={{ fontSize: 13 }}
          >
            {isStudy ? "STUDY" : timed ? formatClock(remaining) : "—"}
          </AppText>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${(index / Math.max(1, items.length)) * 100}%` },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <View style={styles.sectionPill}>
            <AppText variant="tiny" color={colors.primary}>
              {SECTION_BY_ID.get(current.section)?.short.toUpperCase()}
            </AppText>
          </View>
          <AppText variant="tiny" color={colors.muted} numberOfLines={1}>
            {topicName(current.section, current.topic)}
          </AppText>
          <View style={{ flex: 1 }} />
          {[1, 2, 3].map((level) => (
            <View
              key={level}
              style={[
                styles.diffDot,
                {
                  backgroundColor:
                    level <= current.difficulty ? colors.gold : colors.line,
                },
              ]}
            />
          ))}
          <Touchable
            onPress={toggleSaved}
            hitSlop={10}
            haptic="none"
            scaleTo={0.85}
            style={styles.bookmarkBtn}
            accessibilityLabel={
              bookmarked ? "Remove bookmark" : "Bookmark this item"
            }
          >
            <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
              <MaterialCommunityIcons
                name={bookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color={bookmarked ? colors.gold : colors.muted}
              />
            </Animated.View>
          </Touchable>
          <Touchable
            onPress={() => setReportOpen(true)}
            hitSlop={10}
            haptic="light"
            scaleTo={0.85}
            style={styles.bookmarkBtn}
            accessibilityLabel={
              reported
                ? "Reported. Report this item again"
                : "Report this item"
            }
          >
            <MaterialCommunityIcons
              name={reported ? "flag" : "flag-outline"}
              size={18}
              color={reported ? colors.gold : colors.muted}
            />
          </Touchable>
        </View>

        <Card style={styles.stemCard}>
          <AppText style={{ fontSize: 17, lineHeight: 26 }}>
            {current.stem}
          </AppText>
        </Card>

        <View style={{ gap: spacing.sm }}>
          {current.choices.map((choice) => (
            <ChoiceRow
              key={choice.key}
              choice={choice}
              state={getChoiceState(choice.key, selected, revealed, current.answer)}
              onPress={() => choose(choice.key)}
            />
          ))}
        </View>

        {revealed ? (
          <Card
            style={[
              styles.explanation,
              {
                backgroundColor:
                  feedback === "success"
                    ? colors.successSoft
                    : feedback === "danger"
                      ? colors.dangerSoft
                      : colors.primarySoft,
                borderColor:
                  feedback === "success"
                    ? "#BFE6D2"
                    : feedback === "danger"
                      ? "#F3C7C7"
                      : "#C9D6FA",
              },
            ]}
          >
            <View style={styles.explanationHead}>
              <MaterialCommunityIcons
                name={
                  feedback === "success"
                    ? "check-circle"
                    : feedback === "danger"
                      ? "close-circle"
                      : "information"
                }
                size={20}
                color={
                  feedback === "success"
                    ? colors.success
                    : feedback === "danger"
                      ? colors.danger
                      : colors.primary
                }
              />
              <AppText
                variant="label"
                color={
                  feedback === "success"
                    ? colors.success
                    : feedback === "danger"
                      ? colors.danger
                      : colors.primary
                }
              >
                {feedback === "success"
                  ? "Correct"
                  : feedback === "danger"
                    ? `Incorrect · answer is ${current.answer}`
                    : `Answer is ${current.answer}`}
              </AppText>
            </View>
            <AppText variant="small">{current.explanation}</AppText>
            {current.tip ? (
              <View style={styles.tipRow}>
                <MaterialCommunityIcons name="lightbulb-outline" size={15} color={colors.gold} />
                <AppText variant="tiny" color={colors.inkSoft} style={{ flex: 1 }}>
                  {current.tip}
                </AppText>
              </View>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {isMock ? (
          <AppText
            variant="tiny"
            color={colors.muted}
            style={{ textAlign: "center" }}
          >
            No feedback until the end. Answer and move.
          </AppText>
        ) : null}

        {isStudy ? (
          <View style={styles.studyRow}>
            <Button
              label="Previous"
              variant="secondary"
              full={false}
              style={{ flex: 1 }}
              haptic="none"
              disabled={index === 0}
              onPress={goPrev}
            />
            <Button
              label={!revealed ? "Show answer" : isLast ? "Done" : "Next item"}
              icon={
                !revealed
                  ? "eye-outline"
                  : isLast
                    ? "check"
                    : "arrow-right"
              }
              full={false}
              style={{ flex: 2 }}
              haptic={!revealed ? "light" : "none"}
              onPress={!revealed ? () => setRevealed(true) : goNext}
            />
          </View>
        ) : (
          <Button
            label={
              isLast ? (isMock ? "Submit mock" : "Finish set") : "Next item"
            }
            icon={isLast ? "check" : "arrow-right"}
            haptic="none"
            disabled={isMock ? !selected : !revealed}
            onPress={goNext}
          />
        )}
      </View>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        alreadyReported={reported}
        onSubmit={(reason) => {
          if (!current) return;
          addReport(current.id, reason);
          setReported(true);
          tapFeedback("success");
        }}
      />
    </SafeAreaView>
  );
}

function getChoiceState(
  key: ChoiceKey,
  selected: ChoiceKey | null,
  revealed: boolean,
  answer: ChoiceKey,
): ChoiceState {
  if (!revealed) return selected === key ? "selected" : "idle";
  if (key === answer) return "correct";
  if (key === selected) return "wrong";
  return "dim";
}

function ChoiceRow({
  choice,
  state,
  onPress,
}: {
  choice: Choice;
  state: ChoiceState;
  onPress: () => void;
}) {
  const palette: Record<
    ChoiceState,
    { bg: string; border: string; letter: string; text: string }
  > = {
    idle: {
      bg: colors.surface,
      border: colors.line,
      letter: colors.surfaceAlt,
      text: colors.ink,
    },
    selected: {
      bg: colors.primarySoft,
      border: colors.primary,
      letter: colors.primary,
      text: colors.ink,
    },
    correct: {
      bg: colors.successSoft,
      border: colors.success,
      letter: colors.success,
      text: colors.ink,
    },
    wrong: {
      bg: colors.dangerSoft,
      border: colors.danger,
      letter: colors.danger,
      text: colors.ink,
    },
    dim: {
      bg: colors.surface,
      border: colors.line,
      letter: colors.surfaceAlt,
      text: colors.muted,
    },
  };
  const tone = palette[state];

  return (
    <Touchable
      onPress={onPress}
      disabled={state === "dim" || state === "correct" || state === "wrong"}
      haptic="none"
      scaleTo={0.98}
      style={[
        styles.choice,
        { backgroundColor: tone.bg, borderColor: tone.border },
      ]}
    >
      <View style={[styles.letter, { backgroundColor: tone.letter }]}>
        <AppText
          variant="label"
          color={
            state === "selected" || state === "correct" || state === "wrong"
              ? colors.white
              : colors.inkSoft
          }
        >
          {choice.key}
        </AppText>
      </View>
      <AppText
        variant="small"
        color={tone.text}
        style={{ flex: 1, fontSize: 15, lineHeight: 21 }}
      >
        {choice.text}
      </AppText>
      {state === "correct" ? (
        <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
      ) : null}
      {state === "wrong" ? (
        <MaterialCommunityIcons name="close-circle" size={20} color={colors.danger} />
      ) : null}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  topCenter: { flex: 1, alignItems: "center" },
  timerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    minWidth: 74,
    justifyContent: "center",
  },
  timerLow: { backgroundColor: colors.dangerSoft, borderColor: "#F3C7C7" },
  studyChip: { backgroundColor: colors.primarySoft, borderColor: "#C9D6FA" },
  progressTrack: {
    height: 4,
    backgroundColor: colors.line,
    marginHorizontal: spacing.md,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sectionPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  bookmarkBtn: { paddingLeft: spacing.xs, paddingVertical: 2 },
  stemCard: { paddingVertical: spacing.lg },
  explanation: { gap: spacing.sm },
  explanationHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(11,27,58,0.08)",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  studyRow: { flexDirection: "row", gap: spacing.sm },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 56,
  },
  letter: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
