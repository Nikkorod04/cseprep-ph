# Closed Testing + Google Form Tester Plan

Goal: recruit **20–25 Android testers** from Facebook groups through a Google Form, run the required **12 testers / 14 continuous days** closed test, then apply for production.

## 0. Do this before recruiting anyone

The current preview APK crashed at launch. Do not invite testers until:

- [ ] The new preview build (`8eb8fb7f…`, minify disabled) launches and reaches onboarding.
- [ ] Smoke test: onboarding, a 10-item practice set, a mock start, Tips, Profile → Privacy & legal.
- [ ] Build a fresh **closed-test AAB from the latest commit** (includes the latest tips design):
  ```bash
  npx eas-cli build --profile internal --platform android
  ```
- [ ] The AAB uses Google **test ads**. That is correct for testing; do not use live ads.

If the preview still crashes, stop here and get a logcat before spending money on testers.

## 1. Play Console requirements

- Personal developer accounts need **12 testers opted in for 14 continuous days** before production access.
- Testers must install the app **from Google Play** through the closed-test opt-in link. A sideloaded APK does not count.
- Use real testers; do not create extra accounts or pay for reviews.
- The closed test needs the app content forms completed: privacy policy, ads declaration, data safety, content rating, target audience.

## 2. Create the Google Form

Open `forms.new` while signed into the Google account that owns the Play Console.

### One-click setup

If you don’t want to add the questions by hand:

1. Open https://script.google.com → **New project**.
2. Paste [`docs/create-tester-form.gs`](./create-tester-form.gs).
3. Run `createTesterForm`, approve the permissions, then open **View → Logs**.
4. The logs give you the published form URL, edit URL, and the linked response Sheet.

The script creates the form with all the fields below, email collection, one
response per person, editing enabled, and the confirmation message. You can still
edit the wording in Google Forms afterward.

The rest of this section is the manual version and the exact copy.

**Title:** `CSE Prep PH — Closed Tester Sign-up`

**Description:**
```
CSE Prep PH is a new offline reviewer for the Philippine Civil Service Exam
(Professional and Subprofessional). I need 20 Android testers to use a
pre-release build for 14 days and report bugs before the public launch.

Requirements:
• Android phone
• The Google account you use in the Play Store
• Install the app and keep it for 14 days
• A few minutes of honest feedback

The build is free, contains Google test ads, and is not the final release.
You can leave the test at any time. Not affiliated with the CSC.
Privacy: https://nikkorod04.github.io/cseprep-ph/privacy-policy.html
```

### Questions

1. **Name or nickname** — short answer, required
2. **Google Play email** — short answer, required, email validation
   - Description: “Use the exact Google account signed into the Play Store on your Android phone. This is usually a Gmail address. Do not enter your Facebook email unless it is also your Play account.”
3. **Is this the Google account signed into the Play Store on your phone?** — checkboxes, required, one option: `Yes, this is my Play Store account`
4. **Android phone brand and model** — short answer, required
   - Example: `Samsung Galaxy A54`, `Xiaomi Redmi Note 13`, `Pixel 7`
5. **Android version** — dropdown, required
   - `Android 10`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `Not sure`
   - Help: Settings → About phone → Android version
6. **Country** — short answer, required, default `Philippines`
7. **Can you install the app and keep it installed for 14 days?** — multiple choice, required
   - `Yes`, `No`
   - If `No`, they are not a tester; the form can end with a message.
8. **Which exam are you preparing for?** — multiple choice
   - `Professional`, `Subprofessional`, `Both`, `Not taking it yet`
9. **Facebook name or profile link** — short answer, optional
   - Helps match form entries to group conversations.
10. **Anything we should test on your device?** — paragraph, optional
11. **Consent** — checkboxes, required
    - `I agree to receive emails about this closed test.`
    - `I understand this is a pre-release build with Google test ads.`
    - `I will not post the opt-in link publicly.`

### Form settings

- Collect email addresses: **On** (verified)
- Limit to 1 response: **On**
- Allow response editing: **On**
- Show progress bar: **On**
- Confirmation message:
  ```
  Thanks! Your email will be added to the closed test within 24–48 hours.

  Watch for an email with your Play opt-in link. You must open that link on the
  Android phone signed into the Play Store with the email you entered.

  The test runs for 14 days. Please keep the app installed and send feedback
  through the feedback form in the email.
  ```

**Do not put the Play opt-in link in the public form or confirmation.** Anyone with the form could otherwise join. Send it by email after adding the address to Play Console.

## 3. Set up the closed test in Play Console

1. Play Console → **Test and release → Testing → Closed testing** → create a track (e.g., `Closed test`).
2. Upload the `internal` AAB (test ads) to the track.
3. Complete **App content**:
   - Privacy policy: `https://nikkorod04.github.io/cseprep-ph/privacy-policy.html`
   - Ads: **Yes**
   - App access: all features available without login
   - Content rating questionnaire
   - Target audience: 18+
   - Data safety: declare AdMob device/ad data
   - Government app: No; News: No; COVID: No
4. **Testers** tab → **Create email list** → paste the tester emails from the form sheet.
5. Copy the **opt-in link** (Join on Android) from the Testers tab. Keep it private.
6. Roll out the release to the closed track.
7. Testers must:
   - Be signed into the Play Store with the listed email
   - Open the opt-in link on the phone
   - Accept the test and install/update from Play
8. Set the track countries to include every tester’s country (PH by default).

The 14-day clock is per tester opt-in. Keep at least 12 active for the full period; recruit 20–25 so dropouts do not break the run.

## 4. Tester email template

Send from the Google account that owns the form/Play account, BCC or individually.

**Subject:** `You're in — CSE Prep PH closed test`

```
Hi [name],

Thanks for signing up for the CSE Prep PH closed test. Your Google Play email
has been added.

1. On your Android phone, open the Play Store and make sure you are signed in
   with: [play email]
2. Open this opt-in link on that phone:
   [Play opt-in link]
3. Tap "Become a tester", then install or update CSE Prep PH from Play.
4. Keep the app installed for 14 days and use it normally.
5. Send bugs and feedback here:
   [feedback form link]

The build is pre-release and shows Google test ads — that is expected. Do not
share the opt-in link publicly. You can leave the test at any time.

Thanks for helping,
CSE Prep PH
```

If a tester gets “app not available”:
- Confirm the Play Store account is the one added.
- Confirm the app is available in their country.
- Confirm the opt-in link was opened on Android, not a desktop browser.

## 5. Facebook group post

Post the **Google Form link**, never the Play opt-in link.

**Short version**
```
Looking for 20 Android testers for a new offline CSE reviewer 🇵🇭

I’m preparing CSE Prep PH for the Play Store and Google requires a 14-day
closed test first. You’ll get the app free; the test build shows Google test ads.

What I need:
• Android phone
• The Google account you use in the Play Store
• Install the app and keep it for 14 days
• Honest bug/feedback reports

Sign up here: [Google Form link]

Not affiliated with the CSC. Salamat!
```

**Longer version**
```
CSE Prep PH — Android testers needed (14 days)

I built an offline CSE-PPT reviewer with Professional and Subprofessional
tracks, full mock exams, per-topic practice, explanations, a daily challenge,
and a tips library. Before the public launch, Google Play requires a closed
test with real users.

What you get: free access to the pre-release app.
What I need: Android phone, the Google Play account you actually use, 14 days
with the app installed, and a few minutes of feedback.

The test build uses Google test ads, not live ads. No payment, no sign-up inside
the app, and your study data stays on your phone.

Sign up: [Google Form link]

Please share with CSE friends who use Android. Not affiliated with the CSC.
```

Do not offer rewards for 5-star reviews; Google prohibits incentivized reviews.
A simple early-access thank-you is fine.

## 6. Tracking sheet

Form responses land in a Google Sheet. Add these columns:

| Column | Use |
|---|---|
| Timestamp | Automatic |
| Name | Form |
| Play email | Form |
| Phone / Android | Form |
| Country | Form |
| 14-day commitment | Form |
| Facebook name | Form |
| Added to Play | Manual: Yes/No |
| Opt-in sent | Manual: date |
| Installed | Manual: Yes/No |
| Last check-in | Manual |
| Feedback received | Manual |
| Notes | Manual |

To build the Play Console email list, add a cell with:

```
=TEXTJOIN(",", TRUE, C2:C100)
```

Copy the result into Play Console → Testers → email list. Remove duplicates first.

## 7. Feedback form

Create a second Google Form and link it in the tester email and group post.

1. **Play email** — short answer, required
2. **Device and Android version** — short answer
3. **What happened?** — paragraph, required
4. **Steps to reproduce** — paragraph, optional
5. **Severity** — multiple choice: `Crash / blocker`, `Wrong behavior`, `Content or answer-key error`, `Confusing layout`, `Suggestion`
6. **Screenshot** — file upload, optional (limit 1, image only)
7. **Can we contact you about this?** — yes/no

Use the responses to decide what to fix during the test and to answer Play’s production-access questions (“What feedback did you receive? What did you change?”).

## 8. 14-day schedule

| Day | Action |
|---|---|
| -2 | Confirm preview launches; build `internal` AAB; complete listing and app content |
| -1 | Create Google Form and feedback form; post in 2–3 FB groups |
| 0 | Upload AAB to closed testing; add first 12–15 emails; send opt-in links |
| 1–3 | Recruit to 20–25; confirm installs; fix any blockers |
| 3–14 | Weekly check-ins; ship fixes as new AABs (bump `versionCode`) |
| 14 | Confirm at least 12 testers opted in continuously |
| 15 | Apply for production access; answer feedback questions |
| 16+ | Production rollout; keep the closed track for future builds |

## 9. Common mistakes to avoid

- Posting the Play opt-in link publicly instead of the Google Form.
- Adding a tester’s Facebook email instead of their Play Store Google account.
- Uploading an APK instead of an AAB for the closed track.
- Using live ads in the test build.
- Letting testers uninstall before 14 days; recruit backups.
- Asking for or rewarding 5-star reviews.
- Launching the closed test before the app actually opens.
- Forgetting the privacy policy, ads declaration, data safety, and content rating.
- Using fake accounts or the developer’s own multiple accounts.
