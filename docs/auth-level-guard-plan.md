# Auth-Level Guard Plan

## Goal

Refactor feature access around two separate checks:

1. **Auth level**
   - `guest`
   - `unverified`
   - `verified`
2. **Profile completeness**
   - required before some flows unlock

Do **not** overload `is_verified` to mean profile completion.

---

## Current Audit Findings

### Routing / guard issues
- `app/(protected)/(guest)/emergency/index.tsx` lives in the guest group even though guest access is no longer desired.
- `app/(protected)/(verified)/_layout.tsx` is named `VerifiedLayout`, but it currently only blocks **guests**. It does **not** block authenticated but unverified users.
- `app/(protected)/home.tsx` uses a local `guardedPress()` that only checks `isGuest`.
- `components/HeaderWithSidebar.tsx` still routes directly into emergency / report / map / trust-score without auth-level-aware guards.
- `app/(protected)/(guest)/hotlines/index.tsx` currently forwards hotline taps into the emergency page. If guests lose emergency access, hotlines need a fallback behavior or guests lose usable hotline access.

### Profile / verification issues
- `app/(protected)/profile/index.tsx` already has the editable profile fields needed for a fill-up flow.
- Current editable fields are:
  - `first_name`
  - `middle_name`
  - `last_name`
  - `birth_date`
  - `permanent_address_1`
- `Upload Another ID` currently opens the manual verification modal directly.
- National ID verification already sets `profile.is_verified = true`, but it does **not** fill address, so a user can become verified while still having an incomplete profile.

---

## Proposed Source of Truth

### 1. Auth level
Derive one runtime auth level from the current app state:

- `guest`
  - `isGuest === true`
  - no Supabase session
- `unverified`
  - authenticated session exists
  - `profile.is_verified !== true`
- `verified`
  - authenticated session exists
  - `profile.is_verified === true`

### 2. Profile completeness
Derive one runtime completeness flag from saved profile data.

Recommended required fields for now:
- `first_name`
- `last_name`
- `birth_date`
- `permanent_address_1`

Notes:
- `middle_name` stays optional.
- completeness should use **saved** profile data as the real gate.
- local unsaved edits can improve UX, but unlock should depend on persisted data.

---

## Target Access Rules

| Feature | Guest | Unverified + Incomplete Profile | Unverified + Complete Profile | Verified + Incomplete Profile | Verified + Complete Profile |
|---|---|---:|---:|---:|---:|
| Hotlines | ✅ | ✅ | ✅ | ✅ | ✅ |
| Emergency | ❌ | ❌ | ✅ | ❌ | ✅ |
| Report Incident | ❌ | ❌ | ❌ | ❌ | ✅ |
| Map | ❌ | ❌ | ❌ | ✅ | ✅ |
| Trust Score | ❌ | ❌ | ❌ | ✅ | ✅ |
| Cases | ❌ | ❌ | ❌ | ✅ | ✅ |
| Upload Another ID | ❌ | ❌ | ✅ | n/a | n/a |
| Verify with National ID | ❌ | ✅ | ✅ | n/a | n/a |

### Interpretation
- **Guest** only gets hotline access as a real product feature.
- **Unverified** users can unlock **Emergency** once their profile is complete.
- **Verified** users unlock all features, but **Emergency** and **Report Incident** still require a complete profile.
- **Manual verification upload** requires a complete profile first.
- **National ID verification** stays available without that manual-upload gate.

---

## Implementation Plan

## Phase 1 — Centralize the guard model

Create one small access layer so rules live in one place.

### Add a shared helper / hook
Recommended shape:
- `lib/guards/access-control.ts` or `hooks/useAccessControl.ts`

Responsibilities:
- derive `authLevel`
- derive `isProfileComplete`
- resolve feature access for:
  - `hotlines`
  - `emergency`
  - `report`
  - `map`
  - `trust-score`
  - `cases`
  - `manual-verification-upload`
  - `national-id-verification`
- return a structured result like:
  - `allowed`
  - `reason` = `guest_blocked | verification_required | profile_required`

Why:
- removes duplicated `isGuest` checks
- keeps route guards and button guards consistent
- easier to test

---

## Phase 2 — Fix route semantics

### 2.1 Keep hotlines as the only guest route group feature
- leave `hotlines` in the guest-open area
- remove emergency from guest semantics

### 2.2 Move emergency out of the guest group
Current:
- `app/(protected)/(guest)/emergency/index.tsx`

Planned:
- move to a non-guest authenticated location, e.g.
  - `app/(protected)/(authenticated)/emergency/index.tsx`
  - or `app/(protected)/emergency/index.tsx`

Reason:
- the current file placement no longer matches the desired rule set

### 2.3 Make the verified group actually verified-only
Update:
- `app/(protected)/(verified)/_layout.tsx`

Planned behavior:
- guests → blocked
- authenticated but unverified users → blocked
- verified users → allowed

This should cover:
- `report-incident`
- `map`
- `trust-score`
- `cases`

Note:
- `report-incident` still needs its own **profile completeness** guard even after the verified layout is fixed.

---

## Phase 3 — Apply guards to feature entry points

Do not rely only on route files.
Every entry point should use the same access rules.

### 3.1 Home dashboard
Update:
- `app/(protected)/home.tsx`

Planned changes:
- replace the current guest-only `guardedPress()` with feature-aware guard resolution
- emergency card:
  - guest → blocked
  - unverified incomplete → prompt to complete profile first
  - unverified complete → allow
  - verified incomplete → prompt to complete profile first
  - verified complete → allow
- report card:
  - guest → sign-up prompt
  - unverified → verification prompt
  - verified incomplete → profile prompt
  - verified complete → allow
- map / trust-score / cases:
  - guest → sign-up prompt
  - unverified → verification prompt
  - verified → allow

### 3.2 Sidebar navigation
Update:
- `components/HeaderWithSidebar.tsx`

Planned changes:
- stop pushing routes blindly
- resolve feature access first
- keep labels/icons in sync with access state
- emergency should no longer appear unlocked for guests

### 3.3 Any internal deep links / pushes
Audit and update direct pushes into:
- emergency
- report-incident
- map
- cases
- trust-score

Reason:
- route guards protect deep access
- button guards keep UX clean before navigation

---

## Phase 4 — Add route-level safety guards

Button guards are not enough.
Direct navigation must still be blocked safely.

### 4.1 Emergency screen route guard
Target file after move:
- emergency route component

Planned behavior:
- guest → block
- authenticated + incomplete profile → block with prompt
- authenticated + complete profile → allow

This is intentionally **not** a verified-only screen.

### 4.2 Report screen route guard
Target:
- `app/(protected)/(verified)/report-incident/index.tsx`

Planned behavior:
- verified + incomplete profile → block with prompt
- verified + complete profile → allow

### 4.3 Verified layout route guard
Target:
- `app/(protected)/(verified)/_layout.tsx`

Planned behavior:
- non-verified users cannot enter verified-only routes even by direct path

---

## Phase 5 — Profile completion UX

Reuse the existing profile screen instead of creating a new fill-up flow.

### Target file
- `app/(protected)/profile/index.tsx`

### Planned changes
- add a reusable `isProfileComplete` check
- show clearer incomplete-profile status near the verification section
- if a blocked feature redirects here, show a focused prompt:
  - `Complete your profile first to use Emergency`
  - `Complete your profile first to report an incident`
  - `Complete your profile first before uploading another ID`
- make it obvious that **Save** is required before unlock

### Optional UX improvement
Support `intent` / `returnTo` params, for example:
- go to profile from emergency blocker
- user saves profile
- app returns them to emergency automatically

This same mechanism can also reopen the manual upload flow after profile completion.

---

## Phase 6 — Verification flow changes

### 6.1 Keep National ID flow available
Target:
- `app/(protected)/profile/index.tsx`
- `supabase/functions/verify-national-id/index.ts`

Planned behavior:
- do **not** block National ID verification behind profile completeness
- user can still scan National ID directly
- after success, refresh profile and access state

### 6.2 Gate manual verification upload behind profile completion
Target:
- `app/(protected)/profile/index.tsx`
- `components/verification/ManualVerificationModal.tsx`

Planned behavior:
- when user taps `Upload Another ID`:
  - if profile is incomplete → do not open upload modal
  - show prompt to finish + save profile first
  - optionally scroll to the personal info section
- only open `ManualVerificationModal` once saved profile completeness is satisfied

### 6.3 Keep access control based on `profile.is_verified`
Manual verification request states (`pending`, `rejected`) may affect messaging, but not final feature unlock.

Final unlock remains:
- `profile.is_verified === true`

---

## Phase 7 — Hotlines behavior cleanup

This is required because guests are supposed to keep hotline access.

### Target file
- `app/(protected)/(guest)/hotlines/index.tsx`

### Current issue
Hotline taps route into emergency.
That breaks the new rule because guests will no longer be allowed into emergency.

### Planned fix
Change hotline tap behavior based on access:
- guest:
  - dial directly using the device dialer
  - do **not** forward into emergency
- users who are allowed into emergency:
  - either keep current prefilled emergency flow
  - or simplify to direct dial if that ends up better UX

Also update stale copy like:
- `Go to Emergency page to save hotlines`

That copy is no longer valid for guests.

---

## Prompt / blocker behavior

Use three blocker types consistently.

### 1. Guest blocker
Message:
- `Create an account to access this feature.`

Used for:
- emergency
- report
- map
- trust-score
- cases
- manual upload

### 2. Profile blocker
Message pattern:
- `Complete your profile first before using this feature.`

Used for:
- emergency
- report
- manual upload

### 3. Verification blocker
Message pattern:
- `Verify your identity to access this feature.`

Used for:
- report
- map
- trust-score
- cases

Manual-upload nuance:
- if user selects `Upload Another ID` from a verification blocker while incomplete, redirect them into profile completion first

---

## Affected Files

### Directly affected
- `app/(protected)/(guest)/_layout.tsx`
- `app/(protected)/(guest)/emergency/index.tsx` → likely moved
- `app/(protected)/(guest)/hotlines/index.tsx`
- `app/(protected)/(verified)/_layout.tsx`
- `app/(protected)/(verified)/report-incident/index.tsx`
- `app/(protected)/home.tsx`
- `app/(protected)/profile/index.tsx`
- `components/HeaderWithSidebar.tsx`

### New helper(s)
- `lib/guards/access-control.ts` or similar
- optional reusable blocker modal / navigation helper hook

---

## Test Matrix

### Guest
- [ ] can access hotlines
- [ ] cannot enter emergency
- [ ] cannot enter report
- [ ] cannot enter map / trust-score / cases
- [ ] hotline tap remains usable

### Unverified + incomplete profile
- [ ] cannot enter emergency
- [ ] sees complete-profile prompt
- [ ] cannot enter report / map / trust-score / cases
- [ ] cannot open `Upload Another ID`
- [ ] can still use National ID verification

### Unverified + complete profile
- [ ] can enter emergency
- [ ] still cannot enter report / map / trust-score / cases
- [ ] can open `Upload Another ID`

### Verified + incomplete profile
- [ ] can enter map / trust-score / cases
- [ ] cannot enter emergency
- [ ] cannot enter report
- [ ] sees complete-profile prompt

### Verified + complete profile
- [ ] can enter all features

### Route safety
- [ ] direct deep links still respect the same rules
- [ ] sidebar, home, and any internal pushes behave the same way

---

## One Assumption To Confirm

This plan treats **home/profile/settings** as shell pages that may still exist for guests.
The gated **product feature** access becomes hotlines-only for guests.

If you want guest users blocked from profile/settings too, that should be added as a separate rule.
