# Remove Ads — One-Time Purchase Plan

Status: planning
Product: **CSE Prep PH**
Platform: Android-first (Google Play Billing)

## 1. Product decision

Sell a **one-time, non-consumable "Remove ads" unlock** — not a subscription.

- Product ID: `remove_ads`
- Launch price: **₱99** (test ₱149 later if conversion allows)
- Scope: removes every ad placement for the Google account that bought it:
  - no banner on Home / Tips / Results
  - no interstitial after mock results
  - no rewarded "Bonus set" card
- The unlock is tied to the Play account, not the device. Reinstalling or switching
  phones restores it through Play Billing.
- Digital goods must be sold through **Google Play Billing**. GCash, Maya, PayPal,
  or direct card checkout are not allowed for in-app digital purchases.

### Why one-time instead of subscription

- The app is an offline reviewer; there is no recurring server cost to justify a
  subscription.
- A single price is easier to explain and has no cancellation/retention burden.
- Google's fee is 15% on the first $1M/year, so ₱99 nets roughly ₱84 before tax.

### Pricing plan: ₱99 first, then test ₱149

Launch at **₱99** and treat it as a founding-supporter price, not a permanent
discount. After there is enough real traffic, test ₱149 against a comparable window.

Why start at ₱99:
- The audience is students and early-career examinees; ₱99 is an impulse price.
- The app has no reviews or social proof yet; a lower entry price reduces risk.
- A failed ₱149 launch is harder to recover from than a later increase.
- Existing buyers keep their unlock when the price changes, so raising later does
  not punish early supporters.

Decision thresholds after **300–500 paywall views** (or 4–6 weeks, whichever comes
first):

| Result at ₱99 | Action |
|---|---|
| Conversion ≥ 2.5% and refunds < 3% | Test ₱149 for 4 weeks |
| Conversion 1.0–2.5% | Keep ₱99; improve paywall placement/copy |
| Conversion < 1% | Keep ₱99 (or try a ₱79 launch promo); do not raise |
| Refunds > 5% or price complaints | Investigate value/positioning before changing |

Compare **net revenue per 1,000 paywall views**, not raw conversion:

- ₱99 nets ~₱84 after Play's 15% fee.
- ₱149 nets ~₱127.
- ₱149 only needs ~1.33% conversion to match ₱99 at 2%.
- At 3% conversion, ₱149 needs ~2.0% to match.

That means a price increase is worthwhile if conversion falls by less than about a
third. If it falls more, ₱99 wins on both revenue and goodwill.

Measurement notes:
- Count **paywall views**, not installs, as the denominator.
- Use a real Play internal-testing cohort; test purchases are free and do not
  produce meaningful conversion data.
- Don't decide from friends/family feedback or the first 20 purchases.
- If the active user base is under ~1,000, stay at ₱99 until volume is meaningful.
- Grandfather all existing owners; Play keeps their entitlement when the price
  changes.

Long-term: keep **₱149** as the standard price once reviews and retention justify
it, and run a real, time-boxed **₱99 exam-season promo** rather than constantly
moving the price.

## 2. User flow

1. Profile shows a **Remove ads** card with the localized price.
2. Tapping opens a paywall modal:
   - "Study without interruptions"
   - Three short benefits: no banners, no interstitials, no ad-gated bonus
   - Localized Play price, "Buy once · keep forever"
   - **Buy** and **Restore purchase** actions
   - Fine print: charged by Google Play, refunds handled by Google
3. Purchase succeeds → acknowledge → entitlement saved → paywall closes with a
   success haptic and the card changes to **Ads removed**.
4. Ads disappear immediately without restart.
5. On every launch, silently restore/verify the purchase in the background. If the
   purchase is gone (refund/chargeback), ads come back on the next online launch.
6. New device/reinstall: automatic restore; manual "Restore purchase" as fallback.

## 3. Architecture

### Entitlement store

New `lib/store/entitlements.ts` (Zustand + AsyncStorage), persisted separately from
settings:

```ts
interface EntitlementState {
  hydrated: boolean;
  adsRemoved: boolean;
  source: "purchase" | "restore" | null;
  checkedAt: number | null;
  setAdsRemoved: (value: boolean, source: ...) => void;
  hydrate: () => Promise<void>;
}
```

Hydrate alongside settings in `app/_layout.tsx`. Treat the local value as the source
of truth for rendering, then reconcile with Play Billing when the network is available.
This keeps the app working offline.

Hydrate entitlements **before** calling `initAds()` / `preloadInterstitial()`, and
have `BannerSlot` wait for `hydrated` before mounting the ad view. Otherwise an
ad-free user can trigger a banner or interstitial request on the first cold start
before the stored entitlement is read.

### Ad gates

Gate at the source, not at each screen:

| Component | Change |
|---|---|
| `components/ads/BannerSlot.native.tsx` | `if (!ADS_ENABLED || adsRemoved) return null` |
| `lib/ads/interstitial.native.ts` | skip `preloadInterstitial()` and `maybeShowInterstitial()` |
| `components/ads/RewardedBonus.native.tsx` | return `null` when ads are removed |
| `app/_layout.tsx` | do not preload interstitials for ad-free users |
| `app/session/results.tsx` | rewarded card already hides itself through the component |

Add a hook in the entitlement store and read it where the component renders. For
non-React code (interstitial helpers), use `useEntitlements.getState().adsRemoved`.

### Billing layer

New `lib/iap/`:

- `provider.native.ts` — wraps the billing library: `initConnection`, product
  lookup, `requestPurchase`, `acknowledgePurchase`, `getAvailablePurchases`,
  `endConnection`, purchase listeners.
- `provider.ts` — web/Expo Go stub that reports billing as unavailable.
- `useRemoveAds.ts` — UI state: price, purchasing, pending, owned, error.

Recommended library: **`expo-iap` v6.5.x** — Expo-oriented, supports one-time
products, designed for current Expo SDKs. Alternative: `react-native-iap` v17,
which now requires `react-native-nitro-modules`. Either way the app needs a native
rebuild; neither works in Expo Go.

One-time products are **acknowledged**, not consumed. Consuming would allow the
same account to buy again and is wrong for a permanent unlock.

### No app account or backend required

Google Play Billing is tied to the buyer's **Google Play account**, not to an app
account. CSE Prep can stay account-less and server-less:

- The Play purchase is non-consumable and permanent for that Google account.
- The app stores the entitlement locally in AsyncStorage and restores it with
  `getAvailablePurchases()` on launch, reinstall, or a new device signed into the
  same Play account.
- No database, login, or API is needed for v1. Play is the source of truth.
- Acknowledgement is handled by the billing library; no server is involved.

Limits to communicate and handle:

- The unlock follows the **Google account used to buy it**. Switching Play accounts
  makes ads return until the buyer switches back.
- Restoring on a new phone requires internet and a Play-installed build; a
  sideloaded APK cannot query Play Billing.
- If the app is offline after a reinstall, keep a local grace state and show
  "Restore purchase" rather than assuming the user never paid.
- A refund removes the purchase from `getAvailablePurchases`; revoke on the next
  online launch.
- Purchases do not transfer to iOS or another store. If iOS launches later, it needs
  its own product.
- Client-side entitlement can be bypassed on a rooted device. Acceptable at ₱99;
  add server verification later only if refund abuse is material.

### Verification

Start client-side only: acknowledge the purchase and restore with
`getAvailablePurchases()` on launch. This is adequate for a low-price offline app.
If refund abuse appears later, add a small server endpoint that verifies the
purchase token with the Play Developer API before granting entitlement.

## 4. Play Console setup

1. Create the app entry and upload an **AAB** to an internal testing track.
   New apps must use AAB, not APK.
2. **Monetize → Products → In-app products** → create `remove_ads`, set the PH
   price, activate it.
3. Add **license testers** (your Google account) under Setup → License testing.
4. Install the build through the **internal testing Play link** with the tester
   account. Sideloaded EAS APKs cannot query Play Billing, so they cannot test the
   real purchase flow.
5. Complete the privacy policy, Data safety form, and content rating.
6. Test purchases are free for license testers; refunds are done in Play Console.

## 5. Paywall UI

Use a modal route (`app/paywall.tsx`) presented over Profile, or an inline card
that expands. A modal is cleaner and gives room for:

- Blue/gold brand header and a small "AD-FREE" badge
- Three checkmarked benefits
- Product price from Play (never hardcode the currency string)
- Primary **Remove ads — ₱xx** button
- Secondary **Restore purchase**
- Tiny disclosure: "Payment is charged to your Google Play account. Manage or cancel
  in Play Store → Subscriptions & purchases."

States required: loading price, purchasing, pending (slow payment), cancelled,
network error, already owned, unavailable (Expo Go/dev without Play install).

## 6. Testing checklist

- [ ] Development stub: simulate purchase/restore behind `__DEV__` only, so the
      paywall can be reviewed without Play.
- [ ] Internal testing build: real purchase with a license tester account.
- [ ] Acknowledge succeeds; entitlement survives app restart.
- [ ] Restore after reinstall and on a second device with the same account.
- [ ] Refund in Play Console → entitlement disappears on next online launch.
- [ ] Pending payment → app shows "pending", then grants on completion.
- [ ] Cancelled purchase → no entitlement, no crash.
- [ ] After purchase: no banner, no interstitial after a mock, no rewarded card.
- [ ] Verify no ad requests are made after entitlement (Metro logs / AdMob traffic).
- [ ] Price displays in the store's localized currency.
- [ ] Purchase while offline → clear error, retry works.
- [ ] Restore with no purchase → "Nothing to restore" message.

## 7. Edge cases and policy

- **Family sharing** does not apply to in-app purchases.
- **Multiple Google accounts**: entitlement follows the purchasing account.
- **Refunds/chargebacks**: revoke on the next online restore; keep an offline grace
  period so a temporary network failure does not strip a paid user.
- **Price changes**: existing owners keep the unlock; new buyers see the new price.
- **Ads policy**: after purchase, every ad format must be gone. Do not keep a
  "bonus" rewarded ad for ad-free users.
- **Kids/families**: if the app is listed for families, ensure the purchase flow
  follows Play's families policy.
- **Do not** advertise "lifetime" beyond the life of the Google account/app listing.

## 8. Implementation phases

1. **Entitlement plumbing** — store, hydration, ad gates. No purchase UI yet.
2. **Paywall UI + dev stub** — review design and states without billing.
3. **Billing integration** — `expo-iap`, product lookup, purchase/acknowledge,
   restore, listeners.
4. **Internal testing** — Play-installed AAB, license testers, refund test.
5. **Production** — release with `remove_ads` active, monitor conversion and crashes.

## 9. Open decisions

- Launch price: **₱99**; move to **₱149** only after the thresholds above. A middle
  option is ₱129 if ₱149 feels too aggressive after launch.
- Rewarded bonus for ad-free users: **hide it** (simplest, consistent with
  "remove ads"). Alternative: keep the 10-item bonus without an ad as a paid perk.
- Backend verification: skip for v1; add only if refund abuse is observed.
- Support/tip product: out of scope; keep the store listing focused.

## 10. Definition of done

- A user can buy once from Profile, see the localized price, and immediately lose
  every ad placement.
- Reinstall/restore works.
- The app never requests ads for an entitled account.
- Refunds revoke access on the next online launch.
- The purchase flow is tested through Play internal testing, not a sideloaded APK.
