# CSE Prep PH

Offline-first Civil Service Exam (CSE-PPT) reviewer for Filipino examinees. Two tracks (Professional & Subprofessional), full mock exams, per-subtopic analytics, an error log, and a tips library. Expo SDK 58 + TypeScript + SQLite + AdMob.

**Status: working scaffold.** Onboarding, home dashboard, practice, quiz engine, mock exam, results, analytics, tips, profile, offline storage, and ad slots are in place with **322 questions**.

---

## Run it

```bash
npm install

npm run go        # Expo Go on your phone (ads disabled, content + UI work)
npm run web       # browser preview (UI only — SQLite is stubbed on web)
npm run android   # dev build with real ads (needs Android Studio / SDK)
```

Open the QR code from `npm run go` with Expo Go. Type check with `npm run typecheck`.

> **Ads require a dev build.** Google Mobile Ads has no native module in Expo Go, so `BannerSlot.native.tsx` returns `null` there. Everything else works.

---

## What works today

| Area | Implemented |
|---|---|
| Onboarding | Track, exam date, daily goal, optional 10-item diagnostic |
| Home | Exam countdown, daily-goal ring, streak, weakest-3 topics, tip of the day |
| Practice | Mixed sets, section accordion; every topic opens either a 10-item drill or a full browse set |
| Study mode | Read every item in a topic at your own pace, reveal the answer when ready, bookmark anything |
| Resume | Sessions autosave as you answer; continue from Home; mock clocks pause when you leave |
| Library | Study your bookmarked items and retry questions from the error log |
| Interaction polish | Spring press feedback, light haptics, animated bars and score ring, screen fade, accessible pressable rows |
| Quiz | One item at a time, instant feedback + explanation + tip, haptics |
| Mock | Blueprint-weighted exam, countdown timer, auto-submit, no feedback until the end |
| Results | Rating ring, pass/fail vs 80%, per-section breakdown, mistake review, "drill weakest" |
| Analytics | Accuracy, study time, streak, per-topic stats from SQLite |
| Tips | 8 guides with rich formatting (bold, italics, subheadings, callouts), search, filters, grouped library, reading progress, practice CTA, and related reads |
| App shell | Blue Material app bar with elevation and white text; exam countdown on Practice/Mock; guide count on Tips |
| Profile | Track/goal settings, reminder toggle, error log, reset progress |
| Ads | Anchored banner slot, Expo-Go-safe platform split, test IDs, env overrides |
| Offline | All content bundled; progress in on-device SQLite; no account |

## Known limits (by design, for now)

- **322 items of ~920** — 136 verbal, 67 numerical, 44 analytical, 42 clerical, 33 general info. Both mocks are now complete: **150 items / 168 min** (Professional) and **145 items / 141 min** (Subprofessional).
- **Web is preview-only** — `lib/db/index.ts` stubs stats and attempts; bookmarks use localStorage there.
- **Ads are wired but untested on device** — replace test app/unit IDs before shipping.
- **Reminders** — scheduling is implemented, but Expo Go may block it; use a dev build.
- **One active session at a time** — starting a new set replaces a paused one.

---

## Project map

```
app/
  index.tsx              redirect: onboarding or home
  onboarding.tsx         track / exam date / goal
  (tabs)/                home · practice · mock · tips · profile
  session/index.tsx      quiz runner (no ads, no tab bar)
  session/results.tsx    scoring + review
  tips/[slug].tsx        article reader
components/
  ui/                    AppText · Button · Card · Chip · Bar · ProgressRing · Screen
  ads/BannerSlot.native.tsx  real AdMob banner (lazy, guarded)
  ads/BannerSlot.tsx         web stub
lib/
  content/               typed JSON loaders, section/topic helpers
  db/                    index.native.ts (SQLite) · index.ts (web stub) · schema
  quiz/                  engine (scoring, blueprint, mock builder) · start flows
  store/                 zustand: settings (persisted) · session (in-memory)
  hooks/useDashboard.ts  refresh stats on focus
assets/content/v1/       questions.json · sections.json · tips.json
scripts/validate-content.mjs
```

---

## Content workflow

```bash
npm run content:check   # schema, duplicate ids/stems, answer balance, tip rules
```

Add items to `assets/content/v1/questions.json` using the schema in
[`docs/CONTENT-BLUEPRINT.md`](./docs/CONTENT-BLUEPRINT.md). Then:

```bash
npm run typecheck
npm run content:check
```

Item ids are permanent — progress is keyed by them. Edit an item, bump `version`, never change its `id`.

---

## Ads

| Placement | Format | Rules |
|---|---|---|
| Home, Tips, Results | Anchored banner | None in Practice, Mock, Profile, or any quiz screen |
| After mock results | Interstitial | 900 ms delay, first result skipped, 3-minute cooldown, 3/day |
| Results "Bonus set" | Rewarded | "Watch ad · +10 items", 3/day, starts a 10-item drill |

- **Expo Go and web:** everything is a no-op. The native module is only required when `TurboModuleRegistry` finds `RNGoogleMobileAdsModule`.
- **Android App ID is wired:** `ca-app-pub-4143696379274937~7573094916` in `app.json`. iOS still uses Google's test app ID until an iOS app is created.
- **Test units in dev and preview:** Google's official test units are used unless `EXPO_PUBLIC_ADS_MODE=live` is set in a non-dev build. Live unit IDs live in `lib/ads/config.ts` and can be overridden with `EXPO_PUBLIC_AD_BANNER`, `EXPO_PUBLIC_AD_INTERSTITIAL`, and `EXPO_PUBLIC_AD_REWARDED`.
- **Production:** the `production` profile in `eas.json` sets `EXPO_PUBLIC_ADS_MODE=live`, so store builds serve real ads while previews stay safe.
- Changing the App ID is a native change: rebuild the dev client or production app after editing `app.json`.
- **Testing on device** (ads cannot run in Expo Go):

  ```bash
  npx expo install expo-dev-client
  npx eas-cli login
  npx eas-cli init
  npx eas-cli build --profile development --platform android
  npx expo start --dev-client
  ```

  Install the APK on the phone, then reload. `eas.json` is already configured with `development`, `preview`, and `production` profiles.
- **UMP consent** (EEA) is not wired yet. All requests ask for non-personalized ads.
- Never tap your own live ads. Use test IDs only during development.

---

## Docs

| File | Contents |
|---|---|
| [`PLAN.md`](./PLAN.md) | Product plan, exam blueprint, features, monetization, roadmap, KPIs, risks |
| [`docs/CONTENT-BLUEPRINT.md`](./docs/CONTENT-BLUEPRINT.md) | Question spec, sample items, tips & tricks, formula sheet, study plans |
| [`docs/TECH-SPEC.md`](./docs/TECH-SPEC.md) | Architecture, schema, ad integration, build & release |

## Disclaimer

Independent reviewer. Not affiliated with, endorsed by, or connected to the Civil Service Commission. All practice items are original.
