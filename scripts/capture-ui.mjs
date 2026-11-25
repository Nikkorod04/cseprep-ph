import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://localhost:8081";
const OUT = path.resolve("screenshots");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});

const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "en-PH",
});

const page = await context.newPage();
page.setDefaultTimeout(25000);

async function shot(name) {
  const file = path.join(OUT, name);
  await page.screenshot({ path: file });
  console.log("saved", name);
  return file;
}

async function open(route, waitText) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  if (waitText) await page.getByText(waitText, { exact: false }).first().waitFor();
  await page.waitForTimeout(700);
}

// Seed settings, a paused session, and two bookmarks so the screens look lived-in.
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
  localStorage.setItem(
    "cseprep.activeSession.v1",
    JSON.stringify({
      config: {
        id: "preview-session",
        mode: "practice",
        track: "professional",
        title: "Vocabulary",
        count: 10,
      },
      itemIds: [
        "seed-verb-vocab-0001",
        "seed-verb-vocab-0223",
        "seed-verb-vocab-0231",
        "seed-verb-vocab-0239",
        "seed-verb-vocab-0247",
        "seed-verb-vocab-0251",
        "seed-verb-vocab-0256",
        "seed-verb-vocab-0002",
        "seed-verb-vocab-0225",
        "seed-verb-vocab-0233",
      ],
      index: 2,
      answers: {},
      startedAt: Date.now() - 120000,
      savedAt: Date.now() - 45000,
    }),
  );
  localStorage.setItem(
    "cseprep.bookmarks.web",
    JSON.stringify(["seed-verb-vocab-0001", "seed-verb-vocab-0223"]),
  );
});

await open("/home", "Today's set");
await shot("01-home.png");

await open("/practice", "Your library");
await shot("02-practice.png");

await open("/practice", "Your library");
await page.getByLabel("Study Vocabulary").click();
await page.getByText("1 of 37").first().waitFor();
await page.getByText("Show answer", { exact: true }).click();
await page.getByText("Answer is", { exact: false }).first().waitFor();
await page.waitForTimeout(400);
await shot("03-study.png");

await open("/mock", "Full simulation");
await shot("04-mock.png");

await open("/practice", "Your library");
await page.getByLabel("Practice Vocabulary").click();
await page.getByText("1 of 10").first().waitFor();

for (let i = 1; i <= 10; i += 1) {
  await page.evaluate(() => {
    const choices = [...document.querySelectorAll('[role="button"]')].filter(
      (el) => /^[ABCD]\n/.test(el.innerText),
    );
    choices[0]?.click();
  });
  await page
    .getByRole("button", { name: /Next item|Finish set/ })
    .click();
  if (i < 10) {
    await page.getByText(`${i + 1} of 10`).first().waitFor();
  }
}

await page.getByText("SESSION COMPLETE", { exact: false }).first().waitFor();
await page.waitForTimeout(500);
await shot("05-results.png");

await browser.close();
console.log("done");
