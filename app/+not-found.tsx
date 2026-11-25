import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/theme/tokens";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={styles.root}>
        <AppText variant="title">Screen not found</AppText>
        <AppText variant="small" color={colors.muted} style={{ textAlign: "center" }}>
          The link may be from an older content version.
        </AppText>
        <Link href="/home" style={styles.link}>
          <AppText variant="label" color={colors.primary}>
            Back to home
          </AppText>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  link: { marginTop: spacing.md },
});
