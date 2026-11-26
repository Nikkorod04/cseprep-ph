import { Linking } from "react-native";
import type { ReportRow } from "@/lib/db/types";
import { formatReportEmail, REPORT_EMAIL } from "./reportFormat";

/** Web fallback: opens the default mail handler with everything prefilled. */
export async function sendReportEmail(reports: ReportRow[]): Promise<boolean> {
  if (reports.length === 0) return false;

  const { subject, body } = formatReportEmail(reports);
  const url = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
