import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { colors, font } from "@/theme/tokens";

type Variant =
  | "display"
  | "title"
  | "heading"
  | "body"
  | "small"
  | "tiny"
  | "label"
  | "mono";

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontSize: font.display, fontWeight: "800", letterSpacing: -0.8 },
  title: { fontSize: font.title, fontWeight: "700", letterSpacing: -0.3 },
  heading: { fontSize: font.heading, fontWeight: "700" },
  body: { fontSize: font.body, fontWeight: "400", lineHeight: 23 },
  small: { fontSize: font.small, fontWeight: "400", lineHeight: 19 },
  tiny: { fontSize: font.tiny, fontWeight: "700", letterSpacing: 0.6 },
  label: { fontSize: font.small, fontWeight: "700", letterSpacing: 0.1 },
  mono: { fontSize: 17, fontWeight: "700", fontVariant: ["tabular-nums"] },
};

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

export function AppText({
  variant = "body",
  color = colors.ink,
  style,
  ...rest
}: Props) {
  return (
    <Text {...rest} style={[VARIANTS[variant], { color }, style]} />
  );
}

export const textStyles = StyleSheet.create({});
