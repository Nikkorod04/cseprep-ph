import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Screen } from "@/components/ui/Screen";
import { Touchable } from "@/components/ui/Touchable";
import { TIPS, topicName } from "@/lib/content";
import { TRACK_LABEL } from "@/lib/content/types";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useSavedSession } from "@/lib/hooks/useSavedSession";
import { formatClock } from "@/lib/quiz/engine";
import { startPractice } from "@/lib/quiz/start";
import { restoreSession } from "@/lib/store/session";
import { useSettings } from "@/lib/store/settings";
import { SECTION_STYLE } from "@/theme/sections";
import { colors, radius, spacing } from "@/theme/tokens";
import { daysUntil, formatDate, greeting, relativeTime } from "@/lib/utils/date";

export default function HomeScreen() {
  const router = useRouter();
  const { track, examDate, dailyGoal } = useSettings();
  const { overview, streak, topics, accuracy } = useDashboard();

  const days = daysUntil(examDate);
  const goalProgress = dailyGoal > 0 ? overview.today / dailyGoal : 0;
  const weakest = topics.slice(0, 3);
  const tip = TIPS[0];
  const saved = useSavedSession();

  async function resume() {
    const ok = await restoreSession();
    if (ok) router.push("/session");
  }

  return (
    <Screen appBar="CSE Prep PH">
      <View style={styles.greeting}>
        <AppText variant="title">{greeting()}</AppText>
        <AppText variant="small" color={colors.muted}>
          Let's close the gap to 80%.
        </AppText>
      </View>

      {saved ? (
        <Card style={styles.resumeCard}>
          <View style={styles.resumeIcon}>
            <Ionicons name="bookmark" size={18} color="#8A5A00" />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="tiny" color="#8A5A00">
              CONTINUE
            </AppText>
            <AppText variant="label">{saved.config.title}</AppText>
            <AppText variant="tiny" color={colors.inkSoft}>
              {saved.index + 1} of {saved.total} · saved {relativeTime(saved.savedAt)}
              {typeof saved.config.pausedRemaining === "number"
                ? ` · ${formatClock(saved.config.pausedRemaining)} left`
                : ""}
            </AppText>
          </View>
          <Button
            label="Resume"
            full={false}
            onPress={() => void resume()}
            style={styles.resumeBtn}
          />
        </Card>
      ) : null}

      <LinearGradient
        colors={[colors.primaryDark, colors.primary, "#2D5BE0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={{ flex: 1 }}>
          <AppText variant="tiny" color="rgba(255,255,255,0.72)">
            EXAM COUNTDOWN
          </AppText>
          <View style={styles.heroNumbers}>
            <AppText variant="display" color={colors.white}>
              {days !== null && days > 0 ? days : "—"}
            </AppText>
            <AppText
              variant="heading"
              color="rgba(255,255,255,0.9)"
              style={{ marginBottom: 7 }}
            >
              days
            </AppText>
          </View>
          <AppText variant="small" color="rgba(255,255,255,0.82)">
            {formatDate(examDate)} · {TRACK_LABEL[track]}
          </AppText>
        </View>
        <View style={styles.heroBadge}>
          <AppText variant="tiny" color={colors.gold}>
            TARGET
          </AppText>
          <AppText variant="heading" color={colors.white}>
            80%
          </AppText>
        </View>
      </LinearGradient>

      <Card style={styles.todayCard}>
        <ProgressRing progress={goalProgress} size={82} stroke={8}>
          <AppText variant="heading">{overview.today}</AppText>
          <AppText variant="tiny" color={colors.muted}>
            /{dailyGoal}
          </AppText>
        </ProgressRing>
        <View style={{ flex: 1 }}>
          <AppText variant="heading">Today's set</AppText>
          <AppText variant="small" color={colors.muted}>
            {overview.today >= dailyGoal
              ? "Goal hit. One more set?"
              : `${Math.max(0, dailyGoal - overview.today)} items to hit your goal`}
          </AppText>
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={15} color={colors.gold} />
            <AppText variant="label" color={colors.inkSoft}>
              {streak}-day streak
            </AppText>
            <AppText variant="tiny" color={colors.muted}>
              · {Math.round(accuracy)}% accuracy
            </AppText>
          </View>
        </View>
      </Card>

      <View style={styles.actions}>
        <ActionTile
          icon="create-outline"
          label="Practice"
          tint={colors.primary}
          soft={colors.primarySoft}
          onPress={() => router.push("/practice")}
        />
        <ActionTile
          icon="timer-outline"
          label="Mock exam"
          tint="#7C3AED"
          soft="#F0E9FE"
          onPress={() => router.push("/mock")}
        />
        <ActionTile
          icon="bulb-outline"
          label="Tips"
          tint="#B45309"
          soft="#FEF0DC"
          onPress={() => router.push("/tips")}
        />
      </View>

      <Button
        label={`Start ${dailyGoal} items`}
        icon="play"
        onPress={() => startPractice({ count: dailyGoal, title: "Daily set" })}
      />

      <Touchable
        onPress={() => router.push("/practice")}
        haptic="light"
        scaleTo={0.98}
        style={styles.browseLink}
      >
        <Ionicons name="book-outline" size={15} color={colors.primary} />
        <AppText variant="small" color={colors.primary}>
          Prefer to read? Browse by topic
        </AppText>
      </Touchable>

      <Card style={{ gap: spacing.md }}>
        <View style={styles.cardHead}>
          <AppText variant="heading">Weakest topics</AppText>
          <AppText variant="tiny" color={colors.muted}>
            LOWEST ACCURACY
          </AppText>
        </View>

        {weakest.length === 0 ? (
          <AppText variant="small" color={colors.muted}>
            Answer a few items and your weak spots will appear here.
          </AppText>
        ) : (
          weakest.map((row) => {
            const style = SECTION_STYLE[row.section];
            return (
              <Touchable
                key={row.topic}
                onPress={() =>
                  startPractice({
                    section: row.section,
                    topic: row.topic,
                    count: 10,
                  })
                }
                haptic="select"
                scaleTo={0.99}
                style={styles.topicRow}
              >
                <View style={[styles.topicIcon, { backgroundColor: style.soft }]}>
                  <Ionicons name={style.icon} size={15} color={style.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="label">
                    {topicName(row.section, row.topic)}
                  </AppText>
                  <AppText variant="tiny" color={colors.muted}>
                    {Math.round(row.accuracy)}% · {row.attempts} attempts
                  </AppText>
                </View>
                <AppText variant="label" color={colors.primary}>
                  Drill
                </AppText>
              </Touchable>
            );
          })
        )}
      </Card>

      {tip ? (
        <Touchable
          onPress={() => router.push(`/tips/${tip.slug}`)}
          haptic="select"
          scaleTo={0.98}
        >
          <Card style={styles.tipCard}>
            <View style={styles.tipIcon}>
              <Ionicons name="bulb" size={18} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="tiny" color={colors.gold}>
                TIP OF THE DAY
              </AppText>
              <AppText variant="label">{tip.title}</AppText>
              <AppText variant="small" color={colors.muted} numberOfLines={2}>
                {tip.summary}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Card>
        </Touchable>
      ) : null}
    </Screen>
  );
}

function ActionTile({
  icon,
  label,
  tint,
  soft,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint: string;
  soft: string;
  onPress: () => void;
}) {
  return (
    <Touchable
      onPress={onPress}
      haptic="light"
      scaleTo={0.96}
      style={styles.action}
    >
      <View style={[styles.actionIcon, { backgroundColor: soft }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <AppText variant="label">{label}</AppText>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  resumeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.goldSoft,
    borderColor: "#F0DFA8",
    marginBottom: spacing.md,
  },
  resumeIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: "#FFE8A8",
    alignItems: "center",
    justifyContent: "center",
  },
  resumeBtn: { paddingHorizontal: spacing.md },
  browseLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  greeting: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    gap: 2,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg + 2,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  heroNumbers: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    marginTop: 2,
  },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  todayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  action: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  topicIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
