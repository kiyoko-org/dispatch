# App-side Realtime + Profile Refactor Plan

Date: 2026-03-16
Scope: fix app-side architecture only. No `dispatch-lib` changes.

## Goal

Stabilize 2 user-facing problems without touching `dispatch-lib`:

1. **Reports realtime stops after disconnect** and does not reliably recover.
2. **Trust score UI shows stale/default state** because the dashboard card and trust-score page do not share one profile source of truth.

This plan keeps `dispatch-lib` in the app, but stops depending on its profile/reports hooks for user-facing state that must stay consistent and resilient.

---

## Non-goals

- No changes inside `@kiyoko-org/dispatch-lib`
- No server/schema changes
- No new packages required
- No full rewrite of categories/notifications/user-data sync

`@react-native-community/netinfo` is already installed. Use it. Do not add dependencies.

---

## Current-state summary

## Main issue 1: two Supabase client paths

The app currently mixes 2 client stacks:

### App-owned client
- `lib/supabase.ts`
- used by:
  - `components/AuthProvider.tsx`
  - `app/auth/login.tsx`
  - `hooks/useRealtimeReports.ts`
  - some direct profile fetches

### Dispatch-lib-owned client
- initialized in `components/DispatchProvider.tsx`
- used by:
  - `useProfile`
  - `useReports`
  - `useRealtimeReports` from the lib
  - `useNotifications`
  - category hooks

This split is the root of the inconsistent state problem.

---

## Main issue 2: profile state is per-screen, not shared

Current usage:

- `app/(protected)/home.tsx` → `useProfile(session?.user?.id)`
- `app/(protected)/trust-score/index.tsx` → `useProfile(session?.user?.id)`

Both hook instances start empty, fetch independently, subscribe independently.

Result:
- home hides until profile loads
- trust-score page renders immediately and computes level from `null`
- `null` becomes Level 0, then later updates to the real level

This explains the trust score flicker.

There are also more app-owned profile reads outside the trust page:
- `components/HeaderWithSidebar.tsx`
- `app/(protected)/profile/index.tsx`
- `app/(protected)/profile/account.tsx`

So profile data is duplicated in several places.

---

## Main issue 3: reports realtime is screen-local and has no reconnect strategy

Current app hook:
- `hooks/useRealtimeReports.ts`

Problems:
- subscribes once
- logs status but does not react to disconnect states
- no retry on `CHANNEL_ERROR`, `TIMED_OUT`, or `CLOSED`
- no network-aware reconnect
- no foreground reconnect
- no central shared cache

Also the app uses 2 different report subscription paths:

### App-owned reports path
- `hooks/useRealtimeReports.ts`
- used by:
  - `app/(protected)/home.tsx`
  - `components/FloatingReportsButton.tsx`

### Dispatch-lib reports path
- `@kiyoko-org/dispatch-lib` `useRealtimeReports`
- used by:
  - `app/(protected)/map/index.tsx`

And there is a third read path:
- `useReports()` from the lib
- used by:
  - home
  - cases list
  - report incident
  - case detail

Result: report state is fragmented.

---

## Main issue 4: auth token refresh lifecycle is in the wrong place

Current AppState lifecycle is attached in:
- `app/auth/login.tsx`

That means token refresh control lives in the login screen module, not the app auth lifecycle.

This is fragile because:
- authenticated app sessions should not depend on login screen side effects
- realtime can silently degrade if auth lifecycle is not globally managed

---

## Desired target architecture

## Principles

- One app-owned source of truth per domain
- Shared state above screens, not per-screen fetches
- Realtime subscriptions owned by providers, not leaf screens
- Reconnect logic centralized and reusable
- Continue using `dispatch-lib` where it is harmless for now
- Stop using `dispatch-lib` hooks for **profile** and **reports** in the app UI

---

## Target provider tree

```text
app/_layout.tsx
  ThemeProvider
  DispatchProvider                # temporary: categories, notifications, other lib-only features
  AuthProvider                    # owns auth session + AppState token refresh
  UserDataProvider
  NotificationProvider
  Stack

app/(protected)/_layout.tsx
  CurrentProfileProvider          # app-owned current user profile source of truth
  ReportsProvider                 # app-owned reports source of truth + resilient realtime
  EmergencyContactsProvider
  ChatProvider
  GlobalReportsInitializer        # consumes ReportsProvider status-change events
  Stack
```

Why this shape:
- `AuthProvider` already owns session state. Keep auth lifecycle there.
- `CurrentProfileProvider` and `ReportsProvider` only need to exist for authenticated screens.
- `NotificationProvider` already exists globally, so protected-side consumers can show banners.

---

## Target ownership by domain

| Domain | Target owner | Current replacements |
|---|---|---|
| Auth session + token refresh | `components/AuthProvider.tsx` | remove AppState logic from `app/auth/login.tsx` |
| Current user profile | new `contexts/CurrentProfileContext.tsx` | replace `useProfile(...)`, sidebar/profile direct fetches |
| Reports list + user report subset + report status events | new `contexts/ReportsContext.tsx` | replace app hook + lib realtime hook + most `useReports()` reads |
| Categories | existing `DispatchProvider` | keep for now |
| Notifications table hook | existing lib hook | keep for now |

---

## Current → target usage map

| Screen / component | Current | Target |
|---|---|---|
| `app/(protected)/home.tsx` | `useProfile` + `useReports` + app `useRealtimeReports` | `useCurrentProfile` + `useReportsStore` |
| `app/(protected)/trust-score/index.tsx` | `useProfile` | `useCurrentProfile` |
| `app/(protected)/map/index.tsx` | lib `useRealtimeReports` | `useReportsStore` |
| `app/(protected)/cases/index.tsx` | `useReports` | `useReportsStore` |
| `app/(protected)/cases/[id].tsx` | `useReports().getReportInfo` | `useReportsStore` or direct app service |
| `app/(protected)/report-incident/index.tsx` | `useReports` | `useReportsStore` actions or app report service |
| `components/FloatingReportsButton.tsx` | app `useRealtimeReports` | `useReportsStore` |
| `components/HeaderWithSidebar.tsx` | direct `supabase.from('profiles')` | `useCurrentProfile` |
| `app/(protected)/profile/index.tsx` | direct profile fetch | `useCurrentProfile` |
| `app/(protected)/profile/account.tsx` | direct profile fetch | `useCurrentProfile` |
| `components/GlobalReportsInitializer.tsx` | module-level callback bridge | consume `ReportsProvider` status events |

---

## Implementation phases

## Phase 0 — quick stabilization before structural migration

Purpose: stop the most visible bad behavior first.

### 0.1 Move AppState token refresh into `AuthProvider`

Update:
- `components/AuthProvider.tsx`
- `app/auth/login.tsx`

Actions:
- Move `AppState.addEventListener('change', ...)` from login screen into `AuthProvider`
- Start auth auto refresh when app becomes active
- Stop auth auto refresh when app goes background/inactive
- Set up and clean up listener inside provider

Result:
- auth/session lifecycle becomes global and deterministic
- login screen no longer owns app-wide side effects

### 0.2 Trust-score page should not derive level from `null`

Update:
- `app/(protected)/trust-score/index.tsx`

Actions:
- Add temporary loading guard so the trust-score page does not render Level 0 while profile is still unresolved
- This is a stopgap only. Real fix is Phase 2.

Result:
- immediate UX improvement even before provider migration

---

## Phase 1 — reusable resilient realtime utility

Purpose: avoid writing reconnect logic twice.

Add:
- `lib/realtime/createResilientChannel.ts` or `hooks/useResilientRealtimeChannel.ts`

Responsibility:
- create a Supabase channel
- track connection status
- retry on disconnect states
- respond to app foreground and network recovery
- clean up timers and stale channels

### Required behavior

The utility should support:
- `SUBSCRIBED` → mark connected, reset retry counter
- `CHANNEL_ERROR` → schedule reconnect
- `TIMED_OUT` → schedule reconnect
- `CLOSED` → schedule reconnect
- app foreground → force refresh + reconnect if needed
- network back online → force refresh + reconnect if needed

### Retry strategy

Use bounded exponential backoff, e.g.:
- 1s
- 2s
- 5s
- 10s
- 30s max

Rules:
- only one reconnect timer at a time
- remove old channel before recreating
- reset backoff after successful subscribe
- ignore reconnect when there is no active session/user

### Network integration

Use installed package:
- `@react-native-community/netinfo`

No new dependency needed.

### AppState integration

Use React Native `AppState` inside the utility or provider wrapper.

### Suggested shape

```ts
interface ResilientChannelOptions {
  channelName: string;
  enabled: boolean;
  createChannel: () => RealtimeChannel;
  onSubscribed?: () => void;
  onDisconnected?: (status: string) => void;
  onReconnect?: () => Promise<void> | void;
}
```

This should stay generic so both profile and reports providers can reuse it.

---

## Phase 2 — current profile source of truth

Purpose: one shared profile state for all protected screens.

Add:
- `contexts/CurrentProfileContext.tsx`

Expose:

```ts
type CurrentProfileContextValue = {
  profile: ProfileRow | null;
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  refresh: () => Promise<void>;
};
```

Use app-owned client:
- `lib/supabase.ts`

Use typed rows:
- `Database['public']['Tables']['profiles']['Row']`
  from `@kiyoko-org/dispatch-lib/database.types`

### Provider responsibilities

When `session.user.id` exists:
1. fetch current profile once
2. subscribe to the current profile row only
3. keep one in-memory value for all children
4. reconnect when realtime drops
5. clear profile state on logout

### Realtime scope

Subscribe to:
- `public.profiles`
- `event: 'UPDATE'`
- `filter: id=eq.<current-user-id>`

### Screen migration in this phase

Update:
- `app/(protected)/_layout.tsx` → mount `CurrentProfileProvider`
- `app/(protected)/home.tsx`
- `app/(protected)/trust-score/index.tsx`
- `components/HeaderWithSidebar.tsx`
- `app/(protected)/profile/index.tsx`
- `app/(protected)/profile/account.tsx`

### Rules after migration

- Do not call `useProfile(session?.user?.id)` in app screens anymore
- Do not fetch current profile directly from leaf components anymore
- Trust score level must be computed only from shared profile state

### UX rule

If profile is unresolved:
- render loading/skeleton/splash state
- do not render fallback trust score as `0` unless the actual loaded value is `0`

---

## Phase 3 — reports source of truth + resilient realtime

Purpose: one reports store for the whole authenticated app.

Add:
- `contexts/ReportsContext.tsx`

Expose:

```ts
type ReportStatusChange = {
  reportId: number;
  oldStatus: string;
  newStatus: string;
  incidentTitle: string;
  changedAt: string;
};

type ReportsContextValue = {
  reports: ReportRow[];
  currentUserReports: ReportRow[];
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  refresh: () => Promise<void>;
  getReportById: (id: number) => ReportRow | null;
  lastStatusChange: ReportStatusChange | null;
  clearLastStatusChange: () => void;
};
```

Use app-owned client:
- `lib/supabase.ts`

Use typed rows:
- `Database['public']['Tables']['reports']['Row']`

### Provider responsibilities

When authenticated:
1. fetch accessible reports once
2. own the single realtime subscription for reports
3. update local state on insert/update/delete
4. derive `currentUserReports` from shared `reports`
5. detect status changes for current user reports only
6. reconnect on disconnect
7. refresh on reconnect / foreground / network recovery
8. clear state on logout

### Realtime scope

Preferred:
- subscribe to all accessible report changes once
- derive user-specific subsets in memory

Reason:
- map needs all reports
- home/cases/floating button need current-user subsets
- one global channel is simpler than multiple overlapping channels

### Status-change detection

When a report update arrives:
- compare previous report status vs next report status
- only emit a status-change event if:
  - report belongs to current user
  - status actually changed

This replaces the current module-level callback pattern in `hooks/useRealtimeReports.ts`.

### Reconnect details

Reuse Phase 1 utility.

On successful reconnect:
- call `refresh()` after `SUBSCRIBED`
- this prevents stale local state after offline periods

### Screen migration in this phase

Update:
- `app/(protected)/_layout.tsx` → mount `ReportsProvider`
- `app/(protected)/home.tsx`
- `components/FloatingReportsButton.tsx`
- `components/GlobalReportsInitializer.tsx`
- `app/(protected)/map/index.tsx`
- `app/(protected)/cases/index.tsx`

### Rules after migration

- Do not use app `hooks/useRealtimeReports.ts`
- Do not use lib `useRealtimeReports()` in app screens
- Avoid `useReports()` in read-only screens once provider migration is done

---

## Phase 4 — report actions and detail reads

Purpose: remove the remaining report data fragmentation.

Remaining touchpoints:
- `app/(protected)/report-incident/index.tsx`
- `app/(protected)/cases/[id].tsx`
- possibly other report detail reads

### Preferred direction

Move report CRUD/read operations behind app-owned report services or `ReportsProvider` actions.

Possible split:
- provider owns shared list state + refresh + eventing
- app service owns low-level CRUD

Example actions:

```ts
createReport(payload)
updateReport(id, payload)
deleteReport(id)
fetchReportById(id)
```

Use app-owned `supabase` directly or existing local helpers where practical.

### Why this phase matters

If screens keep calling `useReports()` independently:
- they still create local hook state
- they still trigger redundant fetches
- list/detail screens can drift from provider state

### Migration target

After this phase, reports in the app should come from exactly one app-owned path.

---

## Phase 5 — replace event bridge + remove duplicate fetches

Purpose: remove leftover duplication and hidden side effects.

### 5.1 Replace `setStatusChangeCallback`

Current file:
- `hooks/useRealtimeReports.ts`
- `components/GlobalReportsInitializer.tsx`

Problem:
- module-level mutable callback
- hidden dependency
- easy to forget cleanup

Target:
- `GlobalReportsInitializer` reads `lastStatusChange` from `ReportsContext`
- shows notification
- calls `clearLastStatusChange()` after handling

### 5.2 Remove direct current-profile fetches from leaf components

Replace with `useCurrentProfile()` in:
- `components/HeaderWithSidebar.tsx`
- `app/(protected)/profile/index.tsx`
- `app/(protected)/profile/account.tsx`

### 5.3 Remove duplicate report reads

Replace with `useReportsStore()` in:
- `home`
- `map`
- `cases`
- `floating button`
- later report detail flows

---

## Phase 6 — cleanup and guardrails

After migration is stable:

### Decommission app-local hook

Remove or stop exporting:
- `hooks/useRealtimeReports.ts`

### Stop app usage of these lib hooks for migrated domains

Avoid in app screens:
- `useProfile`
- `useReports`
- lib `useRealtimeReports`

Keep using `dispatch-lib` only where still acceptable for now:
- categories
- notifications
- other features not yet migrated

### Add guardrails

- lint/search check before merge: no app screen should import `useProfile` for current user state
- no app screen should import either realtime reports hook after provider migration
- no leaf component should fetch current profile directly from `supabase`

---

## File-by-file execution plan

## Update existing files

### `components/AuthProvider.tsx`
- own AppState token refresh lifecycle
- optionally expose auth-ready flag if needed

### `app/auth/login.tsx`
- remove top-level AppState auth refresh listener
- keep screen focused on sign-in only

### `app/(protected)/_layout.tsx`
- mount `CurrentProfileProvider`
- mount `ReportsProvider`
- keep `GlobalReportsInitializer` under them

### `app/(protected)/home.tsx`
- replace `useProfile(...)` with `useCurrentProfile()`
- replace `useReports()` + app realtime hook with `useReportsStore()`
- derive trust card from shared profile state
- derive report count from `currentUserReports`

### `app/(protected)/trust-score/index.tsx`
- replace `useProfile(...)` with `useCurrentProfile()`
- gate render on shared profile loading state
- never compute trust level from unresolved `null`

### `app/(protected)/map/index.tsx`
- replace lib `useRealtimeReports()` with `useReportsStore()`
- keep categories via `DispatchProvider` for now

### `app/(protected)/cases/index.tsx`
- replace `useReports()` reads with `useReportsStore()`
- remove redundant fetch-on-focus if provider already stays fresh
- keep manual refresh only if user-triggered

### `app/(protected)/cases/[id].tsx`
- migrate to provider/service read path

### `app/(protected)/report-incident/index.tsx`
- migrate add/report refresh flow to provider/service path
- after submit, update shared store or call provider `refresh()` once

### `components/FloatingReportsButton.tsx`
- replace app hook with `useReportsStore()`

### `components/GlobalReportsInitializer.tsx`
- consume `lastStatusChange` from reports context
- show toast once per event

### `components/HeaderWithSidebar.tsx`
- replace direct profile fetch with `useCurrentProfile()`

### `app/(protected)/profile/index.tsx`
- replace local profile state/fetch with `useCurrentProfile()`

### `app/(protected)/profile/account.tsx`
- replace local profile state/fetch with `useCurrentProfile()`

---

## Add new files

### `contexts/CurrentProfileContext.tsx`
- shared current-user profile state
- profile fetch + realtime + reconnect

### `contexts/ReportsContext.tsx`
- shared reports state
- current-user report derivation
- status-change eventing
- realtime reconnect

### `lib/realtime/createResilientChannel.ts` or `hooks/useResilientRealtimeChannel.ts`
- shared reconnect/backoff logic

### optional `lib/types/db.ts`
- local aliases for `ProfileRow`, `ReportRow`
- avoids repeating long type paths

---

## Known temporary compromises

Even after this app-side refactor, the app will still have `dispatch-lib` initialized because some features still rely on it.

That is acceptable short-term if:
- profile and reports stop using lib hooks in app UI
- app-owned providers become the source of truth for those domains

Temporary reality after refactor:
- categories/notifications may still use the lib client
- profile/reports/trust score will use app-owned providers only

This is enough to fix the user-visible issues now.

---

## Acceptance criteria

## Trust score

- opening trust-score from home does **not** flash Level 0 unless the real loaded score is 0
- home trust card and trust-score page always show the same level from one shared profile state
- remote trust score updates appear without requiring screen remount

## Reports realtime

- when network drops and returns, reports realtime reconnects automatically
- when app goes background then foreground, reports provider refreshes and reconnects if needed
- after reconnect, status updates continue arriving without app restart
- only one reports realtime subscription is active for the app shell

## Data consistency

- home, map, cases, floating button all read from one reports store
- current profile displays in header/profile/trust/home from one profile store
- navigating between screens does not trigger repeated cold-start fetches for the same profile/report list

---

## Manual QA checklist

## Auth lifecycle
- launch app from signed-out state
- sign in
- background app
- foreground app
- confirm session remains healthy and app data still updates

## Trust score
- sign in with user whose trust score is not 0
- open home
- open trust-score page
- verify no `0 -> actual` flicker
- change trust score in backend
- verify both home and trust page update

## Reports realtime
- open home/cases/map
- change a report status from backend/dashboard
- verify UI updates
- turn network off for ~30s
- turn network back on
- verify store reconnects and catches up
- background app for several minutes, foreground again
- verify status updates continue

## Notification bridge
- update current user report status
- verify banner appears once only
- verify same event is not replayed repeatedly on navigation

---

## Recommended implementation order

1. Move AppState token refresh into `AuthProvider`
2. Add temporary trust-score loading guard
3. Build resilient realtime utility
4. Build `CurrentProfileProvider`
5. Migrate home + trust-score first
6. Build `ReportsProvider`
7. Migrate home + floating button + global initializer
8. Migrate map + cases
9. Migrate report detail/create paths
10. Remove old hooks/imports

This order reduces user-visible bugs early, then removes structural duplication incrementally.

---

## Definition of done

This app-side refactor is done when:
- trust score no longer flickers due to per-screen profile fetches
- reports realtime reconnects automatically after disconnects
- report/profile state is shared above screens
- app no longer mixes multiple hook-level sources of truth for profile/reports
- no `dispatch-lib` modification was required
