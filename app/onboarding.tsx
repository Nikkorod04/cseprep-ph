import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Touchable } from "@/components/ui/Touchable";
import type { Track } from "@/lib/content/types";
import { startDiagnostic } from "@/lib/quiz/start";
import { useSettings } from "@/lib/store/settings";
import { colors, radius, spacing } from "@/theme/tokens";

const EXAM_DATES = [
  { value: "2027-03-14", label: "March 14, 2027", hint: "Next CSE-PPT" },
  { value: "2027-08-08", label: "August 2027", hint: "Estimate" },
  { value: null, label: "Not sure yet", hint: "Set it later" },
];

const GOALS = [10, 20, 30];

export default function OnboardingScreen() {
  const router = useRouter();
  const settings = useSettings();

  const [track, setTrack] = useState<Track>(settings.track);
  const [examDate, setExamDate] = useState<string | null>(settings.examDate);
  const [goal, setGoal] = useState<number>(settings.dailyGoal);

  function finish(takeDiagnostic: boolean) {
    settings.setTrack(track);
    settings.setExamDate(examDate);
    settings.setDailyGoal(goal);
    settings.completeOnboarding();
    if (takeDiagnostic) {
      startDiagnostic({ replace: true });
    } else {
      router.replace("/home");
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View style={styles.mark}>
            <AppText variant="heading" color={colors.white}>
              C
            </AppText>
          </View>
          <View>
            <AppText variant="label">CSE Prep PH</AppText>
            <AppText variant="tiny" color={colors.muted}>
              CIVIL SERVICE EXAM REVIEWER
            </AppText>
          </View>
        </View>

        <AppText variant="display">Set up your review.</AppText>
        <AppText variant="body" color={colors.muted}>
          Three quick choices, then a 10-item diagnostic. No account, no
          sign-up, no data needed.
        </AppText>

        <AppText variant="heading" style={styles.sectionTitle}>
          1. Which exam are you taking?
        </AppText>

        <TrackCard
          selected={track === "professional"}
          onPress={() => setTrack("professional")}
          title="Professional"
          subtitle="Verbal · Numerical · Analytical · General Info"
          note="170 items · 190 minutes"
          icon="briefcase-outline"
        />
        <TrackCard
          selected={track === "subprofessional"}
          onPress={() => setTrack("subprofessional")}
          title="Subprofessional"
          subtitle="Verbal · Numerical · Clerical · General Info"
          note="165 items · 160 minutes"
          icon="documents-outline"
        />

        <AppText variant="heading" style={styles.sectionTitle}>
          2. When is your exam?
        </AppText>
        <View style={styles.chipWrap}>
          {EXAM_DATES.map((date) => (
            <Chip
              key={date.label}
              label={date.label}
              selected={examDate === date.value}
              onPress={() => setExamDate(date.value)}
            />
          ))}
        </View>

        <AppText variant="heading" style={styles.sectionTitle}>
          3. Daily goal
        </AppText>
        <View style={styles.chipWrap}>
          {GOALS.map((value) => (
            <Chip
              key={value}
              label={`${value} items`}
              selected={goal === value}
              onPress={() => setGoal(value)}
            />
          ))}
        </View>

        <Card style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />
          <AppText variant="small" color={colors.inkSoft} style={{ flex: 1 }}>
            Everything is stored on your phone. We do not collect your name,
            email, or answers.
          </AppText>
        </Card>

        <Button
          label="Start reviewing"
          icon="arrow-forward"
          onPress={() => finish(false)}
          style={{ marginTop: spacing.lg }}
        />
        <Button
          label="Take the 10-item diagnostic first"
          variant="secondary"
          onPress={() => finish(true)}
          style={{ marginTop: spacing.sm }}
        />

        <Touchable
          onPress={() => finish(false)}
          haptic="light"
          scaleTo={0.99}
          style={styles.skip}
        >
          <AppText variant="small" color={colors.primary}>
            Skip setup — just browse
          </AppText>
        </Touchable>

        <AppText variant="tiny" color={colors.muted} style={styles.disclaimer}>
          Independent reviewer. Not affiliated with the Civil Service
          Commission.
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function TrackCard({
  selected,
  onPress,
  title,
  subtitle,
  note,
  icon,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
  note: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      haptic="select"
      scaleTo={0.98}
      style={[styles.track, selected && styles.trackSelected]}
    >
      <View style={[styles.trackIcon, selected && styles.trackIconSelected]}>
        <Ionicons
          name={icon}
          size={20}
          color={selected ? colors.primary : colors.inkSoft}
        />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="heading">{title}</AppText>
        <AppText variant="tiny" color={colors.muted}>
          {subtitle}
        </AppText>
        <AppText variant="tiny" color={selected ? colors.primary : colors.muted}>
          {note}
        </AppText>
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.xs },
  track: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.md,
  },
  trackSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  trackIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  trackIconSelected: { backgroundColor: colors.white },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOn: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.successSoft,
    borderColor: "#BFE6D2",
  },
  disclaimer: {
    textAlign: "center",
    marginTop: spacing.lg,
  },
  skip: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
});
