import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { Touchable } from "@/components/ui/Touchable";
import { TIPS, SECTION_BY_ID } from "@/lib/content";
import type { TipArticle } from "@/lib/content/types";
import { SECTION_STYLE } from "@/theme/sections";
import { colors, radius, spacing } from "@/theme/tokens";

type FilterKey = "all" | TipArticle["section"];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "general", label: "General" },
  { key: "verbal", label: "Verbal" },
  { key: "numerical", label: "Numerical" },
  { key: "analytical", label: "Analytical" },
  { key: "clerical", label: "Clerical" },
  { key: "general-info", label: "Gen. Info" },
];

const GROUP_ORDER: TipArticle["section"][] = [
  "verbal",
  "numerical",
  "analytical",
  "clerical",
  "general-info",
  "general",
];

function styleFor(section: TipArticle["section"]) {
  return section === "general"
    ? {
        icon: "creation-outline" as const,
        color: colors.primary,
        soft: colors.primarySoft,
      }
    : SECTION_STYLE[section];
}

function sectionShort(section: TipArticle["section"]): string {
  return section === "general"
    ? "General"
    : SECTION_BY_ID.get(section)?.short ?? section;
}

export default function TipsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TIPS.filter((tip) => {
      if (filter !== "all" && tip.section !== filter) return false;
      if (!q) return true;
      return `${tip.title} ${tip.summary}`.toLowerCase().includes(q);
    });
  }, [query, filter]);

  const featured = TIPS[0];
  const showFeatured = Boolean(featured) && filter === "all" && !query.trim();
  const rest = filtered.filter(
    (tip) => !showFeatured || tip.slug !== featured?.slug,
  );

  const groups = GROUP_ORDER.map((key) => ({
    key,
    label: sectionShort(key),
    items: rest.filter((tip) => tip.section === key),
  })).filter((group) => group.items.length > 0);

  const isFiltering = filter !== "all" || query.trim().length > 0;
  const shownCount = isFiltering ? filtered.length : TIPS.length;
  const webInput =
    Platform.OS === "web"
      ? ({ outlineStyle: "none" } as unknown as TextStyle)
      : undefined;

  function reset() {
    setQuery("");
    setFilter("all");
  }

  return (
    <Screen
      appBar="Tips & tricks"
      appBarRight={
        <View style={styles.countPill}>
          <AppText variant="tiny" color={colors.white}>
            {TIPS.length} GUIDES
          </AppText>
        </View>
      }
    >

      <View style={styles.search}>
        <MaterialCommunityIcons name="magnify" size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search guides"
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, webInput]}
          selectionColor={colors.primary}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query ? (
          <Touchable
            onPress={() => setQuery("")}
            haptic="light"
            scaleTo={0.85}
            style={styles.clearBtn}
            accessibilityLabel="Clear search"
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.muted} />
          </Touchable>
        ) : null}
      </View>

      <View style={[styles.filters, isFiltering && styles.filtersTight]}>
        {FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={filter === item.key}
            onPress={() => setFilter(item.key)}
          />
        ))}
      </View>

      {isFiltering ? (
        <AppText variant="tiny" color={colors.muted} style={styles.resultLine}>
          {shownCount} MATCHING {shownCount === 1 ? "GUIDE" : "GUIDES"}
        </AppText>
      ) : null}

      {showFeatured && featured ? (
        <Touchable
          onPress={() => router.push(`/tips/${featured.slug}`)}
          haptic="select"
          scaleTo={0.98}
        >
          <LinearGradient
            colors={[colors.ink, "#173264"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featured}
          >
            <View style={styles.featuredTop}>
              <View style={styles.featuredIcon}>
                <MaterialCommunityIcons name="flash" size={17} color={colors.gold} />
              </View>
              <AppText variant="tiny" color={colors.gold}>
                FEATURED GUIDE
              </AppText>
              <View style={{ flex: 1 }} />
              <AppText variant="tiny" color="rgba(255,255,255,0.55)">
                {featured.minutes} MIN
              </AppText>
            </View>
            <AppText
              variant="title"
              color={colors.white}
              style={styles.featuredTitle}
            >
              {featured.title}
            </AppText>
            <AppText variant="small" color="rgba(255,255,255,0.72)">
              {featured.summary}
            </AppText>
            <View style={styles.featuredCta}>
              <AppText variant="label" color={colors.gold}>
                Read guide
              </AppText>
              <MaterialCommunityIcons name="arrow-right" size={15} color={colors.gold} />
            </View>
          </LinearGradient>
        </Touchable>
      ) : null}

      {groups.map((group) => (
        <View key={group.key} style={styles.group}>
          <View style={styles.groupHead}>
            <AppText variant="tiny" color={colors.muted}>
              {group.label.toUpperCase()}
            </AppText>
            <View style={styles.rule} />
            <AppText variant="tiny" color={colors.muted}>
              {group.items.length}
            </AppText>
          </View>

          <View style={styles.list}>
            {group.items.map((tip) => {
              const style = styleFor(tip.section);
              return (
                <Touchable
                  key={tip.slug}
                  onPress={() => router.push(`/tips/${tip.slug}`)}
                  haptic="select"
                  scaleTo={0.99}
                >
                  <Card style={styles.row}>
                    <View
                      style={[styles.rowIcon, { backgroundColor: style.soft }]}
                    >
                      <MaterialCommunityIcons
                        name={style.icon}
                        size={19}
                        color={style.color}
                      />
                    </View>
                    <View style={styles.rowBody}>
                      <AppText variant="label" style={styles.rowTitle}>
                        {tip.title}
                      </AppText>
                      <AppText
                        variant="small"
                        color={colors.muted}
                        numberOfLines={2}
                      >
                        {tip.summary}
                      </AppText>
                      <AppText variant="tiny" color={style.color}>
                        {tip.minutes} MIN READ
                      </AppText>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={17}
                      color={colors.muted}
                    />
                  </Card>
                </Touchable>
              );
            })}
          </View>
        </View>
      ))}

      {groups.length === 0 ? (
        <Card style={styles.empty}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
          </View>
          <AppText variant="heading">No guides found</AppText>
          <AppText variant="small" color={colors.muted} style={{ textAlign: "center" }}>
            Try a different word, or clear the filters.
          </AppText>
          <Button
            label="Clear filters"
            variant="secondary"
            full={false}
            onPress={reset}
          />
        </Card>
      ) : null}

      <AppText variant="tiny" color={colors.muted} style={styles.footer}>
        ORIGINAL GUIDES · UPDATED NOV 2026
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  countPill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 46,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
    paddingVertical: 0,
  },
  clearBtn: { padding: spacing.xs },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filtersTight: { marginBottom: spacing.sm },
  resultLine: {
    marginBottom: spacing.md,
    letterSpacing: 0.6,
  },
  featured: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featuredTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featuredIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: "rgba(242,176,30,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTitle: { fontSize: 23, letterSpacing: -0.4 },
  featuredCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  group: { marginBottom: spacing.lg },
  groupHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  list: { gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 15 },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    textAlign: "center",
    marginTop: spacing.lg,
    letterSpacing: 0.6,
  },
});
