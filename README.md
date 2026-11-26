# CSE Prep PH

Offline-first Civil Service Exam (CSE-PPT) reviewer for Filipino examinees. Two tracks (Professional & Subprofessional), full mock exams, per-subtopic analytics, an error log, and a tips library. Expo SDK 58 + TypeScript + SQLite + AdMob.

**Status: feature-complete release candidate.** Onboarding (four-step, user-set exam date), home dashboard, practice, quiz engine, mock exam, results, analytics, tips, daily challenge, offline storage, content reports, MaterialCommunityIcons, privacy/legal screen, and working ad slots are in place with **322 questions**.

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
| Daily challenge | A fixed 10-item mixed set per local day, tracked once per day |
| Report item | Flag wrong keys, ambiguity, typos, or duplicates from any quiz item; review and share from Profile |
| Interaction polish | Spring press feedback, light haptics, animated bars and score ring, screen fade, accessible pressable rows |
| Quiz | One item at a time, instant feedback + explanation + tip, haptics |
| Mock | Blueprint-weighted exam, countdown timer, auto-submit, no feedback until the end |
| Results | Rating ring, pass/fail vs 80%, per-section breakdown, mistake review, "drill weakest" |
| Analytics | Accuracy, study time, streak, per-topic stats from SQLite |
| Tips | 8 guides with rich formatting (bold, italics, subheadings, callouts), search, filters, grouped library, reading progress, practice CTA, and related reads |
| App shell | Blue Material app bar with elevation and white text; exam countdown on Practice/Mock; guide count on Tips |
| Profile | Track/goal settings, reminder toggle, error log, reset progress |
| Privacy & legal | In-app policy and disclaimer at `/legal` (Profile → About), AdMob disclosure, contact |
| Ads | Anchored banner slot, Expo-Go-safe platform split, test IDs, env overrides |
| Offline | All content bundled; progress in on-device SQLite; no account |

## Known limits (by design, for now)

- **322 items of ~920** — 136 verbal, 67 numerical, 44 analytical, 42 clerical, 33 general info. Both mocks are now complete: **150 items / 168 min** (Professional) and **145 items / 141 min** (Subprofessional).
- **Web is preview-only** — `lib/db/index.ts` stubs stats and attempts; bookmarks use localStorage there.
- **Ads are verified on device with Google test units** — banner, interstitial, and rewarded formats load in a development build. Live units are only used by the production profile; EEA consent (UMP) is not wired yet.
- **Release minification is disabled for now** — Expo SDK 58's default R8 strips WorkManager/Room constructors pulled in by `expo-notifications`, which crashes release builds at launch. `app.json` sets `enableMinifyInReleaseBuilds: false`; re-enable later with the correct keep rules.
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

### Content reports

Reports are stored in the local `reports` table. **Profile → Content reports** shows the latest ones, and **Email report** opens a prefilled message to `nikkorod04@gmail.com` with the item IDs, section/topic, reason, and a short stem. Nothing is sent until the user taps Send in their mail app. If no composer is available, it falls back to a `mailto:` link.

No Gmail OAuth is used, and reports never leave the device until the user sends them.

## Brand

- **Icon:** white C with a gold check on blue — Concept A
- **Colors:** blue `#1A46C4`, gold `#F2B01E`, white
- **Splash:** blue field, mark, wordmark, gold tagline
- **Assets:** `icon.png`, `android-icon-foreground.png`, `android-icon-monochrome.png`, `splash-icon.png`, `favicon.png`, `brand-mark.png` (app bar, onboarding, About)
- **Source:** vector art in `assets/branding/`, regenerated with `node scripts/render-brand.mjs`

---

## Privacy & legal

The in-app screen lives at `/legal` and is linked from **Profile → About → Privacy & legal**. It covers local data, AdMob, content reports, notifications, RA 10173 rights, and the CSC disclaimer.

The public policy for the Play Store listing is live at:

**https://nikkorod04.github.io/cseprep-ph/privacy-policy.html**

Use that URL in Play Console → App content → Privacy policy. The landing page is **https://nikkorod04.github.io/cseprep-ph/**.

The site is served by GitHub Pages from the `/docs` folder on `master`. Update `docs/privacy-policy.html` and push to publish changes.

## Docs

| File | Contents |
|---|---|
| [`PLAN.md`](./PLAN.md) | Product plan, exam blueprint, features, monetization, roadmap, KPIs, risks |
| [`docs/CONTENT-BLUEPRINT.md`](./docs/CONTENT-BLUEPRINT.md) | Question spec, sample items, tips & tricks, formula sheet, study plans |
| [`docs/TECH-SPEC.md`](./docs/TECH-SPEC.md) | Architecture, schema, ad integration, build & release |
| [`docs/AD-REMOVAL-PLAN.md`](./docs/AD-REMOVAL-PLAN.md) | One-time Remove Ads purchase, pricing, Play Billing, testing, phases |
| [`docs/privacy-policy.html`](./docs/privacy-policy.html) | Public privacy policy for the Play Store listing |
| [`docs/STORE-LISTING.md`](./docs/STORE-LISTING.md) | Play Store copy, graphics, data safety, content rating, QA checklist |
| [`docs/CLOSED-TESTING.md`](./docs/CLOSED-TESTING.md) | Google Form tester sign-up, 14-day closed test, FB post and email templates |
| [`docs/create-tester-form.gs`](./docs/create-tester-form.gs) | One-click Google Apps Script that creates the tester sign-up form |

## Disclaimer

Independent reviewer. Not affiliated with, endorsed by, or connected to the Civil Service Commission. All practice items are original.
