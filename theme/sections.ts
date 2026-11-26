import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { SectionId } from "@/lib/content/types";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface SectionStyle {
  icon: IconName;
  color: string;
  soft: string;
}

export const SECTION_STYLE: Record<SectionId, SectionStyle> = {
  verbal: { icon: "book-open-page-variant-outline", color: "#1A46C4", soft: "#E4EBFD" },
  numerical: { icon: "calculator-variant-outline", color: "#0F7B4F", soft: "#DDF4E8" },
  analytical: { icon: "chart-box-outline", color: "#7C3AED", soft: "#F0E9FE" },
  clerical: { icon: "file-cabinet", color: "#B45309", soft: "#FEF0DC" },
  "general-info": { icon: "earth", color: "#B91C1C", soft: "#FDE4E4" },
};
