import { Linking } from "react-native";
import type { ReportRow } from "@/lib/db/types";
import { formatReportEmail, REPORT_EMAIL } from "./reportFormat";

type MailComposerModule = typeof import("expo-mail-composer");

let cached: MailComposerModule | null | undefined;

function getComposer(): MailComposerModule | null {
  if (cached !== undefined) return cached;
  try {
    cached = require("expo-mail-composer") as MailComposerModule;
  } catch {
    cached = null;
  }
  return cached;
}

/**
 * Opens a prefilled email in the user's mail app. Nothing is sent until the
 * user taps Send. Falls back to a mailto: link if no composer is available.
 */
export async function sendReportEmail(reports: ReportRow[]): Promise<boolean> {
  if (reports.length === 0) return false;

  const { subject, body } = formatReportEmail(reports);

  try {
    const composer = getComposer();
    if (composer && (await composer.isAvailableAsync())) {
      await composer.composeAsync({
        recipients: [REPORT_EMAIL],
        subject,
        body,
      });
      return true;
    }
  } catch {
    // Fall through to mailto.
  }

  try {
    const url = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
