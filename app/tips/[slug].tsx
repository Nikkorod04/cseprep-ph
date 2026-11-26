import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Touchable } from "@/components/ui/Touchable";
import { SECTION_BY_ID, TIP_BY_SLUG, TIPS } from "@/lib/content";
import type { SectionId, TipArticle } from "@/lib/content/types";
import { startPractice } from "@/lib/quiz/start";
import { SECTION_STYLE } from "@/theme/sections";
import { colors, radius, spacing } from "@/theme/tokens";

const READING_FONT = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia",
});

function sectionShort(section: TipArticle["section"]): string {
  return section === "general"
    ? "General"
    : SECTION_BY_ID.get(section)?.short ?? section;
}

/** Renders **bold** and _italic_ inside a paragraph. */
function Inline({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).filter(Boolean);

  return (
    <AppText style={style}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={styles.bold}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith("_") && part.endsWith("_")) {
          return (
            <Text key={index} style={styles.italic}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={index}>{part}</Text>;
      })}
    </AppText>
  );
}

function ArticleBody({ body, accent }: { body: string; accent: string }) {
  return (
    <>
      {body.split("\n\n").map((block, index) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length === 0) return null;

        if (lines.every((line) => line.startsWith("• "))) {
          return (
            <View key={index} style={styles.bullets}>
              {lines.map((line, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.dot, { backgroundColor: accent }]} />
                  <Inline text={line.slice(2)} style={styles.bulletText} />
                </View>
              ))}
            </View>
          );
        }

        if (lines.every((line) => line.startsWith("> "))) {
          return (
            <View key={index} style={styles.callout}>
              <View style={[styles.calloutBar, { backgroundColor: accent }]} />
              <View style={styles.calloutBody}>
                {lines.map((line, i) => (
                  <Inline
                    key={i}
                    text={line.slice(2)}
                    style={styles.calloutText}
                  />
                ))}
              </View>
            </View>
          );
        }

        if (lines.length === 1 && lines[0].startsWith("## ")) {
          return (
            <AppText key={index} style={styles.subheading}>
              {lines[0].slice(3)}
            </AppText>
          );
        }

        return <Inline key={index} text={block} style={styles.paragraph} />;
      })}
    </>
  );
}

export default function TipDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const tip = slug ? TIP_BY_SLUG.get(slug) : undefined;

  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  if (!tip) {
    return (
      <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
        <View style={styles.topBar}>
          <Touchable
            onPress={() => router.back()}
            haptic="light"
            scaleTo={0.9}
            style={styles.back}
            accessibilityLabel="Back"
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.ink} />
          </Touchable>
          <AppText variant="heading">Tips & tricks</AppText>
        </View>
        <View style={styles.empty}>
          <AppText variant="heading">Article not found</AppText>
          <AppText variant="small" color={colors.muted}>
            It may have been renamed in a content update.
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const style =
    tip.section === "general"
      ? {
          icon: "creation-outline" as const,
          color: colors.primary,
          soft: colors.primarySoft,
        }
      : SECTION_STYLE[tip.section];

  const section: SectionId | undefined =
    tip.section === "general" ? undefined : tip.section;
  const sectionName = section
    ? SECTION_BY_ID.get(section)?.short ?? "this section"
    : undefined;

  const related = [...TIPS]
    .filter((item) => item.slug !== tip.slug)
    .sort(
      (a, b) =>
        Number(b.section === tip.section) - Number(a.section === tip.section),
    )
    .slice(0, 3);

  const maxScroll = Math.max(1, contentHeight - viewportHeight);
  const progressWidth = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  function practice() {
    if (section) {
      startPractice({
        section,
        count: 10,
        title: `${sectionName} drill`,
      });
    } else {
      startPractice({ count: 10, title: "Mixed practice" });
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Touchable
          onPress={() => router.back()}
          haptic="light"
          scaleTo={0.9}
          style={styles.back}
          accessibilityLabel="Back"
        >
          <MaterialCommunityIcons name="chevron-left" size={22} color={colors.ink} />
        </Touchable>
        <AppText variant="heading">Tips & tricks</AppText>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onContentSizeChange={(_, height) => setContentHeight(height)}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
      >
        <View style={styles.metaRow}>
          <View style={[styles.sectionPill, { backgroundColor: style.soft }]}>
            <AppText variant="tiny" color={style.color}>
              {sectionShort(tip.section).toUpperCase()}
            </AppText>
          </View>
          <AppText variant="tiny" color={colors.muted}>
            {tip.minutes} MIN READ
          </AppText>
          <View style={{ flex: 1 }} />
          <AppText variant="tiny" color={colors.muted}>
            NOV 2026
          </AppText>
        </View>

        <AppText style={styles.title}>{tip.title}</AppText>
        <AppText style={styles.standfirst}>{tip.summary}</AppText>

        <View style={styles.divider} />

        <ArticleBody body={tip.body} accent={style.color} />

        <Card style={styles.cta}>
          <AppText variant="tiny" color={colors.primary}>
            PUT IT TO PRACTICE
          </AppText>
          <AppText variant="heading">
            {section ? `Practice ${sectionName}` : "Start a mixed set"}
          </AppText>
          <AppText variant="small" color={colors.muted}>
            {section
              ? `Ten ${sectionName} questions with explanations, right after the guide.`
              : "Ten mixed questions to turn the advice into a habit."}
          </AppText>
          <Button label="Start 10 items" icon="play" onPress={practice} />
        </Card>

        <View style={styles.related}>
          <AppText variant="tiny" color={colors.muted}>
            KEEP READING
          </AppText>
          {related.map((item) => (
            <Touchable
              key={item.slug}
              onPress={() => router.replace(`/tips/${item.slug}`)}
              haptic="select"
              scaleTo={0.99}
            >
              <View style={styles.relatedRow}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="label">{item.title}</AppText>
                  <AppText variant="tiny" color={colors.muted}>
                    {sectionShort(item.section).toUpperCase()} ·{" "}
                    {item.minutes} MIN
                  </AppText>
                </View>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color={colors.muted}
                />
              </View>
            </Touchable>
          ))}
        </View>

        <AppText variant="tiny" color={colors.muted} style={styles.footer}>
          INDEPENDENT REVIEWER · NOT AFFILIATED WITH CSC
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.line,
    marginHorizontal: spacing.md,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  sectionPill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: colors.ink,
  },
  standfirst: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkSoft,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: spacing.xs,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 27,
    fontFamily: READING_FONT,
    color: colors.ink,
  },
  subheading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.ink,
    marginTop: spacing.sm,
  },
  bullets: { gap: spacing.sm + 2 },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 11,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 27,
    fontFamily: READING_FONT,
    color: colors.ink,
  },
  callout: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  calloutBar: {
    width: 3,
    borderRadius: 2,
    alignSelf: "stretch",
  },
  calloutBody: { flex: 1, gap: 6 },
  calloutText: {
    fontSize: 14.5,
    lineHeight: 22,
    fontFamily: READING_FONT,
    color: colors.inkSoft,
  },
  bold: { fontWeight: "700" },
  italic: { fontStyle: "italic" },
  cta: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderColor: "#C9D6FA",
  },
  related: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  relatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  footer: {
    textAlign: "center",
    marginTop: spacing.xl,
    letterSpacing: 0.6,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },
});
