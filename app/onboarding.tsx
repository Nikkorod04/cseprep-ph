import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Touchable } from "@/components/ui/Touchable";
import type { Track } from "@/lib/content/types";
import { startDiagnostic } from "@/lib/quiz/start";
import { useSettings } from "@/lib/store/settings";
import { daysUntil, formatDate } from "@/lib/utils/date";
import { colors, radius, spacing } from "@/theme/tokens";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Steps 0-2 are choices; step 3 is the review screen. */
type Step = 0 | 1 | 2 | 3;

const LAST_CHOICE_STEP = 2;
const TOTAL_STEPS = 3;
const USE_NATIVE = Platform.OS !== "web";

interface TrackChoice {
  value: Track;
  kicker: string;
  title: string;
  description: string;
  items: string;
  minutes: string;
  sections: string[];
  icon: IconName;
}

const TRACKS: TrackChoice[] = [
  {
    value: "professional",
    kicker: "PROFESSIONAL LEVEL",
    title: "Professional",
    description: "Analytical reasoning, data interpretation, and problem solving.",
    items: "170 items",
    minutes: "190 min",
    sections: ["Verbal", "Numerical", "Analytical", "Gen. Info"],
    icon: "briefcase-outline",
  },
  {
    value: "subprofessional",
    kicker: "SUBPROFESSIONAL LEVEL",
    title: "Subprofessional",
    description: "Clerical accuracy, records, and office procedures.",
    items: "165 items",
    minutes: "160 min",
    sections: ["Verbal", "Numerical", "Clerical", "Gen. Info"],
    icon: "file-document-multiple-outline",
  },
];

interface DateChoice {
  value: string | null;
  hint: string;
}

const EXAM_DATES: DateChoice[] = [
  { value: "2027-03-14", hint: "Next CSE-PPT" },
  { value: "2027-08-08", hint: "Estimated schedule" },
  { value: null, hint: "Set the date later in Profile" },
];

const GOALS = [
  { value: 10, label: "Light" },
  { value: 20, label: "Steady" },
  { value: 30, label: "Serious" },
] as const;

function minutesFor(goal: number): number {
  return Math.round(goal * 0.75);
}

function countdownText(iso: string | null): string | null {
  const days = daysUntil(iso);
  if (days === null) return null;
  if (days < 0) return "Date has passed";
  if (days === 0) return "Today";
  return `${days} days away`;
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function toIso(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function fromIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

interface CalendarCell {
  iso: string;
  day: number;
  disabled: boolean;
}

function buildCalendar(
  viewMonth: Date,
  todayIso: string,
): Array<CalendarCell | null> {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<CalendarCell | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toIso(new Date(year, month, day));
    cells.push({ iso, day, disabled: iso < todayIso });
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const settings = useSettings();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
  const [track, setTrack] = useState<Track>(settings.track);
  const [examDate, setExamDate] = useState<string | null>(settings.examDate);
  const [goal, setGoal] = useState<number>(settings.dailyGoal);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(new Date()),
  );

  const enter = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE,
    }).start();
  }, [step, enter]);

  // Android hardware back walks back through the wizard.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (step === 0) return false;
        setDirection(-1);
        setStep((current) => (current - 1) as Step);
        return true;
      },
    );
    return () => subscription.remove();
  }, [step]);

  function go(next: number) {
    const target = Math.max(0, Math.min(3, next)) as Step;
    if (target === step) return;
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }

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

  function openDatePicker() {
    const nowIso = toIso(new Date());
    const remembered = examDate && examDate >= nowIso ? examDate : null;
    setViewMonth(startOfMonth(remembered ? fromIso(remembered) : new Date()));
    setDraftDate(remembered);
    setPickerOpen(true);
  }

  function confirmDate() {
    if (!draftDate) return;
    setExamDate(draftDate);
    setPickerOpen(false);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toIso(today);
  const thisMonth = startOfMonth(today).getTime();
  const canGoBackMonth = viewMonth.getTime() > thisMonth;
  const calendarCells = buildCalendar(viewMonth, todayIso);
  const monthLabel = viewMonth.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
  const examCountdown = countdownText(examDate);

  const selectedTrack = TRACKS.find((t) => t.value === track) ?? TRACKS[0];
  const progress = Math.min(step + 1, TOTAL_STEPS) / TOTAL_STEPS;

  const stepStyle = {
    opacity: enter,
    transform: [
      {
        translateX: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [direction * 28, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        {step === 0 ? (
          <View style={styles.brand}>
            <Image
              source={require("../assets/brand-mark.png")}
              style={styles.mark}
            />
            <View>
              <AppText variant="label">CSE Prep PH</AppText>
              <AppText variant="tiny" color={colors.muted}>
                SET UP
              </AppText>
            </View>
          </View>
        ) : (
          <Touchable
            onPress={() => go(step - 1)}
            haptic="light"
            scaleTo={0.92}
            accessibilityLabel="Go back"
            style={styles.backBtn}
          >
            <MaterialCommunityIcons name="arrow-left" size={20} color={colors.ink} />
          </Touchable>
        )}

        <View style={{ flex: 1 }} />

        {step < 3 ? (
          <Touchable
            onPress={() => finish(false)}
            haptic="light"
            scaleTo={0.94}
            accessibilityLabel="Skip setup"
            style={styles.skipBtn}
          >
            <AppText variant="label" color={colors.primary}>
              Skip
            </AppText>
          </Touchable>
        ) : null}
      </View>

      <View style={styles.progressWrap}>
        <View style={styles.progressMeta}>
          <AppText variant="tiny" color={colors.muted}>
            {step < 3
              ? `STEP ${step + 1} OF ${TOTAL_STEPS}`
              : "READY TO START"}
          </AppText>
          <AppText variant="tiny" color={colors.primary}>
            {Math.round(progress * 100)}%
          </AppText>
        </View>
        <View style={styles.segments}>
          {Array.from({ length: TOTAL_STEPS }, (_, index) => (
            <View
              key={index}
              style={[
                styles.segment,
                index < Math.min(step + 1, TOTAL_STEPS) && styles.segmentOn,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[stepStyle, styles.stepBody]}>
          {step === 0 ? (
            <View>
              <StepHeading
                eyebrow="EXAM TRACK"
                title="What exam are you taking?"
                body="This sets your practice pool, mock, and daily challenge. Switch anytime."
              />

              {TRACKS.map((choice) => (
                <TrackOption
                  key={choice.value}
                  choice={choice}
                  selected={track === choice.value}
                  onPress={() => setTrack(choice.value)}
                />
              ))}

              <View style={styles.infoNote}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color={colors.primary}
                />
                <AppText
                  variant="small"
                  color={colors.inkSoft}
                  style={{ flex: 1 }}
                >
                  Both tracks cover Verbal, Numerical, and General Information.
                  Professional adds Analytical; Subprofessional adds Clerical.
                </AppText>
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View>
              <StepHeading
                eyebrow="EXAM DATE"
                title="When is your exam?"
                body="The countdown on Home uses this date. You can change it later in Profile."
              />

              <Touchable
                onPress={openDatePicker}
                accessibilityRole="radio"
                accessibilityState={{ checked: examDate !== null }}
                accessibilityLabel={
                  examDate
                    ? `Exam date set to ${formatDate(
                        examDate,
                      )}. Tap to change.`
                    : "Set your exam date"
                }
                haptic="select"
                scaleTo={0.98}
                style={[styles.dateCard, examDate !== null && styles.dateCardOn]}
              >
                <View
                  style={[
                    styles.dateTile,
                    examDate !== null && styles.dateTileOn,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-month-outline"
                    size={24}
                    color={examDate !== null ? colors.white : colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" style={styles.dateLabel}>
                    I'll set a date
                  </AppText>
                  <AppText variant="tiny" color={colors.muted}>
                    {examDate
                      ? "Tap to change your target date"
                      : "Pick the date you're aiming for"}
                  </AppText>
                  {examDate ? (
                    <AppText
                      variant="tiny"
                      color={colors.primary}
                      style={{ marginTop: 2 }}
                    >
                      {formatDate(examDate).toUpperCase()}
                      {examCountdown ? ` · ${examCountdown.toUpperCase()}` : ""}
                    </AppText>
                  ) : null}
                </View>
                <View style={[styles.radio, examDate !== null && styles.radioOn]}>
                  {examDate !== null ? (
                    <MaterialCommunityIcons name="check" size={14} color={colors.white} />
                  ) : null}
                </View>
              </Touchable>

              <Touchable
                onPress={() => setExamDate(null)}
                accessibilityRole="radio"
                accessibilityState={{ checked: examDate === null }}
                accessibilityLabel="Not sure yet. Set it later in Profile."
                haptic="select"
                scaleTo={0.98}
                style={[styles.dateCard, examDate === null && styles.dateCardOn]}
              >
                <View
                  style={[styles.dateTile, examDate === null && styles.dateTileOn]}
                >
                  <MaterialCommunityIcons
                    name="help-circle-outline"
                    size={24}
                    color={examDate === null ? colors.white : colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" style={styles.dateLabel}>
                    Not sure yet
                  </AppText>
                  <AppText variant="tiny" color={colors.muted}>
                    You can set it later in Profile
                  </AppText>
                </View>
                <View style={[styles.radio, examDate === null && styles.radioOn]}>
                  {examDate === null ? (
                    <MaterialCommunityIcons name="check" size={14} color={colors.white} />
                  ) : null}
                </View>
              </Touchable>

              <View style={styles.infoNote}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={18}
                  color={colors.primary}
                />
                <AppText
                  variant="small"
                  color={colors.inkSoft}
                  style={{ flex: 1 }}
                >
                  CSC releases final schedules late, so this is your own target
                  date. Confirm the official date before exam day.
                </AppText>
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <StepHeading
                eyebrow="DAILY GOAL"
                title="How much per day?"
                body="Short, steady sets beat one long cram. Pick a pace you can keep."
              />

              <View style={styles.goalRow}>
                {GOALS.map((option) => (
                  <GoalOption
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    minutes={minutesFor(option.value)}
                    selected={goal === option.value}
                    onPress={() => setGoal(option.value)}
                  />
                ))}
              </View>

              <Card style={styles.paceCard}>
                <View style={styles.paceIcon}>
                  <MaterialCommunityIcons name="fire" size={20} color="#B45309" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="heading">
                    {minutesFor(goal)} minutes a day
                  </AppText>
                  <AppText variant="small" color={colors.muted}>
                    About {goal * 7} items a week at this pace. This also sets
                    your daily challenge and streak.
                  </AppText>
                </View>
              </Card>
            </View>
          ) : null}

          {step === 3 ? (
            <View>
              <View style={styles.reviewTop}>
                <View style={styles.doneIcon}>
                  <MaterialCommunityIcons
                    name="check"
                    size={34}
                    color={colors.success}
                  />
                </View>
                <AppText variant="display" style={styles.reviewTitle}>
                  You're all set.
                </AppText>
                <AppText
                  variant="body"
                  color={colors.muted}
                  style={styles.reviewLead}
                >
                  Everything is saved on this phone. No account, no sign-up.
                </AppText>
              </View>

              <Card style={styles.summaryCard}>
                <SummaryRow
                  icon="briefcase-outline"
                  label="Exam track"
                  value={selectedTrack.title}
                  note={`${selectedTrack.items} · ${selectedTrack.minutes}`}
                  onEdit={() => go(0)}
                />
                <View style={styles.summaryDivider} />
                <SummaryRow
                  icon="calendar-month-outline"
                  label="Exam date"
                  value={formatDate(examDate)}
                  note={
                    examDate
                      ? countdownText(examDate) ?? "No date set"
                      : "Set it later in Profile"
                  }
                  onEdit={() => go(1)}
                />
                <View style={styles.summaryDivider} />
                <SummaryRow
                  icon="fire"
                  label="Daily goal"
                  value={`${goal} items per day`}
                  note={`About ${minutesFor(goal)} minutes daily`}
                  onEdit={() => go(2)}
                />
              </Card>

              <View style={styles.privacyRow}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={colors.success}
                />
                <AppText
                  variant="small"
                  color={colors.muted}
                  style={{ flex: 1 }}
                >
                  Your answers stay on this phone. Nothing is uploaded.
                </AppText>
              </View>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <>
            <Button
              label={step === LAST_CHOICE_STEP ? "Review setup" : "Continue"}
              icon="arrow-right"
              onPress={() => go(step + 1)}
            />
            <AppText
              variant="tiny"
              color={colors.muted}
              style={styles.footerHint}
            >
              Change these anytime in Profile
            </AppText>
          </>
        ) : (
          <>
            <Button
              label="Start reviewing"
              icon="arrow-right"
              onPress={() => finish(false)}
            />
            <Button
              label="Take the 10-item diagnostic first"
              variant="secondary"
              onPress={() => finish(true)}
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPickerOpen(false)}
            accessibilityLabel="Close date picker"
          />
          <View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.lg },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <AppText variant="tiny" color={colors.primary}>
                  TARGET EXAM DATE
                </AppText>
                <AppText variant="title" style={{ marginTop: 2 }}>
                  Pick a date
                </AppText>
              </View>
              <Touchable
                onPress={() => setPickerOpen(false)}
                haptic="light"
                scaleTo={0.9}
                accessibilityLabel="Close"
                style={styles.closeBtn}
              >
                <MaterialCommunityIcons name="close" size={18} color={colors.ink} />
              </Touchable>
            </View>

            <View style={styles.selectedPill}>
              <MaterialCommunityIcons name="calendar-month" size={14} color={colors.primary} />
              <AppText variant="label" color={colors.primary}>
                {draftDate ? formatDate(draftDate) : "No date selected"}
              </AppText>
            </View>

            <View style={styles.monthRow}>
              <Touchable
                disabled={!canGoBackMonth}
                onPress={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                haptic="light"
                scaleTo={0.9}
                accessibilityLabel="Previous month"
                style={[styles.monthBtn, !canGoBackMonth && styles.monthBtnOff]}
              >
                <MaterialCommunityIcons name="chevron-left" size={18} color={colors.ink} />
              </Touchable>
              <AppText variant="label">{monthLabel}</AppText>
              <Touchable
                onPress={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                haptic="light"
                scaleTo={0.9}
                accessibilityLabel="Next month"
                style={styles.monthBtn}
              >
                <MaterialCommunityIcons name="chevron-right" size={18} color={colors.ink} />
              </Touchable>
            </View>

            <View style={styles.weekRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
                <View key={`${label}-${index}`} style={styles.weekCell}>
                  <AppText variant="tiny" color={colors.muted}>
                    {label}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.dayGrid}>
              {calendarCells.map((cell, index) =>
                cell ? (
                  <Touchable
                    key={cell.iso}
                    disabled={cell.disabled}
                    onPress={() => setDraftDate(cell.iso)}
                    haptic="select"
                    scaleTo={0.9}
                    accessibilityLabel={formatDate(cell.iso)}
                    accessibilityState={{
                      selected: draftDate === cell.iso,
                      disabled: cell.disabled,
                    }}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        draftDate === cell.iso && styles.dayCircleOn,
                        cell.iso === todayIso &&
                          draftDate !== cell.iso &&
                          styles.dayCircleToday,
                        cell.disabled && styles.dayCircleOff,
                      ]}
                    >
                      <AppText
                        variant="small"
                        color={
                          draftDate === cell.iso
                            ? colors.white
                            : cell.disabled
                              ? colors.muted
                              : colors.ink
                        }
                      >
                        {cell.day}
                      </AppText>
                    </View>
                  </Touchable>
                ) : (
                  <View key={`blank-${index}`} style={styles.dayCell} />
                ),
              )}
            </View>

            <View style={styles.sheetFooter}>
              <Button
                label="Cancel"
                variant="secondary"
                full={false}
                onPress={() => setPickerOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                label="Use this date"
                full={false}
                disabled={!draftDate}
                onPress={confirmDate}
                style={{ flex: 1 }}
              />
            </View>

            <AppText
              variant="tiny"
              color={colors.muted}
              style={styles.sheetNote}
            >
              CSC schedules can change — this date only drives your countdown.
            </AppText>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StepHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.headingBlock}>
      <AppText variant="tiny" color={colors.primary}>
        {eyebrow}
      </AppText>
      <AppText variant="display" style={styles.headingTitle}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.muted} style={styles.headingBody}>
        {body}
      </AppText>
    </View>
  );
}

function TrackOption({
  choice,
  selected,
  onPress,
}: {
  choice: TrackChoice;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${choice.title}. ${choice.description}`}
      haptic="select"
      scaleTo={0.98}
      style={[styles.trackCard, selected && styles.trackCardOn]}
    >
      <View style={styles.trackTop}>
        <View style={[styles.trackIcon, selected && styles.trackIconOn]}>
          <MaterialCommunityIcons
            name={choice.icon}
            size={22}
            color={selected ? colors.white : colors.primary}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText
            variant="tiny"
            color={selected ? colors.primary : colors.muted}
          >
            {choice.kicker}
          </AppText>
          <AppText variant="title" style={styles.trackTitle}>
            {choice.title}
          </AppText>
        </View>
        <View style={[styles.radio, selected && styles.radioOn]}>
          {selected ? (
            <MaterialCommunityIcons name="check" size={14} color={colors.white} />
          ) : null}
        </View>
      </View>

      <AppText variant="small" color={colors.inkSoft} style={styles.trackDesc}>
        {choice.description}
      </AppText>

      <View style={styles.trackMeta}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="layers-outline" size={14} color={colors.muted} />
          <AppText variant="small" color={colors.inkSoft}>
            {choice.items}
          </AppText>
        </View>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.muted} />
          <AppText variant="small" color={colors.inkSoft}>
            {choice.minutes}
          </AppText>
        </View>
      </View>

      <View style={styles.tags}>
        {choice.sections.map((section) => (
          <View
            key={section}
            style={[styles.tag, selected && styles.tagOn]}
          >
            <AppText
              variant="tiny"
              color={selected ? colors.primary : colors.muted}
            >
              {section.toUpperCase()}
            </AppText>
          </View>
        ))}
      </View>
    </Touchable>
  );
}

function GoalOption({
  value,
  label,
  minutes,
  selected,
  onPress,
}: {
  value: number;
  label: string;
  minutes: number;
  selected: boolean;
  onPress: () => void;
}) {
  const ink = selected ? colors.white : colors.ink;
  const softInk = selected ? "rgba(255,255,255,0.72)" : colors.muted;

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${value} items a day, about ${minutes} minutes`}
      haptic="select"
      scaleTo={0.96}
      style={[styles.goalTile, selected && styles.goalTileOn]}
    >
      <AppText variant="tiny" color={softInk}>
        {label.toUpperCase()}
      </AppText>
      <AppText variant="display" color={ink} style={styles.goalValue}>
        {value}
      </AppText>
      <AppText variant="tiny" color={softInk}>
        ITEMS/DAY
      </AppText>
      <View style={[styles.goalDivider, selected && styles.goalDividerOn]} />
      <AppText variant="tiny" color={softInk}>
        ~{minutes} MIN
      </AppText>
    </Touchable>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  note,
  onEdit,
}: {
  icon: IconName;
  label: string;
  value: string;
  note: string;
  onEdit: () => void;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons name={icon} size={19} color={colors.primary} />
      </View>
      <View style={styles.summaryBody}>
        <AppText variant="tiny" color={colors.muted}>
          {label.toUpperCase()}
        </AppText>
        <AppText variant="label" style={{ fontSize: 15 }}>
          {value}
        </AppText>
        <AppText variant="tiny" color={colors.muted}>
          {note}
        </AppText>
      </View>
      <Touchable
        onPress={onEdit}
        haptic="light"
        scaleTo={0.92}
        accessibilityLabel={`Edit ${label}`}
        style={styles.editBtn}
      >
        <AppText variant="tiny" color={colors.primary}>
          EDIT
        </AppText>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  mark: { width: 34, height: 34, borderRadius: 10 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  skipBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.xs + 2,
  },
  progressMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  segments: { flexDirection: "row", gap: 6 },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.line,
  },
  segmentOn: { backgroundColor: colors.primary },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  stepBody: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  headingBlock: { marginTop: spacing.sm, marginBottom: spacing.lg },
  headingTitle: { marginTop: spacing.xs, marginBottom: spacing.xs },
  headingBody: { maxWidth: 520 },

  trackCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  trackCardOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  trackTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  trackIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  trackIconOn: { backgroundColor: colors.primary },
  trackTitle: { fontSize: 20, marginTop: 1 },
  trackDesc: { marginTop: spacing.sm },
  trackMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  tagOn: { backgroundColor: colors.white },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  radioOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  infoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    marginTop: spacing.xs,
  },

  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dateCardOn: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  dateTile: {
    width: 54,
    height: 60,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  dateTileOn: { backgroundColor: colors.primary },
  dateLabel: { fontSize: 15 },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(11,27,58,0.45)",
  },
  sheet: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 560,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  selectedPill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  monthBtnOff: { opacity: 0.3 },
  weekRow: { flexDirection: "row" },
  weekCell: {
    width: "14.2857%",
    alignItems: "center",
    paddingBottom: 2,
  },
  dayGrid: { flexDirection: "row", flexWrap: "wrap" },
  dayCell: {
    width: "14.2857%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleOn: { backgroundColor: colors.primary },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayCircleOff: { opacity: 0.32 },
  sheetFooter: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sheetNote: { textAlign: "center" },

  goalRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  goalTile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  goalTileOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  goalValue: { fontSize: 30, lineHeight: 36, marginTop: 2 },
  goalDivider: {
    width: 26,
    height: 1,
    marginVertical: spacing.sm,
    backgroundColor: colors.line,
  },
  goalDividerOn: { backgroundColor: "rgba(255,255,255,0.34)" },

  paceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  paceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
  },

  reviewTop: {
    alignItems: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  doneIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.successSoft,
    marginBottom: spacing.sm,
  },
  reviewTitle: { textAlign: "center" },
  reviewLead: {
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  summaryCard: { padding: 0, overflow: "hidden" },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 2,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  summaryBody: { flex: 1, gap: 1 },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  editBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },

  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  footerHint: {
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
