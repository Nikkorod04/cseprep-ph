import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BannerSlot } from "@/components/ads/BannerSlot";
import { AppBar } from "./AppBar";
import { colors, spacing } from "@/theme/tokens";

interface Props {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  banner?: boolean;
  appBar?: string;
  appBarRight?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  banner = true,
  appBar,
  appBarRight,
  contentStyle,
}: Props) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [fade]);

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        padded && styles.pad,
        styles.grow,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, padded && styles.pad, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.root, appBar && styles.rootBar]}
      edges={["top"]}
    >
      {appBar ? <AppBar title={appBar} right={appBarRight} /> : null}
      <Animated.View
        style={[styles.fill, appBar && styles.contentBg, { opacity: fade }]}
      >
        {content}
      </Animated.View>
      {banner ? <BannerSlot /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  rootBar: { backgroundColor: colors.primary },
  contentBg: { backgroundColor: colors.bg },
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
  pad: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
});
