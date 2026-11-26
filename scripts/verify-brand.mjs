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

await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.clear());
await page.goto(BASE, { waitUntil: "domcontentloaded" });
await page.getByText("Set up your review").waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "v6-onboarding.png") });

await page.getByText(/Skip setup/).click();
await page.getByText("Today's set").waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(OUT, "v6-home.png") });

await page.goto(`${BASE}/profile`, { waitUntil: "domcontentloaded" });
await page.getByText("Settings").waitFor();
await page.getByText("About", { exact: true }).scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(OUT, "v6-profile-about.png") });

const body = await page.locator("body").innerText();
console.log(body.includes("CSE Prep PH") ? "PASS brand text" : "FAIL brand text");

await browser.close();

if (issues.length) {
  console.log("ISSUES:");
  for (const issue of issues) console.log("-", issue);
  process.exitCode = 1;
} else {
  console.log("No console errors.");
}
