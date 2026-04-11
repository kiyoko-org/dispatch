# Manual Verification Mobile Flow Plan

## Goal

Let **unverified users** submit alternative identity documents from the Dispatch mobile app when they cannot use the existing National ID QR flow.

This is a **planning doc only**. No implementation yet.

---

## Current State

### Existing verification path

The app already supports **automatic National ID verification** from the profile screen:

- `dispatch/app/(protected)/profile/index.tsx`
- calls Supabase Edge Function: `verify-national-id`
- successful verification sets `profiles.is_verified = true`

### Existing gated features

Verified-only routes are behind:

- `dispatch/app/(protected)/(verified)/_layout.tsx`

### Existing storage helper limitation

Current storage service is not suitable for identity docs:

- `dispatch/lib/services/storage.ts`

Reason:
- it assumes public URL flows
- identity docs must stay in the private `verification-docs` bucket
- manual verification needs storage-path-based uploads, not public URLs

### Backend state now available

The backend side is ready for manual verification:

- `verification_requests` table exists
- `verification-docs` private bucket exists
- admin review RPC exists
- verified users are blocked from creating new manual verification requests at the DB level
- one pending request per user is enforced at the DB level

### Dispatch-lib support now available

`dispatch-lib` now has the needed client-side DB helpers for:

- fetch my verification requests
- submit verification request
- review verification request
- get signed URL

### Recommended shared-helper direction

For the storage/upload side, the best architecture is:

- put **shared verification rules + storage path logic** in `dispatch-lib`
- keep **platform-specific file acquisition/conversion** in each app

That means:

#### Shared in `dispatch-lib`
- bucket name
- allowed mime types
- max file size
- storage path builder
- request-state derivation helper
- optional generic upload helper that accepts binary payloads

#### Mobile-specific in `dispatch`
- Expo picker integration
- camera/gallery/document selection
- local file URI to binary conversion
- mobile upload UX and progress

#### Dashboard-specific in `dispatch-monorepo`
- browser `File` handling
- drag/drop or admin preview UX
- dashboard review presentation

---

## Product Outcome

From the profile screen, an unverified user should see **two verification paths**:

1. **Verify with National ID**
   - existing QR flow
2. **Upload another ID**
   - new manual review flow

This lets users verify with:

- Driver's license
- Passport
- Postal ID
- UMID

---

## UX States

The profile verification section should resolve to one of these states.

### 1. Verified
Condition:
- `profile.is_verified === true`

UI:
- show verified badge
- hide manual submission CTA
- hide National ID CTA

### 2. Pending manual review
Condition:
- `profile.is_verified !== true`
- latest verification request status is `pending`

UI:
- show pending badge/card
- show submitted document type
- show submitted date
- disable new submissions
- allow user to view simple status only

### 3. Rejected
Condition:
- `profile.is_verified !== true`
- latest verification request status is `rejected`

UI:
- show rejected state
- show review notes if present
- allow user to submit a **new** request

### 4. Unverified with no manual request
Condition:
- `profile.is_verified !== true`
- no current verification requests

UI:
- show both:
  - `Verify with National ID`
  - `Upload another ID`

---

## Source of Truth Rules

### Access control
Final gate remains:
- `profiles.is_verified`

### Submission/review workflow
Use:
- `verification_requests`

### Mobile status precedence
For profile screen rendering:

1. if `profile.is_verified === true` → `verified`
2. else if latest request is `pending` → `pending`
3. else if latest request is `rejected` → `rejected`
4. else → `unverified`

Notes:
- we should sort requests by `created_at desc`
- use the latest request for status UX
- old requests remain history, but MVP profile UI only needs the latest relevant one

---

## Proposed User Flow

## Flow A: National ID

Keep existing flow unchanged:

1. User opens Profile
2. User taps `Verify with National ID`
3. App scans QR
4. Edge function verifies data
5. Backend sets `profiles.is_verified = true`
6. Profile refreshes
7. User sees verified state

## Flow B: Manual verification

1. User opens Profile
2. User taps `Upload another ID`
3. App opens manual verification form/modal/screen
4. User selects document type
5. User uploads front image/file
6. User uploads back image/file if needed
7. App validates files locally
8. App generates request ID
9. App uploads files to private bucket path:
   - `{profile_id}/{request_id}/front.{ext}`
   - `{profile_id}/{request_id}/back.{ext}`
10. App inserts `verification_requests` row via `dispatch-lib`
11. App returns to Profile
12. Profile shows `Pending review`

## Flow C: Rejected resubmission

1. User opens Profile
2. App shows rejected state + review notes
3. User taps `Submit another ID`
4. User repeats manual submission flow
5. New request is created
6. Profile shows pending state

---

## Screen Plan

## Primary location

Use the existing Profile screen first:

- `dispatch/app/(protected)/profile/index.tsx`

Reason:
- current verification CTA already lives there
- users naturally check identity status there
- easier rollout than creating a new deep-linked verification area first

## Recommended UI structure

Replace the current single verification card with a more flexible section:

### Verification section layout

- status card at top
- primary CTA row(s) under it
- optional helper text

### Unverified state example

- status: `Not verified`
- CTA 1: `Verify with National ID`
- CTA 2: `Upload another ID`
- helper text: `Manual verification may take time for admin review.`

### Pending state example

- status: `Verification pending`
- subtitle: document type + submitted date
- helper text: `You already have a request under review.`
- no submit CTA

### Rejected state example

- status: `Verification rejected`
- subtitle: review notes if available
- CTA: `Submit another ID`

### Verified state example

- keep current success badge styling or improve it
- no additional verification CTAs

---

## Interaction Plan

## Form entry

Recommended MVP approach:
- open a dedicated modal or sheet from Profile
- do not overload the main Profile screen with many inline inputs

### Form fields

- document type (required)
- front file (required)
- back file (optional)

### Allowed file types

Must match backend bucket policy:
- jpg / jpeg
- png
- pdf

### Max file size

Must match backend bucket limit:
- 10 MB per file

### File picker behavior

Recommended:
- allow image picker for photo capture / gallery
- allow document picker for PDF

Open question for implementation:
- do we want camera capture in MVP, or gallery/document picker only?

---

## App-Side Validation Rules

Before upload:

- user must be authenticated
- profile must exist
- user must not already be verified
- document type required
- front file required
- file mime type must be allowed
- file size must be <= 10 MB
- back file optional

After fetch of existing requests:

- if latest request is `pending`, block submission UI
- if profile is already verified, block submission UI

Note:
- DB already enforces these rules too
- UI should still pre-check them for better UX

---

## Data + API Plan

## Read path

On profile screen load:

1. get current profile from existing profile context
2. fetch current user's verification requests via `dispatch-lib`
3. derive screen state from `profile.is_verified` + latest request

## Write path

On submit:

1. generate request UUID on device
2. upload front/back files to private bucket
3. collect storage paths
4. call `dispatch-lib.submitVerificationRequest(...)`
5. refresh profile/request state
6. show pending confirmation

## Upload path format

Use:

```text
{profile_id}/{request_id}/front.{ext}
{profile_id}/{request_id}/back.{ext}
```

---

## Storage Plan

## Do not reuse current generic storage service directly

Current service:
- `dispatch/lib/services/storage.ts`

Why not:
- optimized for public attachments
- returns public URLs
- not designed specifically for sensitive identity documents

## Recommended architecture

Use a **shared helper + thin app adapters** approach.

### Shared helper in `dispatch-lib`

Add a verification-specific helper module in `dispatch-lib` for reusable logic such as:

- `VERIFICATION_DOCS_BUCKET`
- allowed mime types
- max file size
- `buildVerificationStoragePath(...)`
- `deriveVerificationState(...)`
- `needsBackDocument(...)` if we later formalize doc-specific rules
- optional `uploadVerificationDocument(...)` that accepts generic binary input

Important:
- shared helper should return **storage paths**, not public URLs
- shared helper must stay React Native compatible
- shared helper must not depend on Expo APIs or browser-only APIs

### Mobile adapter in `dispatch`

Then add a thin mobile-side helper, e.g.:

- `dispatch/lib/services/verification-storage.ts`

Responsibilities:
- pick files from camera/gallery/document picker
- convert local file URIs into uploadable binary
- call shared `dispatch-lib` verification helper/client methods
- return storage paths to submission flow

### Dashboard adapter

Dashboard can use the same shared rules, while its UI layer handles:

- browser `File` objects
- preview interactions
- admin-only signed URL usage

This split gives maximum reuse without leaking platform-specific code into `dispatch-lib`.

---

## File/Module Plan

## Likely files to touch later

### Shared library
- `dispatch-monorepo/packages/dispatch-lib/index.ts`
- `dispatch-monorepo/packages/dispatch-lib/types.ts`
- possible new shared module:
  - `dispatch-monorepo/packages/dispatch-lib/verification.ts`

### Existing mobile file to update
- `dispatch/app/(protected)/profile/index.tsx`

### New mobile adapter/helper(s)
- `dispatch/lib/services/verification-storage.ts`

### Optional new UI components
- `dispatch/components/verification/VerificationStatusCard.tsx`
- `dispatch/components/verification/ManualVerificationModal.tsx`
- `dispatch/components/verification/DocumentPickerField.tsx`

### Optional hook
- `dispatch/hooks/useVerificationRequests.ts`

Note:
- if we want faster delivery, MVP can stay inside `profile/index.tsx`
- if file size grows too much, extract components early
- keep shared domain/storage rules in `dispatch-lib`
- keep platform-specific picker/file conversion logic in app repos

---

## Error Handling Plan

## User-facing errors

Need clear messages for:

- upload failed
- invalid file type
- file too large
- already pending
- already verified
- request insert failed after upload
- network failure

## Recovery behavior

If file upload succeeds but DB insert fails:
- show clear error
- do not silently swallow it
- note for implementation: consider cleanup of orphaned uploads later

MVP decision:
- accept possible orphaned uploads initially
- log failures clearly
- cleanup can be a later enhancement

---

## Edge Cases

### Already verified user
- should never see manual submit CTA
- DB already blocks insert anyway

### Pending request exists
- user cannot submit another one
- DB already enforces one pending request per profile

### Rejected request exists
- user can submit again

### Approved historical request exists
- `profile.is_verified` should already be true
- if somehow not, treat carefully in future audit tooling, but not MVP UI scope

### National ID succeeds while manual request is pending
- final state becomes verified via `profiles.is_verified = true`
- profile should show verified state
- pending request can remain in history

---

## Recommended Implementation Order

### Phase 1
Profile read-only status integration
- fetch manual verification requests
- derive UI state
- render status cards

### Phase 2
Private upload helper
- create verification-specific storage helper
- validate file type + size
- upload to private bucket

### Phase 3
Submission UI
- add document type picker
- add front/back pickers
- submit request via `dispatch-lib`

### Phase 4
Polish
- better notes display
- loading states
- retry flows
- cleanup/component extraction

---

## Acceptance Criteria

MVP planning is satisfied when future implementation will support:

- unverified users can start manual verification from Profile
- users can choose supported document type
- users can upload front/back files securely
- app stores only storage paths in DB
- app shows pending state after submit
- rejected users can resubmit
- verified users cannot resubmit
- National ID verification continues to work unchanged
- access gate still relies only on `profiles.is_verified`

---

## Recommended First Implementation Slice

Start with the smallest end-to-end slice:

1. add shared verification helper primitives in `dispatch-lib`
2. fetch and display latest verification request on Profile
3. add `Upload another ID` CTA for unverified users
4. create thin mobile verification upload adapter
5. support document type + front image only first in UI
6. submit request and show pending state

Then add:
- optional back file
- PDF support if picker handling is smooth
- rejected-state resubmission polish

---

## Open Questions For Iteration

1. Should manual verification use a modal, bottom sheet, or separate screen?
2. Should MVP support camera capture immediately, or gallery/document picker only?
3. Should we allow PDF on day one in the mobile app UI, or image files only first?
4. Should we show full request history on mobile, or only latest request state?
5. Should rejected requests expose admin review notes directly, or show a simpler rejection message first?
