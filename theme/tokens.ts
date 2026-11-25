export const colors = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  surfaceAlt: "#EDF1FA",
  ink: "#0B1B3A",
  inkSoft: "#41527A",
  muted: "#7B8AA8",
  line: "#DFE5F1",
  primary: "#1A46C4",
  primaryDark: "#0E2E8C",
  primarySoft: "#E4EBFD",
  gold: "#F2B01E",
  goldSoft: "#FFF4D6",
  success: "#0F7B4F",
  successSoft: "#DDF4E8",
  danger: "#C62828",
  dangerSoft: "#FDE4E4",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(11, 27, 58, 0.45)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const font = {
  display: 30,
  title: 22,
  heading: 18,
  body: 15,
  small: 13,
  tiny: 11,
} as const;

export const shadow = {
  card: {
    shadowColor: "#0B1B3A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  float: {
    shadowColor: "#0B1B3A",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
