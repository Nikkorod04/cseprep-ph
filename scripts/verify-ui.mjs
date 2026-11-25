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

// --- Onboarding interactions -------------------------------------------------
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.clear());
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.getByText("Set up your review").waitFor();

await page.getByText("Subprofessional", { exact: true }).first().click();
await page.getByText("30 items", { exact: true }).first().click();
await page.getByText(/Skip setup/).click();
await page.getByText("Today's set").waitFor();

const afterOnboarding = await page.locator("body").innerText();
check("onboarding track applied", afterOnboarding.includes("Subprofessional"));
check("onboarding goal applied", afterOnboarding.includes("Start 30 items"));

// --- Seed a professional session for the rest --------------------------------
await page.evaluate(() => {
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
  localStorage.setItem(
    "cseprep.bookmarks.web",
    JSON.stringify(["seed-verb-vocab-0223"]),
  );
});

await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
await page.getByText("Today's set").waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "v2-home.png") });

// --- Tab bar navigation -------------------------------------------------------
await page.getByRole("tab", { name: /Profile/ }).click();
await page.getByText("Settings").waitFor();
const profileText = await page.locator("body").innerText();
check("tab navigation works", profileText.includes("Settings"));
await page.getByRole("tab", { name: /Home/ }).click();
await page.getByText("Today's set").waitFor();

// --- Practice + study mode ----------------------------------------------------
await page.goto(`${BASE}/practice`, { waitUntil: "domcontentloaded" });
await page.getByText("Your library").waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "v2-practice.png") });

await page.getByLabel("Study Vocabulary").click();
await page.getByText("1 of 37").first().waitFor();
await page.getByText("Show answer", { exact: true }).click();
await page.getByText("Answer is", { exact: false }).first().waitFor();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "v2-study.png") });

await page.getByLabel("Bookmark this item").click();
const bookmarkLabel = await page
  .locator('[aria-label="Remove bookmark"]')
  .count();
check("bookmark toggles", bookmarkLabel === 1);

await page.getByText("Next item", { exact: true }).click();
await page.getByText("2 of 37").first().waitFor();
await page.getByText("Previous", { exact: true }).click();
await page.getByText("1 of 37").first().waitFor();
check("study next/prev works", true);

// --- Mock screen --------------------------------------------------------------
await page.goto(`${BASE}/mock`, { waitUntil: "domcontentloaded" });
await page.getByText("Full simulation").waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "v2-mock.png") });

await page.getByText("Start mock", { exact: false }).click();
await page.getByText("1 of 150").first().waitFor();
await page.evaluate(() => {
  const choices = [...document.querySelectorAll('[role="button"]')].filter(
    (el) => /^[ABCD]\n/.test(el.innerText),
  );
  choices[0]?.click();
});
await page.getByRole("button", { name: "Next item" }).click();
await page.getByText("2 of 150").first().waitFor();
check("mock selection advances", true);

// --- Full practice run to results --------------------------------------------
await page.goto(`${BASE}/practice`, { waitUntil: "domcontentloaded" });
await page.getByLabel("Practice Vocabulary").click();
await page.getByText("1 of 10").first().waitFor();

for (let i = 1; i <= 10; i += 1) {
  await page.evaluate(() => {
    const choices = [...document.querySelectorAll('[role="button"]')].filter(
      (el) => /^[ABCD]\n/.test(el.innerText),
    );
    choices[0]?.click();
  });
  await page.getByRole("button", { name: /Next item|Finish set/ }).click();
  if (i < 10) await page.getByText(`${i + 1} of 10`).first().waitFor();
}

await page.getByText("SESSION COMPLETE", { exact: false }).first().waitFor();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(OUT, "v2-results.png") });
check("results reached", true);

await browser.close();

if (issues.length) {
  console.log("\nISSUES:");
  for (const issue of issues) console.log("-", issue);
  process.exitCode = 1;
} else {
  console.log("\nNo console errors or failed assertions.");
}
