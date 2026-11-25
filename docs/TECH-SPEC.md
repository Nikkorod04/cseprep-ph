# CSE Prep PH — Technical Spec

Implementation reference. Pairs with `PLAN.md` and `docs/CONTENT-BLUEPRINT.md`.

---

## 1. Stack (verified current, Nov 2026)

| Package | Version | Note |
|---|---|---|
| `expo` | 58.0.x | SDK 58 stable |
| `expo-router` | 58.0.x | File-based routing |
| `react-native-google-mobile-ads` | ^17.4 | AdMob, ships an Expo config plugin |
| `expo-sqlite` | 58.0.x | Attempts, sessions, mock results |
| `expo-dev-client` | 58.0.x | **Required** for ads |
| `react-native-reanimated` | ^4.8 | Progress rings, transitions |
| `zustand` | ^5 | Session + settings state |
| `zod` | ^4 | Content validation at build time |

```
Typescript strict · Expo Router · Zustand + AsyncStorage · expo-sqlite · AdMob · EAS Build · Android first
```

---

## 2. Project setup

```bash
# 1. Scaffold (blank TypeScript + Router template)
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-router react-native-safe-area-context react-native-screens \
  expo-linking expo-constants expo-status-bar expo-sqlite expo-notifications \
  expo-haptics expo-linear-gradient react-native-reanimated \
  @react-native-async-storage/async-storage expo-dev-client

# 2. JS deps
npm i zustand zod
npm i react-native-google-mobile-ads

# 3. Run in Expo Go while building UI
npx expo start

# 4. First real build (ads + notifications) — needs Android Studio/SDK
npx expo run:android
```

`package.json` → `"main": "expo-router/entry"`.

**Critical:** `react-native-google-mobile-ads` calls native code at import time and **crashes in Expo Go**. Keep every import of it behind the guard in §8.

---

## 3. Folder structure

```
app/
  _layout.tsx                 # root stack, providers, font load
  (tabs)/
    _layout.tsx               # 5 tabs
    index.tsx                 # Home
    practice.tsx              # Section → subtopic picker
    mock.tsx                  # Mock list
    tips.tsx                  # Tips index
    profile.tsx               # Stats, error log, settings
  onboarding/
    index.tsx                 # track
    exam-date.tsx
    goal.tsx
    diagnostic.tsx
  session/[id].tsx            # Quiz runner (no tab bar)
  session/[id]/results.tsx
  mock/[id]/review.tsx
  tips/[slug].tsx
  legal/[doc].tsx

components/
  quiz/QuestionCard.tsx
  quiz/ChoiceButton.tsx
  quiz/ExplanationCard.tsx
  quiz/TimerBar.tsx
  quiz/ProgressHeader.tsx
  stats/AccuracyRing.tsx
  stats/TopicBar.tsx
  ads/BannerSlot.tsx
  ads/RewardedButton.tsx
  ui/{Button,Card,Sheet,EmptyState,Skeleton}.tsx

lib/
  db/{index,schema,migrations}.ts
  content/{load,types,validate}.ts
  quiz/{engine,scoring,selector}.ts
  analytics/weakness.ts
  ads/{config,interstitial,rewarded,banner}.tsx
  store/{settings,progress,onboarding}.ts
  notifications/reminders.ts
  share/resultCard.ts

assets/content/v1/
  verbal.json  numerical.json  analytical.json  clerical.json  general-info.json
  tips.json    plans.json

scripts/
  validate-content.ts
  content-stats.ts
```

---

## 4. app.json

```json
{
  "expo": {
    "name": "Lingkod CSE",
    "slug": "lingkod-cse",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "lingkodcse",
    "newArchEnabled": true,
    "userInterfaceStyle": "automatic",
    "android": {
      "package": "ph.lingkod.cse",
      "versionCode": 1,
      "permissions": ["POST_NOTIFICATIONS"]
    },
    "ios": {
      "bundleIdentifier": "ph.lingkod.cse",
      "supportsTablet": false
    },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      "expo-notifications",
      "expo-build-properties",
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713",
          "iosAppId": "ca-app-pub-3940256099942544~1458002511",
          "userTrackingUsageDescription": "This identifier is used to show relevant ads. You can opt out anytime."
        }
      ]
    ]
  }
}
```

The IDs above are **Google's sample app IDs** — safe for development. Replace with yours for production, and keep real unit IDs behind `__DEV__` checks / `TestIds`.

`eas.json`:

```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  },
  "submit": { "production": {} }
}
```

---

## 5. Content strategy (important)

**Questions live in bundled JSON, not in SQLite.** 900+ items re-seeded on every update is slow and risks wiping progress. Only user data goes in SQLite.

- JSON imported at build time, indexed into a `Map<id, Question>` on first render.
- `assets/content/vN/` versioned; bump `contentVersion` when items change.
- OTA (`eas update`) ships new JSON without a store review.
- Content updates must never change a question's `id` — progress is keyed by it. Edit → bump `version`, keep `id`.

---

## 6. SQLite schema

```ts
// lib/db/schema.ts
export const SCHEMA = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,          -- practice | timed | mock | drill | diagnostic
  track TEXT NOT NULL,         -- professional | subprofessional
  section TEXT,
  topic TEXT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  total INTEGER NOT NULL,
  correct INTEGER,
  duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  section TEXT NOT NULL,       -- denormalized for fast weakness queries
  topic TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  selected TEXT,
  correct INTEGER NOT NULL,
  ms INTEGER NOT NULL,
  mode TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attempts_topic ON attempts(topic, created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_question ON attempts(question_id);

CREATE TABLE IF NOT EXISTS bookmarks (
  question_id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS mock_results (
  id TEXT PRIMARY KEY,
  track TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER NOT NULL,
  rating REAL NOT NULL,        -- 0..100
  passed INTEGER NOT NULL,
  breakdown TEXT NOT NULL      -- JSON: [{section, correct, total, avgMs}]
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id TEXT NOT NULL,
  reason TEXT,
  created_at INTEGER NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0
);
`;
```

**Weakest-3 query:**

```sql
SELECT topic, section, COUNT(*) AS n, AVG(correct) AS acc, AVG(ms) AS avg_ms
FROM attempts
WHERE created_at >= ?
GROUP BY topic
HAVING n >= 5
ORDER BY acc ASC, n DESC
LIMIT 3;
```

**Mastery per topic:** weighted recent accuracy, last 50 attempts, exponential decay (newer attempts weigh more). Display as 0–100 on the subtopic list.

---

## 7. Quiz engine

State machine — keep it pure and testable, no ads or navigation inside.

```ts
type Phase = "answering" | "feedback" | "done";

interface QuizState {
  phase: Phase;
  index: number;
  answers: Record<string, "A" | "B" | "C" | "D">;
  startedAt: number;
  itemStartedAt: number;
  elapsedMs: number;
}

type Action =
  | { type: "SELECT"; key: "A" | "B" | "C" | "D"; instant: boolean }
  | { type: "NEXT" }
  | { type: "TICK"; ms: number }
  | { type: "FINISH" };
```

Rules:
- `instant: true` (practice) → show explanation immediately, then "Next".
- `instant: false` (mock) → record, advance, no feedback until the end.
- Timed sessions: one interval at the session level (`TICK` every 250 ms), not one per item.
- Persist in-progress session to AsyncStorage on every answer so a crash/background doesn't lose a mock.
- Auto-submit on timer expiry; never lose answered items.

**Scoring**

```ts
const rating = (correct / total) * 100;
const passed = rating >= 80;
```

Display: `78.67%` + "17 correct short of 80%" (Professional: `Math.ceil(0.8 * 150) - correct`).

**Section timer split (mock)**

| Section | Professional | Subprofessional |
|---|---|---|
| Verbal | 57 min / 50 items | 55 min / 50 |
| Numerical | 45 min / 40 | 44 min / 40 |
| Analytical | 45 min / 40 | — |
| Clerical | — | 39 min / 35 |
| General Info | 23 min / 20 | 22 min / 20 |

Timer behavior: section timer counts down; when it hits 0, lock that section and auto-advance. Total session timer is the backstop.

**Adaptive selector (P1)**

```
rolling accuracy ≥ 0.80 → difficulty 3
0.50 – 0.79            → difficulty 2
< 0.50                 → difficulty 1
```

Pick unseen items first (`question_id NOT IN attempts`), then least-recently-seen. Never repeat an item within a session.

---

## 8. Ads integration

### Guard (required)

```ts
// lib/ads/config.ts
import Constants from "expo-constants";

export const IS_EXPO_GO =
  Constants.executionEnvironment === "storeClient";

export const ADS_READY = !IS_EXPO_GO;

export const UNITS = __DEV__
  ? { banner: TestIds.BANNER, interstitial: TestIds.INTERSTITIAL, rewarded: TestIds.REWARDED }
  : {
      banner: process.env.EXPO_PUBLIC_AD_BANNER!,
      interstitial: process.env.EXPO_PUBLIC_AD_INTERSTITIAL!,
      rewarded: process.env.EXPO_PUBLIC_AD_REWARDED!,
    };
```

### Banner

```tsx
// components/ads/BannerSlot.tsx
import { View } from "react-native";
import { ADS_READY } from "@/lib/ads/config";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BannerSlot({ unitId }: { unitId: string }) {
  const insets = useSafeAreaInsets();
  if (!ADS_READY) return null;          // Expo Go: renders nothing, no crash
  return (
    <View style={{ paddingBottom: insets.bottom }}>
      <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
```

> If a static import still crashes Expo Go on your SDK, move `react-native-google-mobile-ads` behind `require()` inside a `try/catch` in a module that is only called when `ADS_READY` is true.

### Interstitial with frequency cap

```ts
// lib/ads/interstitial.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import { ADS_READY, UNITS } from "./config";

const LAST_KEY = "ads:lastInterstitial";
const COUNT_KEY = "ads:interstitialCount";
const COOLDOWN_MS = 3 * 60 * 1000;
const DAILY_CAP = 3;

let ad: InterstitialAd | null = null;
let loaded = false;

export function preloadInterstitial() {
  if (!ADS_READY) return;
  ad = InterstitialAd.createForAdRequest(UNITS.interstitial, {
    requestNonPersonalizedAdsOnly: true,
  });
  ad.addAdEventListener(AdEventType.LOADED, () => { loaded = true; });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    loaded = false;
    preloadInterstitial();
  });
  ad.load();
}

export async function maybeShowInterstitial() {
  if (!ADS_READY || !loaded || !ad) return false;

  const [last, countRaw, dayRaw] = await Promise.all([
    AsyncStorage.getItem(LAST_KEY),
    AsyncStorage.getItem(COUNT_KEY),
    AsyncStorage.getItem(COUNT_KEY + ":day"),
  ]);

  const today = new Date().toDateString();
  const count = dayRaw === today ? Number(countRaw ?? 0) : 0;

  if (count >= DAILY_CAP) return false;
  if (Date.now() - Number(last ?? 0) < COOLDOWN_MS) return false;

  await AsyncStorage.multiSet([
    [LAST_KEY, String(Date.now())],
    [COUNT_KEY, String(count + 1)],
    [COUNT_KEY + ":day", today],
  ]);

  ad.show();
  return true;
}
```

Call `maybeShowInterstitial()` **only** on: mock results screen mount, and after every 3rd practice session completes. Never on app launch, never inside a quiz, never immediately after install.

### Rewarded

```ts
// "Watch a short ad to unlock 10 more questions"
RewardedAd.createForAdRequest(UNITS.rewarded);
// on AdEventType.EARNED_REWARD → grant 10 bonus items, persist with today's date
```

Cap: 3 rewarded unlocks/day. Label the button honestly ("Watch ad · +10 items").

### Placement rules

| Screen | Ad |
|---|---|
| Home | Banner (bottom) |
| Practice list | none |
| Quiz runner | **none** |
| Session results | Banner |
| Mock results | Banner + interstitial (capped) |
| Tips index / article | Banner |
| Profile | none |
| Rewarded | button, user-initiated only |

---

## 9. Notifications

```ts
import * as Notifications from "expo-notifications";

await Notifications.requestPermissionsAsync();

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Oras na para mag-review",
    body: "10 items lang. Kaya mo 'yan.",
    data: { route: "/practice" },
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: 19,
    minute: 0,
  },
});
```

- One daily reminder, user-set time, default 7:00 PM.
- Skip the reminder if the daily goal is already met (check on app foreground; cancel/reschedule).
- Local notifications only — no push server.
- Android 13+ needs `POST_NOTIFICATIONS` (already in `app.json`).

---

## 10. Content validation script

`npm run content:check`

```ts
// scripts/validate-content.ts
import { z } from "zod";
import { readFileSync, readdirSync } from "node:fs";

const Choice = z.object({ key: z.enum(["A", "B", "C", "D"]), text: z.string().min(1) });

const Question = z.object({
  id: z.string().regex(/^[a-z]{4}-[a-z]+-[a-z]+-\d{4}$/),
  tracks: z.array(z.enum(["professional", "subprofessional"])).min(1),
  section: z.enum(["verbal", "numerical", "analytical", "clerical", "general-info"]),
  topic: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  stem: z.string().min(10),
  choices: z.array(Choice).length(4),
  answer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(10).max(400),
  tip: z.string().optional(),
  version: z.number().int().positive(),
  reviewedAt: z.string(),
});

// Checks: unique ids, unique stems, answer key exists in choices,
// explanation ≤ 60 words, difficulty distribution, answer-letter balance.
// Exit code 1 on any failure → blocks the build.
```

Run in CI/pre-commit so a malformed item never ships.

---

## 11. Key implementation notes

**Home screen** — read one aggregate query, not five:
```sql
SELECT COUNT(*) AS total,
       SUM(correct) AS correct,
       MAX(created_at) AS last_at
FROM attempts WHERE created_at >= ?;
```
Streak = consecutive distinct days with ≥ 1 attempt, computed from `attempts.created_at` grouped by day. Keep it in a `useStreak()` hook memoized per app foreground.

**Prefetching** — load the next item's JSON while the user reads the explanation; on a mid-range Android this removes the perceived 100–200 ms lag.

**Images** — avoid them. Every figure (data tables, series) should be text/markdown. Keeps the bundle under ~10 MB and works offline.

**Offline ads** — banners simply fail and collapse; don't reserve empty space. Use a fixed-height container with a skeleton only if the ad loads.

**Deep links** — `lingkodcse://tips/grammar-traps` for share cards and notifications.

**Share card** — `react-native-view-shot` + `expo-sharing`. Generate a 1080×1350 result image ("I scored 82.5% on a full CSE mock"). Free marketing.

**Accessibility** — min 44×44 touch targets, `allowFontScaling`, never rely on color alone for correct/wrong (use icon + label).

---

## 12. Build & release

```bash
# Dev build with ads (real device)
npx expo run:android
# or cloud
eas build --profile development --platform android

# Internal test
eas build --profile preview --platform android

# Store
eas build --profile production --platform android
eas submit --platform android --latest

# OTA content update (no store review)
eas update --branch production --message "content v1.1: +120 items"
```

**Order of operations:** add the AdMob app ID to `app.json` → build → verify test ads on a device → swap to real unit IDs in production env → verify again with a staged rollout.

---

## 13. Testing checklist

- [ ] Cold start → diagnostic → first practice session in < 60 s
- [ ] Kill the app mid-mock → resume with all answers intact
- [ ] Timer expiry → auto-submits, no lost items
- [ ] Airplane mode → practice, tips, results, and history all work
- [ ] Expo Go → no crash (ads render nothing)
- [ ] Interstitial never appears during a quiz
- [ ] Daily cap and 3-minute cooldown respected
- [ ] Same question never repeats within one session
- [ ] Weakness screen shows 3 topics only after ≥ 5 attempts each
- [ ] Content validator passes
- [ ] Android back button during a timed exam asks for confirmation
- [ ] Font scale 1.3 → no clipped choices
- [ ] 2 GB RAM device → 60 fps on the results screen

---

## 14. Cost estimate

| Item | Cost |
|---|---|
| Expo / EAS | Free tier OK; $0–99/mo if builds queue |
| Google Play Console | $25 one-time |
| Apple Developer | $99/yr (only when you do iOS) |
| AdMob | Free |
| Domain + privacy policy page | ~₱500–1,500/yr |
| Backend | ₱0 (offline, no login) |

**Total to launch on Android: ~₱1,500 + your time.**
