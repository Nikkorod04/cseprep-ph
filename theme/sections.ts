import type { Ionicons } from "@expo/vector-icons";
import type { SectionId } from "@/lib/content/types";

type IconName = keyof typeof Ionicons.glyphMap;

export interface SectionStyle {
  icon: IconName;
  color: string;
  soft: string;
}

export const SECTION_STYLE: Record<SectionId, SectionStyle> = {
  verbal: { icon: "book-outline", color: "#1A46C4", soft: "#E4EBFD" },
  numerical: { icon: "calculator-outline", color: "#0F7B4F", soft: "#DDF4E8" },
  analytical: { icon: "git-network-outline", color: "#7C3AED", soft: "#F0E9FE" },
  clerical: { icon: "folder-open-outline", color: "#B45309", soft: "#FEF0DC" },
  "general-info": { icon: "flag-outline", color: "#B91C1C", soft: "#FDE4E4" },
};
