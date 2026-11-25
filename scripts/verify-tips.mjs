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

await page.goto(`${BASE}/tips`, { waitUntil: "domcontentloaded" });
await page.getByText("Tips & tricks").waitFor();
await page.waitForTimeout(600);

const library = await page.locator("body").innerText();
check("featured guide rendered", library.includes("FEATURED GUIDE"));
check("section groups rendered", ["VERBAL", "NUMERICAL", "GEN. INFO"].every((s) => library.includes(s)));
check("guide summaries rendered", library.includes("Three-pass method") || library.includes("pass method"));
check("old eyebrow label removed", !library.includes("STUDY LIBRARY"));
check("guide count moved to app bar", library.includes("8 GUIDES"));
await page.screenshot({ path: path.join(OUT, "v4-tips.png") });

// Search
await page.getByPlaceholder("Search guides").fill("filing");
await page.getByText("Filing rules that always appear").waitFor();
const searched = await page.locator("body").innerText();
check("search narrows results", searched.includes("Filing rules") && !searched.includes("Grammar traps"));
check("filter count appears", searched.includes("1 MATCHING GUIDE"));
await page.screenshot({ path: path.join(OUT, "v4-tips-search.png") });

await page.getByPlaceholder("Search guides").fill("");
await page.waitForTimeout(300);

// Filter chip
await page.getByRole("button", { name: "Numerical", exact: true }).click();
await page.waitForTimeout(400);
const filtered = await page.locator("body").innerText();
check("filter works", filtered.includes("Number series") && !filtered.includes("Grammar traps"));

await page.getByRole("button", { name: "All", exact: true }).click();
await page.waitForTimeout(400);

// Article
await page.getByText("Grammar traps that cost the most points").click();
await page.getByText("PUT IT TO PRACTICE").waitFor();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "v4-article.png") });

const article = await page.locator("body").innerText();
check("article meta rendered", article.includes("VERBAL") && article.includes("MIN READ"));
check("related guides rendered", article.includes("KEEP READING"));
check("practice CTA rendered", article.includes("PUT IT TO PRACTICE"));
check("raw markup removed", !article.includes("**") && !article.includes("_The box"));
check("subheading rendered", article.includes("Agreement rules"));
check("callout rendered", article.includes("The most common trap"));
check("italic example rendered", article.includes("The box of forms is on the table"));

await page.getByText("PUT IT TO PRACTICE").scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, "v4-article-bottom.png") });

// Header / app bar consistency
await page.goto(`${BASE}/home`, { waitUntil: "domcontentloaded" });
await page.getByText("Today's set").waitFor();
await page.waitForTimeout(500);
const home = await page.locator("body").innerText();
check("home app bar", home.includes("CSE Prep PH") && home.includes("close the gap"));
await page.screenshot({ path: path.join(OUT, "v4-home.png") });

await page.goto(`${BASE}/practice`, { waitUntil: "domcontentloaded" });
await page.getByText("Mixed practice").waitFor();
await page.waitForTimeout(600);
const practice = await page.locator("body").innerText();
check("practice header cleaned", practice.includes("Mixed practice") && !practice.includes("REVIEW"));
await page.screenshot({ path: path.join(OUT, "v4-practice.png") });

await page.goto(`${BASE}/mock`, { waitUntil: "domcontentloaded" });
await page.getByText("Full simulation").waitFor();
const mock = await page.locator("body").innerText();
check("mock header cleaned", mock.includes("Full simulation") && !mock.includes("SIMULATION"));
await page.waitForTimeout(800);
await page.screenshot({ path: path.join(OUT, "v4-mock.png") });

await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" });
await page.getByText("Settings").waitFor();
await page.waitForTimeout(600);
const profile = await page.locator("body").innerText();
check("profile header cleaned", profile.includes("Settings") && !profile.includes("YOU"));
await page.screenshot({ path: path.join(OUT, "v4-profile.png") });

await browser.close();

if (issues.length) {
  console.log("\nISSUES:");
  for (const issue of issues) console.log("-", issue);
  process.exitCode = 1;
} else {
  console.log("\nNo console errors or failed assertions.");
}
