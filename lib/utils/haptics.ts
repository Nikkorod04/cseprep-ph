import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export type HapticKind =
  | "none"
  | "light"
  | "medium"
  | "select"
  | "success"
  | "warning"
  | "error";

/** Fire-and-forget haptics that never break the UI on unsupported devices. */
export function tapFeedback(kind: HapticKind = "light"): void {
  if (Platform.OS === "web" || kind === "none") return;

  let action: Promise<void>;
  switch (kind) {
    case "select":
      action = Haptics.selectionAsync();
      break;
    case "success":
      action = Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
      break;
    case "warning":
      action = Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning,
      );
      break;
    case "error":
      action = Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error,
      );
      break;
    case "medium":
      action = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case "light":
    default:
      action = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  void action.catch(() => undefined);
}
