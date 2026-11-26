import Constants from "expo-constants";
import { Platform } from "react-native";
import { QUESTION_BY_ID, topicName } from "@/lib/content";
import type { ReportRow } from "@/lib/db/types";

export const REPORT_EMAIL = "nikkorod04@gmail.com";

export interface ReportEmail {
  subject: string;
  body: string;
}

export function formatReportEmail(reports: ReportRow[]): ReportEmail {
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const subject = `CSE Prep PH content report — ${reports.length} item${
    reports.length === 1 ? "" : "s"
  }`;

  const lines = reports
    .map((report, index) => {
      const question = QUESTION_BY_ID.get(report.question_id);
      const where = question
        ? `${question.section} · ${topicName(question.section, question.topic)}`
        : "Unknown item";
      const flat = question?.stem.replace(/\s+/g, " ").trim() ?? "";
      const snippet = flat
        ? `\n   "${flat.length > 140 ? `${flat.slice(0, 140)}…` : flat}"`
        : "";

      return [
        `${index + 1}. ${report.question_id}`,
        `   ${where}`,
        `   Reason: ${report.reason}`,
        `   Reported: ${new Date(report.created_at).toLocaleString()}${snippet}`,
      ].join("\n");
    })
    .join("\n\n");

  const body = [
    "CSE Prep PH — content reports",
    `App version: ${version}`,
    `Platform: ${Platform.OS}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    lines,
    "",
    "Sent from the CSE Prep PH app.",
  ].join("\n");

  return { subject, body };
}
