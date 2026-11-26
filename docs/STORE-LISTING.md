# Play Store Listing — CSE Prep PH

Everything needed to fill out the Google Play Console listing.

## Store listing fields

**App name (max 30)**
```
CSE Prep PH: CSE Reviewer
```

**Short description (max 80)**
```
Offline CSE reviewer with mock exams, drills, tips, and weak-spot tracking.
```

**Full description (max 4000)**
```
CSE Prep PH is an independent, offline-first reviewer for the Philippine Civil Service Examination (CSE-PPT), covering both Professional and Subprofessional tracks.

STUDY WITHOUT A CONNECTION
All 322+ original practice items, mock exams, and tips are stored on your phone. No account, no sign-up, and no data needed.

BUILT AROUND THE REAL EXAM
• Full mock simulations built from the working section blueprint: 150 items for Professional and 145 for Subprofessional, with an 80% passing target.
• Timed sessions, auto-submit, and a complete review after every mock.
• Per-section and per-topic mastery so you know where the next 20% is coming from.
• An error log that collects missed items for focused retries.
• A fixed 10-item daily challenge, bookmarks, and a read-at-your-own-pace study mode.

EXPLANATIONS, NOT JUST LETTERS
Every item includes a clear explanation and a short tip, so a wrong answer becomes a lesson.

TIPS THAT SAVE TIME
Guides on the 67-second rule, number-series checks, grammar traps, filing rules, and General Information must-knows.

NO ACCOUNT. YOUR PROGRESS STAYS YOURS.
Your track, exam date, daily goal, attempts, bookmarks, and content reports stay on your device. Ads are provided by Google AdMob; the app requests non-personalized ads. See the privacy policy for details.

FREE WITH ADS
CSE Prep PH is free to use and supported by ads. There are no ads during a quiz or timed exam.

IMPORTANT
CSE Prep PH is not affiliated with, endorsed by, or connected to the Civil Service Commission. All practice items are original. Exam formats, schedules, and coverage can change; always confirm details in the official CSC announcement. The app is a study aid and does not guarantee a passing score.

Questions or content reports: nikkorod04@gmail.com
Privacy policy: https://nikkorod04.github.io/cseprep-ph/privacy-policy.html
```

**Category:** Education
**Tags:** Education, Test preparation
**Contact email:** nikkorod04@gmail.com
**Website:** https://nikkorod04.github.io/cseprep-ph/
**Privacy policy:** https://nikkorod04.github.io/cseprep-ph/privacy-policy.html

## Graphics

All final assets are in `screenshots/store/final/`.

| Asset | File | Size |
|---|---|---|
| App icon | `play-icon-512.png` | 512 × 512 |
| Feature graphic | `feature-graphic.jpg` | 1024 × 500 |
| Phone screenshots | `01-two-tracks.jpg` … `07-progress.jpg` | 1080 × 1920 |

Screenshot order:

1. `01-two-tracks.jpg` — Professional vs Subprofessional
2. `02-offline.jpg` — Home, countdown, daily goal
3. `03-weak-spots.jpg` — section mastery and weak topics
4. `04-explanations.jpg` — quiz feedback and explanation
5. `05-mock.jpg` — mock exam setup and past score
6. `06-tips.jpg` — tips library
7. `07-progress.jpg` — accuracy, streak, study time, best mock

## App content answers

**Ads:** Yes, the app contains ads.
**App access:** All functionality is available without login or special access.
**Government app:** No (independent reviewer; not affiliated with CSC).
**News app:** No.
**COVID-19 apps:** No.
**Financial features:** No.
**Health:** No.

**Content rating questionnaire**
- Violence, sexuality, language, controlled substances, gambling: No.
- User-generated content shared publicly: No.
- Shares location with other users: No.
- Digital purchases: No (at launch).
- Ads: Yes.
- Expected rating: Everyone / suitable for all ages, subject to the questionnaire.

**Target audience:** 18+ (CSE examinees). Not designed for children.

**Data safety**
The developer does not operate an account system or server for study data. Google AdMob is a third-party SDK that may collect data. Answer truthfully based on the final SDK configuration:

- **Device or other IDs** — collected and shared by Google AdMob for advertising.
- **Approximate location** — may be derived from IP by Google AdMob for advertising.
- **App activity / ad interactions** — collected by Google AdMob for advertising and measurement.
- **Diagnostics** — as collected by the AdMob SDK.
- Data is encrypted in transit.
- No user account data is stored by the developer.
- Local study data is deleted by uninstalling the app or using Reset progress / Clear reports.
- Privacy requests: nikkorod04@gmail.com.
- Data deletion: contact email for ad-related requests; local data is controlled in the app.

Do not claim "No data collected" — the AdMob SDK collects device/ad data even when ads are non-personalized.

## Testing and release

**Preview APK (standalone, test ads):**
```bash
npx eas-cli build --profile preview --platform android
```

**Internal testing AAB (test ads, upload to Play):**
```bash
npx eas-cli build --profile internal --platform android
```

- The `internal` profile produces an **AAB** and keeps Google test ads on.
- The `production` profile produces the store AAB with **live ads**.
- A sideloaded APK cannot test Play Billing or Play-installed updates. Use the Play internal-testing link.
- If the developer account is personal, plan for **12 testers / 14 continuous days** of closed testing before production access.
- Upload the AAB to **Testing → Internal testing**, add testers, install through Play, and run the device QA pass.

## Device QA checklist

- [ ] Onboarding: both tracks, user-set date, goal, diagnostic
- [ ] Practice: section accordion, topic drill, study mode, bookmarks
- [ ] Mock: full timed run, auto-submit, results and review
- [ ] Daily challenge and streak
- [ ] Error log and retry
- [ ] Content report → Email report
- [ ] Notification permission and daily reminder
- [ ] Airplane mode: cold start, practice, tips, results
- [ ] Profile: privacy/legal screen and reset progress
- [ ] Ads: test banner, interstitial after a mock, rewarded card
- [ ] Reinstall: local progress clears as expected; no crash
- [ ] Large font scale and small-screen layout
