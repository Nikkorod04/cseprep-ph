import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://localhost:8082";
const OUT = path.resolve("screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "en-PH",
});
const page = await context.newPage();
page.setDefaultTimeout(25000);

const issues = [];
page.on("console", (msg) => {
  if (msg.type() === "error") issues.push(`console: ${msg.text()}`);
});
page.on("pageerror", (err) => issues.push(`pageerror: ${err.message}`));

function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) issues.push(`assert: ${label}`);
}

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.evaluate(() => {
  localStorage.clear();
  localStorage.setItem(
    "cseprep.settings.v1",
    JSON.stringify({
      onboarded: true,
      track: "professional",
      examDate: "2027-03-14",
      dailyGoal: 10,
      remindersEnabled: false,
      reminderHour: 19,
    }),
  );
});

// --- Daily challenge ---------------------------------------------------------
await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
await page.getByText("Today's set").waitFor();
await page.waitForTimeout(500);
const home = await page.locator("body").innerText();
check("daily card rendered", home.includes("DAILY CHALLENGE") && home.includes("10 mixed items"));
await page.screenshot({ path: path.join(OUT, "v5-home-daily.png") });

await page.getByRole("button", { name: "Start", exact: true }).click();
await page.getByText("1 of 10").first().waitFor();
const dailySession = await page.locator("body").innerText();
check("daily session starts", dailySession.includes("Daily challenge"));

const queue = `(() => {
  const choices = [...document.querySelectorAll('[role="button"]')].filter(
    (el) => /^[ABCD]\\n/.test(el.innerText),
  );
  choices[0]?.click();
  let tries = 0;
  const timer = setInterval(() => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      /Next item|Finish set/.test(b.innerText),
    );
    if (btn && !btn.disabled) { btn.click(); clearInterval(timer); }
    if (++tries > 80) clearInterval(timer);
  }, 30);
  return 'queued';
})()`;

for (let i = 1; i <= 10; i += 1) {
  await page.evaluate(queue);
  if (i < 10) {
    await page.getByText(`${i + 1} of 10`).first().waitFor();
  }
}

await page.getByText("DAILY CHALLENGE COMPLETE").waitFor();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "v5-daily-results.png") });
check("daily results header", true);

await page.getByText("Back to home", { exact: true }).click();
await page.getByText("Completed today").waitFor();
const completedHome = await page.locator("body").innerText();
check("daily completion persists", completedHome.includes("Completed today"));
check("daily score shown", /\d+ of 10/.test(completedHome));

// --- Report item -------------------------------------------------------------
await page.goto(`${BASE}/practice`, { waitUntil: "domcontentloaded" });
await page.getByText("Mixed practice").waitFor();
await page.getByLabel("Practice Vocabulary").click();
await page.getByText("1 of 10").first().waitFor();

await page.getByLabel("Report this item").click();
await page.getByText("What is wrong with it?").waitFor();
await page.getByText("Wrong answer key", { exact: true }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(OUT, "v5-report-sheet.png") });
await page.getByRole("button", { name: "Submit report" }).click();

await page.getByLabel("Reported. Report this item again").waitFor();
check("flag updates after report", true);

await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" });
await page.getByText("Content reports").waitFor();
const profile = await page.locator("body").innerText();
check("report listed in profile", profile.includes("Wrong answer key"));
check("report count shown", profile.includes("Reported items"));
check("email action shown", profile.includes("Email report"));
await page.getByText("Content reports").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "v5-profile-reports.png") });

await browser.close();

if (issues.length) {
  console.log("\nISSUES:");
  for (const issue of issues) console.log("-", issue);
  process.exitCode = 1;
} else {
  console.log("\nNo console errors or failed assertions.");
}
