import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Touchable } from "@/components/ui/Touchable";
import { colors, radius, spacing } from "@/theme/tokens";

const EFFECTIVE = "November 26, 2026";
const EMAIL = "nikkorod04@gmail.com";
const GOOGLE_ADS_POLICY = "https://policies.google.com/technologies/ads";

export default function LegalScreen() {
  const router = useRouter();

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
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={colors.ink}
          />
        </Touchable>
        <AppText variant="heading">Privacy & legal</AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={24}
              color={colors.primary}
            />
          </View>
          <AppText variant="title">Your data stays yours.</AppText>
          <AppText variant="small" color={colors.muted}>
            Privacy Policy · Effective {EFFECTIVE}
          </AppText>
        </View>

        <Card style={styles.summaryCard}>
          <AppText variant="heading">At a glance</AppText>
          <Bullet>
            <Bold>No account.</Bold> CSE Prep PH does not ask for your name,
            email, or sign-up.
          </Bullet>
          <Bullet>
            <Bold>Your progress stays on your phone.</Bold> Attempts, settings,
            bookmarks, and reports are stored locally.
          </Bullet>
          <Bullet>
            <Bold>Ads come from Google AdMob.</Bold> The app requests
            non-personalized ads. Google may process device and ad data under
            its own policy.
          </Bullet>
          <Bullet>
            <Bold>No sale of personal data.</Bold> We do not sell your
            information.
          </Bullet>
        </Card>

        <Section title="What is stored on your phone">
          <Body>
            The app keeps your track, exam date, daily goal, practice and mock
            attempts, answers, scores, study time, streak, bookmarks, daily
            challenge, and content reports in on-device storage. This data powers
            the reviewer and is not uploaded to a CSE Prep PH server.
          </Body>
        </Section>

        <Section title="Ads and Google AdMob">
          <Body>
            The app displays ads through Google AdMob. Google and its partners
            may collect device identifiers (including the advertising ID), IP
            address, approximate location, and ad interactions or diagnostics to
            deliver and measure ads.
          </Body>
          <Body>
            The app currently requests <Bold>non-personalized ads</Bold>. Your
            answers, bookmarks, and reports are not passed to AdMob.
          </Body>
          <LinkRow
            icon="open-in-new"
            label="Google's ad privacy policy"
            url={GOOGLE_ADS_POLICY}
          />
          <Body>
            If an optional paid <Bold>Remove ads</Bold> unlock is offered, Google
            Play processes the payment. The app receives only whether the unlock
            is active, never your card or bank details.
          </Body>
        </Section>

        <Section title="Content reports and email">
          <Body>
            If you flag a question, the report is saved on your device. Tapping
            Email report opens your mail app with a prefilled message; nothing is
            sent until you tap Send. A report includes the question ID, section,
            topic, reason, and the short question text you chose to include. It is
            used to correct content.
          </Body>
        </Section>

        <Section title="Notifications">
          <Body>
            If you enable the daily reminder, the app schedules a local
            notification on your phone. There is no push-notification server.
          </Body>
        </Section>

        <Section title="What we do not collect">
          <Body>
            No account, name, email address, phone number, or contacts. No precise
            GPS location. No access to photos, files, microphone, or camera. No
            study answers sent to a CSE Prep PH server. No third-party analytics or
            crash-reporting SDK at this time.
          </Body>
        </Section>

        <Section title="Deleting your data">
          <Bullet>Reset progress in Profile removes attempts and mock results.</Bullet>
          <Bullet>Clear reports removes saved content reports.</Bullet>
          <Bullet>Uninstalling the app removes all local app data.</Bullet>
          <Body>
            Google retains ad data according to its own policies. Email you sent
            can be deleted on request.
          </Body>
        </Section>

        <Section title="Children">
          <Body>
            CSE Prep PH is intended for people preparing for the Civil Service
            Examination, generally adults 18 and older. It is not directed to
            children under 13. If you are under 18, please use it with a parent or
            guardian.
          </Body>
        </Section>

        <Section title="Your rights under RA 10173">
          <Body>
            The Data Privacy Act of 2012 gives you rights to be informed, object,
            access, correct, and erase personal data. Because the app has no
            account and keeps study data on your device, most choices are
            available directly in the app. For email correspondence, contact us.
          </Body>
        </Section>

        <Section title="Changes">
          <Body>
            This policy may change as the app changes. The effective date above
            will be updated, and material changes will be reflected in the app or
            store listing.
          </Body>
        </Section>

        <Section title="Disclaimer">
          <Body>
            CSE Prep PH is an independent reviewer. It is not affiliated with,
            endorsed by, or connected to the Civil Service Commission. All
            practice items are original. Exam formats, schedules, and coverage can
            change; confirm details in the official CSC announcement. The app is a
            study aid and does not guarantee a passing score. General Information
            content is for review, not legal advice.
          </Body>
        </Section>

        <Card style={styles.contactCard}>
          <AppText variant="heading">Contact</AppText>
          <AppText variant="small" color={colors.muted}>
            Questions about this policy or your data:
          </AppText>
          <Touchable
            onPress={() => void Linking.openURL(`mailto:${EMAIL}`)}
            haptic="light"
            scaleTo={0.98}
            style={styles.contactRow}
            accessibilityLabel={`Email ${EMAIL}`}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={18}
              color={colors.primary}
            />
            <AppText variant="label" color={colors.primary}>
              {EMAIL}
            </AppText>
            <View style={{ flex: 1 }} />
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={colors.muted}
            />
          </Touchable>
        </Card>

        <AppText variant="tiny" color={colors.muted} style={styles.footer}>
          CSE Prep PH · Privacy & legal · {EFFECTIVE}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      {children}
    </Card>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <AppText variant="small" color={colors.inkSoft} style={styles.body}>
      {children}
    </AppText>
  );
}

function Bold({ children }: { children: ReactNode }) {
  return <AppText variant="small" style={styles.bold}>{children}</AppText>;
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <AppText variant="small" color={colors.inkSoft} style={styles.bulletText}>
        {children}
      </AppText>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  url,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  url: string;
}) {
  return (
    <Touchable
      onPress={() => void Linking.openURL(url)}
      haptic="light"
      scaleTo={0.98}
      style={styles.linkRow}
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={16} color={colors.primary} />
      <AppText variant="label" color={colors.primary}>
        {label}
      </AppText>
    </Touchable>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  summaryCard: {
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderColor: "#C9D6FA",
  },
  section: { gap: spacing.sm },
  body: { lineHeight: 21 },
  bold: { fontWeight: "700", color: colors.ink },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  bulletText: { flex: 1, lineHeight: 21 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  contactCard: { gap: spacing.sm },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  footer: {
    textAlign: "center",
    paddingVertical: spacing.md,
  },
});
