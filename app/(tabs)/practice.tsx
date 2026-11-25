import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Bar } from "@/components/ui/Bar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ExamCountdownChip } from "@/components/ui/ExamCountdownChip";
import { Screen } from "@/components/ui/Screen";
import { Touchable } from "@/components/ui/Touchable";
import { QUESTION_BY_ID, questionsFor, sectionsForTrack } from "@/lib/content";
import type { SectionId } from "@/lib/content/types";
import { TRACK_LABEL } from "@/lib/content/types";
import { getBookmarkedIds, getMissedQuestionIds } from "@/lib/db";
import { useDashboard } from "@/lib/hooks/useDashboard";
import {
  startBookmarkStudy,
  startMissedPractice,
  startPractice,
  startStudy,
} from "@/lib/quiz/start";
import { useSettings } from "@/lib/store/settings";
import { SECTION_STYLE } from "@/theme/sections";
import { colors, radius, spacing } from "@/theme/tokens";

function sectionAccuracy(
  rows: { section: SectionId; attempts: number; accuracy: number }[],
  section: SectionId,
): number | null {
  const list = rows.filter((r) => r.section === section);
  const attempts = list.reduce((sum, r) => sum + r.attempts, 0);
  if (attempts === 0) return null;
  return list.reduce((sum, r) => sum + r.attempts * r.accuracy, 0) / attempts;
}

function itemCount(n: number): string {
  return `${n} ${n === 1 ? "item" : "items"}`;
}

export default function PracticeScreen() {
  const track = useSettings((s) => s.track);
  const { topics } = useDashboard();
  const [open, setOpen] = useState<SectionId | null>("verbal");
  const [savedCount, setSavedCount] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const sections = sectionsForTrack(track);

  useFocusEffect(
    useCallback(() => {
      setSavedCount(getBookmarkedIds(100).length);
      const missed = getMissedQuestionIds(50).filter((id) =>
        QUESTION_BY_ID.get(id)?.tracks.includes(track),
      );
      setMissedCount(missed.length);
    }, [track]),
  );

  return (
    <Screen
      appBar="Practice"
      appBarRight={<ExamCountdownChip />}
      banner={false}
    >
      <Card style={styles.mixed}>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">Mixed practice</AppText>
          <AppText variant="small" color={colors.muted}>
            {TRACK_LABEL[track]} track · random across every section.
          </AppText>
        </View>
        <Ionicons name="shuffle" size={22} color={colors.primary} />
      </Card>
      <Button
        label="Start 20 mixed items"
        icon="play"
        onPress={() => startPractice({ count: 20, title: "Mixed practice" })}
        style={{ marginBottom: spacing.md }}
      />

      <Card style={styles.library}>
        <AppText variant="heading">Your library</AppText>
        <View style={styles.libraryRow}>
          <Button
            label={`Study saved (${savedCount})`}
            variant="secondary"
            full={false}
            style={styles.libraryBtn}
            disabled={savedCount === 0}
            onPress={() => startBookmarkStudy()}
          />
          <Button
            label={`Retry missed (${missedCount})`}
            variant="secondary"
            full={false}
            style={styles.libraryBtn}
            disabled={missedCount === 0}
            onPress={() => startMissedPractice()}
          />
        </View>
        <AppText variant="tiny" color={colors.muted}>
          Bookmark any item while studying, or retry questions you missed.
        </AppText>
      </Card>

      {sections.map((section) => {
        const style = SECTION_STYLE[section.id];
        const count = questionsFor(track, { section: section.id }).length;
        const acc = sectionAccuracy(topics, section.id);
        const isOpen = open === section.id;

        return (
          <Card key={section.id} style={styles.sectionCard}>
            <Touchable
              onPress={() => setOpen(isOpen ? null : section.id)}
              haptic="select"
              scaleTo={0.99}
              style={styles.sectionHead}
            >
              <View style={[styles.iconBox, { backgroundColor: style.soft }]}>
                <Ionicons name={style.icon} size={20} color={style.color} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="heading">{section.name}</AppText>
                <AppText variant="tiny" color={colors.muted}>
                  {itemCount(count)} ·{" "}
                  {acc === null ? "not started" : `${Math.round(acc)}% mastery`}
                </AppText>
              </View>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.muted}
              />
            </Touchable>

            <Bar progress={(acc ?? 0) / 100} color={style.color} height={6} />

            {isOpen ? (
              <View style={styles.topicList}>
                {section.topics.map((topic) => {
                  const n = questionsFor(track, {
                    section: section.id,
                    topic: topic.id,
                  }).length;
                  const stat = topics.find(
                    (t) => t.section === section.id && t.topic === topic.id,
                  );
                  const disabled = n === 0;
                  return (
                    <View
                      key={topic.id}
                      style={[styles.topicItem, disabled && { opacity: 0.4 }]}
                    >
                      <Touchable
                        disabled={disabled}
                        onPress={() =>
                          startPractice({
                            section: section.id,
                            topic: topic.id,
                            count: 10,
                          })
                        }
                        haptic="light"
                        scaleTo={0.99}
                        style={styles.topicInfo}
                      >
                        <AppText variant="label">{topic.name}</AppText>
                        <AppText variant="tiny" color={colors.muted}>
                          {itemCount(n)}
                          {stat ? ` · ${Math.round(stat.accuracy)}%` : ""}
                        </AppText>
                      </Touchable>
                      <Touchable
                        disabled={disabled}
                        onPress={() =>
                          startStudy({
                            section: section.id,
                            topic: topic.id,
                            title: topic.name,
                          })
                        }
                        hitSlop={8}
                        haptic="light"
                        scaleTo={0.9}
                        style={styles.topicAction}
                        accessibilityLabel={`Study ${topic.name}`}
                      >
                        <Ionicons
                          name="book-outline"
                          size={20}
                          color={disabled ? colors.line : colors.inkSoft}
                        />
                      </Touchable>
                      <Touchable
                        disabled={disabled}
                        onPress={() =>
                          startPractice({
                            section: section.id,
                            topic: topic.id,
                            count: 10,
                          })
                        }
                        hitSlop={8}
                        haptic="light"
                        scaleTo={0.9}
                        style={styles.topicAction}
                        accessibilityLabel={`Practice ${topic.name}`}
                      >
                        <Ionicons
                          name="play-circle"
                          size={24}
                          color={disabled ? colors.line : colors.primary}
                        />
                      </Touchable>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mixed: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderColor: "#C9D6FA",
    marginBottom: spacing.sm,
  },
  library: { gap: spacing.md, marginBottom: spacing.lg },
  libraryRow: { flexDirection: "row", gap: spacing.sm },
  libraryBtn: { flex: 1, paddingHorizontal: spacing.sm },
  sectionCard: { gap: spacing.md, marginBottom: spacing.md },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  topicList: {
    gap: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  topicInfo: { flex: 1 },
  topicAction: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
});
