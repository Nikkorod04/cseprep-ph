# CSE Prep PH — Product & Build Plan

**Status:** Planning complete · Scaffold built Nov 24, 2026 (see `README.md`)
**Stack:** Expo SDK 58 · React Native · TypeScript · Expo Router · SQLite · AdMob (EAS build)

---

## 1. Decisions locked

| Decision | Choice | Consequence |
|---|---|---|
| Coverage | **Both** Professional + Subprofessional | One app, two tracks, shared question pool |
| Ads | **AdMob via EAS dev/prod build** | Ads will NOT run inside Expo Go |
| Questions | **Original bank, drafted with AI + your review** | Zero copyright risk; needs a QA workflow |
| Backend | **Offline-first, no login** | No server cost, works on commute, no PII |
| Language | **English** | Faster QA; Taglish tips can be added later |

**The one hard constraint:** Google Mobile Ads needs native code. Expo Go is only for building UI and content. Your first real build will be `npx expo run:android` (dev build) or `eas build --profile development`. Plan for that from day one so you don't design around a feature you can't test.

---

## 2. Market & positioning

**Who:** 18+ Filipinos taking CSE-PPT (Professional or Subprofessional), plus LGU/private applicants who need civil service eligibility. Android-dominant audience, often mid-range phones, limited data.

**What they do today:** buy ₱500–₱2,000 review books, download random PDFs from Facebook groups, watch free YouTube reviewers, or pay for review centers.

**What's broken about that:**
1. **No feedback loop.** A PDF doesn't tell you that you're losing 80% of your points on number series and data interpretation.
2. **No exam-condition practice.** 170 items / 190 minutes is a *speed* test (~67 sec/item). Reading a book doesn't train pacing.
3. **Data cost.** Most reviewers are online videos; commuters have dead spots.
4. **Trust.** Facebook PDFs have wrong answer keys and no explanations.
5. **No progress memory.** You can't tell if you're improving week over week.

**Positioning statement:**
> The offline CSE reviewer that scores you like the real exam, shows you exactly which subtopics are costing you the 20%, and drills you at 67 seconds per item — no sign-up, no data needed.

**Three things you must nail (the moat):**
1. **Explanation for every item** — not just the letter.
2. **Section-level analytics + a "weakest 3" drill queue.**
3. **Pacing trainer** — the single most under-served mechanic in PH reviewers.

**Name candidates** (check Play Store + domain before committing):
`Lingkod CSE` · `EligiblePH` · `SerbisyoPrep` · `CSE Passport` · `Topscore CSE`
Avoid "Pasa" (taken by Pasa Community for AFPSAT) and anything implying CSC affiliation.

---

## 3. Exam blueprint (source of truth for content)

Verified against CSC's 2026 announcement and current coverage guides. **CSC does not publish exact per-subtest item counts** — these are the working allocations used by every major reviewer; confirm each cycle.

### Professional — 170 items · 190 min · pass 80.00%

| Section | Scored items | Time (scaled) | Subtopics |
|---|---|---|---|
| Verbal Ability | 50 | 57 min | Vocabulary, Grammar & Correct Usage, Paragraph Organization, Reading Comprehension, Analogy |
| Numerical Ability | 40 | 45 min | Basic Operations, Word Problems, Number Series |
| Analytical Ability | 40 | 45 min | Word Association, Assumptions & Conclusions, Logic, Data Interpretation |
| General Information | 20 | 23 min | 1987 Constitution, RA 6713, Peace & Human Rights, Environment |
| **Total** | **150** | **170 min** | +20 Examinee Descriptive Questionnaire (unscored) |

### Subprofessional — 165 items · 160 min · pass 80.00%

| Section | Scored items | Time (scaled) | Subtopics |
|---|---|---|---|
| Verbal Ability | 50 | 55 min | same as Professional |
| Numerical Ability | 40 | 44 min | same as Professional |
| Clerical Ability | 35 | 39 min | Filing/Alphabetizing, Spelling, Comparing & Coding |
| General Information | 20 | 22 min | same as Professional |
| **Total** | **145** | **160 min** | +20 Examinee Descriptive Questionnaire (unscored) |

**Key differences:** Professional has **Analytical**, no Clerical. Subprofessional has **Clerical**, no Analytical. Verbal, Numerical, and General Info are on both.

**The passing math that should drive your whole UX:**
- 80% of 150 scored items = **120 correct**. You can miss 30 and still pass.
- ~67 seconds per item. A 3-minute item costs you two easy ones.
- No per-subject cut-off — a 95% Verbal can carry a weak Numerical, but only if you *know* which one is weak (hence analytics).

> ⚠️ Verify the "150/145 scored + 20 EDQ" split against the latest CSC Examination Announcement before you print it in-app. If CSC scores all 170, 80% = 136 correct. Show the target as "8 of every 10 correct" and put the exact figure in a footnote.

---

## 4. Product pillars

| # | Pillar | Why it wins |
|---|---|---|
| 1 | **Practice by subtopic** | Targeted reps beat random PDFs |
| 2 | **Full mock exam with section timers** | Trains the actual 67-sec pacing |
| 3 | **Per-subtopic analytics + weakest-3 queue** | Tells them what to study tomorrow |
| 4 | **Tips & Tricks library** | Cheap content, high perceived value, great for sharing |
| 5 | **Works offline, no account** | Removes the two biggest friction points |
| 6 | **Mistake notebook (Error Log)** | The single highest-retention study feature |

---

## 5. Features

### P0 — MVP (ship this)

| Feature | Detail |
|---|---|
| Onboarding | Pick track → exam date → daily goal (10/20/30 items) → 15-item diagnostic |
| Home | Streak, daily-goal ring, "Continue", weakest-3 shortcuts, exam countdown |
| Practice session | Filter by section/subtopic, 10/20/40 items, untimed or timed |
| Quiz engine | One item per screen, A–D, instant feedback or exam mode, explanation card, bookmark, "report this item" |
| Mock exam | Full-length, per-section timer, auto-submit, scaled rating %, pass/fail vs 80% |
| Results | Per-section and per-subtopic breakdown, time per item, review every item |
| Analytics | Accuracy by subtopic, speed, 7/30-day trend, "weakest 3" |
| Tips & Tricks | Formula sheet, grammar traps, filing rules, GenInfo must-knows, exam-day checklist |
| Error Log | Auto-collect every wrong answer + bookmark; re-drill them |
| Offline | All content bundled + seeded into SQLite |
| Reminders | Local notification at chosen time (dev build for reliability on Android) |
| Ads | Banner on Home/Results/Tips; interstitial after mock results; rewarded unlock |
| Legal | Privacy policy, "not affiliated with CSC" disclaimer, content report flow |

### P1 — post-launch (weeks 6–12)

- **Adaptive drill** — difficulty adjusts per subtopic (simple Elo/3-level ladder, not IRT).
- **Speed drill** — 60-second rapid-fire, 67 sec/item trainer.
- **Daily challenge** — 10 mixed items, streak freeze, shareable result card.
- **Study plan generator** — 30/60/90 days to exam date, auto-assigned daily subtopics.
- **Pass-probability estimate** — "At your current accuracy, you're at 74% — 11 points short."
- **Dark mode**, font scaling, haptics.
- **Browse mode** — read questions + explanations without answering.
- **Flashcards** — formulas, terms, laws (light SM-2 spaced repetition).

### P2 — only if retention proves out

- Cloud sync / accounts (Supabase) and cross-device progress.
- Leaderboards, study groups, community answer reports.
- IAP "Remove ads" + "Pro bank" (this is where real revenue is in PH).
- COMEX mode (per-item timer, no going back).
- AI tutor for explanations (costly; gate behind Pro).

---

## 6. Screen map

```
(tabs)
├── Home            streak · goal ring · countdown · quick actions · weakest 3
├── Practice        section list → subtopic list → session setup
├── Mock            mock list → instructions → exam → results → review
├── Tips            library index → article (formula sheet, grammar, etc.)
└── Profile         stats · error log · settings · reminders · about/legal

(stack, outside tabs)
├── onboarding/{track,exam-date,goal,diagnostic}
├── session/[id]           quiz runner (hides tab bar)
├── session/[id]/results
├── mock/[id]/review
├── tips/[slug]
└── legal/{privacy,disclaimer}
```

**Navigation rules:** hide the tab bar during any quiz or exam. No ads on quiz screens. Back button during a timed exam must confirm ("Submit and exit?").

---

## 7. Monetization & ads

**Model:** free, ad-supported. No paywall at launch — content volume is your acquisition strategy.

| Placement | Format | Rule |
|---|---|---|
| Home / Tips index | Adaptive anchored banner | Always allowed, bottom safe area |
| Results screen | Banner | Allowed |
| After mock results | Interstitial | Max 1 per 3 min, never mid-exam |
| "Unlock 10 more items" | Rewarded | Optional, user-initiated |
| Quiz / exam screens | **None** | Never interrupt a timed session |

**Frequency caps:** store `lastInterstitialAt` + `interstitialCountToday` in AsyncStorage. Hard cap 3/day. Skip the first session after install (protect activation).

**Setup checklist**
- AdMob account → link Play/App Store listing → create app IDs (Android + iOS).
- Create ad units: `home_banner`, `results_banner`, `mock_interstitial`, `bonus_rewarded`.
- Add `app-ads.txt` to your website/domain.
- Use **test ad unit IDs** in dev; real IDs only in production builds.
- Consent: UMP (User Messaging Platform) SDK for EEA traffic; Play Data Safety form must declare AdMob's device-ID collection.
- Never click your own ads. Test with test IDs only — invalid traffic bans are permanent.

**Revenue reality check (PH eCPMs are low):**

| DAU | Est. monthly (banner + interstitial) |
|---|---|
| 500 | ~$40–90 |
| 2,000 | ~$150–350 |
| 5,000 | ~$400–900 |

At 5k DAU, ads alone won't be life-changing. That's why P2 freemium matters: a ₱99 "Remove ads + Pro bank" converts 2–5% of engaged users and often beats AdMob at this scale.

---

## 8. Content plan

**Launch target: ~900 original items.** Shared sections (Verbal, Numerical, GenInfo) serve both tracks; Analytical is Professional-only; Clerical is Subprofessional-only.

| Section | Items | Breakdown |
|---|---|---|
| Verbal | 250 | Vocabulary 70 · Grammar 60 · Analogy 40 · Paragraph Org 35 · Reading Comp 45 |
| Numerical | 250 | Basic Ops 60 · Word Problems 90 · Number Series 60 · Fractions/%/Decimals 40 |
| Analytical | 160 | Word Association 40 · Assumptions/Conclusions 35 · Logic 40 · Data Interpretation 45 |
| Clerical | 120 | Filing/Alphabetical 40 · Spelling 40 · Comparing/Coding 40 |
| General Info | 140 | Constitution 50 · RA 6713 30 · Peace & HR 25 · Environment 35 |
| **Total** | **920** | difficulty mix ~30% easy / 50% medium / 20% hard |

**Production workflow (per batch of 50)**
1. Generate items to the spec in `docs/CONTENT-BLUEPRINT.md` (schema + writing rules).
2. **You review every answer key.** AI drafts are not shippable without a human pass.
3. Run the automated linter: unique IDs, one correct answer, 4 choices, explanation present, no duplicate stems.
4. Playtest 20 random items yourself on-device.
5. Bump `contentVersion`, ship as an OTA update.

**Time estimate:** 30–40 quality items/hour with explanations → 920 items ≈ 25–30 focused hours, spread over 3 weeks.

**QA rules that prevent 1-star reviews:** exactly one defensible answer; no "trick" trivia; explanations under 60 words; no item that depends on a calculator; no outdated law citations; every item reportable in one tap.

---

## 9. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Expo SDK 58 (`expo` 58.0.x) | Current stable; Expo Go for UI work |
| Language | TypeScript (strict) | Content schema safety |
| Navigation | Expo Router 58 | File-based, deep links for share cards |
| State | Zustand + AsyncStorage persist | Small, no boilerplate |
| Storage | `expo-sqlite` | Attempts/analytics queries; content seeding |
| Content | Versioned JSON in `assets/content/vN/` | OTA content updates without reinstalling |
| Animation | `react-native-reanimated` 4.x | Smooth progress rings, transitions |
| Ads | `react-native-google-mobile-ads` ^17.4 | AdMob's maintained RN SDK with Expo config plugin |
| Notifications | `expo-notifications` | Local daily reminder |
| Builds | `expo-dev-client` + EAS Build | Required for ads |
| Analytics | PostHog (or Firebase) — optional P1 | Know which subtopics get abandoned |

Full implementation detail: **`docs/TECH-SPEC.md`**.

**Why not a backend yet:** no accounts means no auth, no sync conflicts, no server bills, and a privacy posture that's easy to defend under RA 10173. Add Supabase only when you have retention data proving users want sync.

---

## 10. Release plan

**Platform order: Android first.** ~85% of the PH market, cheaper, and Play's review is faster.

**EAS profiles:** `development` (dev client + test ads) → `preview` (internal testing, real ads off) → `production` (real ads, signed AAB).

**Google Play gotcha:** personal developer accounts must run a **closed test with 12 testers for 14 continuous days** before applying for production. Budget 3 weeks of calendar time for this alone, and recruit testers early (friends, FB CSE groups).

**Store listing assets:** icon, feature graphic 1024×500, 6 phone screenshots (Home, Practice, Quiz w/ explanation, Mock timer, Results breakdown, Tips), short description with keywords ("CSE reviewer", "civil service exam 2027", "subprofessional reviewer", "offline").

---

## 11. Timeline (solo, part-time ≈ 15 h/week)

| Week | Deliverable |
|---|---|
| 1 | Repo, Expo SDK 58 + Router + TS, design tokens, SQLite schema, content JSON schema, 100 seed items |
| 2 | Onboarding + Home + practice flow + quiz engine (untimed) |
| 3 | Timed sessions, explanations, bookmarks, error log, 300 items |
| 4 | Mock exam engine + section timers + results + review |
| 5 | Analytics screens + weakest-3 queue + Tips library UI + 600 items |
| 6 | AdMob integration, dev build on a real device, reminders, 800 items |
| 7 | Polish, empty states, accessibility, 920 items + full QA pass |
| 8 | Play Console setup, closed test with 12 testers (starts the 14-day clock) |
| 9–10 | Fix tester feedback, store listing, production rollout |

**Realistic launch: ~10 weeks** if content review is disciplined. Content, not code, is the critical path.

---

## 12. KPIs

| Metric | Target by day 30 |
|---|---|
| Activation (finish diagnostic) | > 60% |
| D1 / D7 / D30 retention | 40% / 20% / 10% |
| Sessions per active user / week | ≥ 4 |
| Mock exams completed per user | ≥ 1.5 |
| Avg. accuracy improvement (first vs last 100 items) | +8 pts |
| Crash-free sessions | > 99.5% |
| Store rating | ≥ 4.5 |

Instrument: onboarding funnel, subtopic abandonment, mock completion rate, ad impressions per DAU.

---

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **Wrong answer keys** (kills trust instantly) | Human review of 100% of items; one-tap report; fix within 48h; changelog |
| **CSC affiliation confusion** | Prominent "independent, not affiliated with CSC" disclaimer on onboarding, About, and store listing. No CSC seal/logo. |
| **AdMob policy strike** | Test IDs in dev, frequency caps, no ads in quiz, declare in Data Safety |
| **Low ad revenue** | Plan P2 freemium now; keep ad logic isolated in one module |
| **Expo Go confusion** | Dev client from week 1; document the two-command workflow in README |
| **Content stale** (laws change, exam schedule changes) | `contentVersion` + OTA updates; "last reviewed" date shown in Tips |
| **Scope creep** | P0 list is frozen until the closed test starts |
| **Data Privacy Act (RA 10173)** | No accounts/PII at launch; privacy policy discloses AdMob device identifiers; no analytics SDK until needed |

---

## 14. Immediate next steps

1. **Pick the name** → reserve Play Console app + domain.
2. **Scaffold the repo** (`npx create-expo-app`, TS + Router) and commit the schema in `docs/TECH-SPEC.md`.
3. **Write the first 100 items** using `docs/CONTENT-BLUEPRINT.md` as the spec — start with Numerical (highest perceived value) and Grammar.
4. **Build the quiz engine first**, not the home screen — it's the product.
5. **Get a dev build running on a real Android phone** before writing any ad code.

---

## 15. Open questions (answer when convenient)

- Final app name + brand colors?
- Target exam date to feature in countdown (next CSE-PPT is March 2027 per CSC's 2026 announcement)?
- Do you want Taglish explanations as a toggle later?
- Solo build, or will someone else handle content review?
- Budget for Play Console ($25) + EAS (free tier is enough to start)?
