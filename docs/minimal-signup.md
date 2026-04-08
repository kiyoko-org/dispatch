# Signup System Overhaul Plan

## 📄 Documentation Files
- **Current Signup Flow**: See [CURRENT_SIGNUP_FLOW.md](./CURRENT_SIGNUP_FLOW.md) for detailed code analysis
- **Audit Findings**: See "Audit Findings" section below for dispatch-lib and dashboard-frontend analysis

## Problem Statement
The current signup system requires users to fill in extensive personal information during registration:
- Name fields (first, middle, last, suffix)
- Sex
- Birth date (year, month, day)
- Permanent address (street, barangay, city, province)
- Birth location (city, province)
- National ID verification (optional but encouraged)
- Email
- Password

This creates friction and reduces conversion rates. We want to streamline this to collect only essential information upfront (email and password + confirm password), then defer other data collection to a later profile completion step.

## Proposed Approach

### Phase 1: Database Schema Changes
Add an `is_verified` column to the profiles table to track verification status.
- Set `is_verified` to `false` by default on signup
- Can be set to `true` after email verification or profile completion

### Phase 2: Modify Signup Flow
1. **Simplify signup form** - reduce to minimal fields:
   - Email
   - Password
   - Confirm Password (client-side validation only)

2. **Update validation schema** - make most fields optional during signup

3. **Modify database trigger** - update `handle_new_user()` function to handle minimal profile creation

4. **Update user metadata** - only pass essential data during signup

### Phase 3: Profile Completion Flow
1. Create a post-signup profile completion screen
2. Users can complete profile at their convenience
3. Gate certain features behind profile completion (e.g., emergency calls, reporting)

### Phase 4: Update Dependent Features
- Update any features that depend on profile data to handle incomplete profiles gracefully
- Add UI indicators for incomplete profiles
- Prompt users to complete profile when accessing restricted features

## Progress Checklist

### Done
- [x] Simplified `app/auth/sign-up.tsx` to email/password/confirm password only
- [x] Kept email verification flow
- [x] Kept FCM token capture during signup
- [x] Derived input `maxLength` from the Zod schema
- [x] Removed `app/auth/sign-up-new.tsx`
- [x] Merged the new signup page into the existing signup route

### Still blocked
- [ ] Sync the live `profiles` schema with the new trigger
- [ ] Add `role` + `is_verified` to the live database if they are missing
- [ ] Regenerate `dispatch-lib` types after the schema update
- [ ] Build profile completion + verification flow
- [ ] Add feature gates for unverified users

## Current State Analysis

### Database Schema
**profiles table** (from `20250818_profiles_schema.sql` + subsequent migrations):
- `id` (uuid, PK, references auth.users)
- `updated_at` (timestamp)
- `first_name` (text)
- `middle_name` (text)
- `last_name` (text)
- `avatar_url` (text)
- `suffix` (text)
- `sex` (text)
- `birth_date` (date)
- `permanent_address_1` (text)
- `permanent_address_2` (text)
- `birth_city` (text)
- `birth_province` (text)
- `id_card_number` (text)
- `fcm_token` (text)
- ❌ **NO `role` field currently exists**
- ❌ **NO `is_verified` field currently exists**

### Current Signup Flow
File: `app/auth/sign-up.tsx`
- [x] Minimal signup form is in place
- [x] Email, password, and confirm password only
- [x] National ID QR verification removed from signup
- [x] Client-side password confirmation validation
- [x] Signup uses `role` + `fcm_token` metadata only
- [x] Email verification still redirects users to login
- [x] Input `maxLength` comes from the Zod schema
- [x] `app/auth/sign-up-new.tsx` removed from the working tree
- [ ] Live DB trigger/schema sync still needed

### Database Trigger
File: `supabase/migrations/20250818_profiles_schema.sql`
The original `handle_new_user()` trigger extracted the following from `raw_user_meta_data`:
- `first_name`
- `middle_name`
- `last_name`
- `avatar_url`
- `id_card_number`

The working-tree trigger in `supabase/functions/new_user.sql` now inserts:
- `id`
- `fcm_token`
- `role`
- `is_verified`

That means the live `profiles` schema must include `role` and `is_verified`, or signup will fail with a 500.

## Implementation Todos

### Phase 0: dispatch-lib Updates (MUST DO FIRST)
**Location**: `/Volumes/realme/Dev/kiyoko-org/dispatch-monorepo/packages/dispatch-lib`

- **add-is-verified-to-dispatch-lib-migration**: Create migration in dispatch-lib repo
  - Add `is_verified BOOLEAN` to profiles table (nullable)
  - Apply migration to shared Supabase instance
- **regenerate-types**: Run Supabase type generation
  - `bunx supabase gen types typescript` (or similar)
  - Updates `database.types.ts` with new `is_verified` field
- **update-profile-schema**: Add `is_verified` to profileSchema in `types.ts`
  ```typescript
  is_verified: z.boolean().nullable().optional()
  ```
- **publish-dispatch-lib**: Publish new version to npm
  - Version bump (minor version)
  - Publish package
  - Note version number for app updates

### Phase 1: Database Schema Changes (dispatch app repo)
**Location**: `/Volumes/realme/Dev/kiyoko-org/dispatch`

- **update-dispatch-lib-dependency**: Update package.json to use new dispatch-lib version
- **verify-migration-synced**: Ensure dispatch app's Supabase is in sync with dispatch-lib migration
  - May need to apply same migration here if using separate Supabase instances
- **update-trigger-function**: Update `handle_new_user()` trigger in `20250818_profiles_schema.sql`
  - Set `is_verified = false` for new users with role='user'
  - Set `is_verified = null` for admins (role='admin')
  - Extract only email and FCM token from metadata
  - Remove extraction of personal info fields
- **create-verification-docs-bucket**: Create new storage bucket migration
  - Bucket name: `verification-docs`
  - RLS policy: Users can INSERT their own docs
  - RLS policy: Users can SELECT their own docs
  - RLS policy: Admins can SELECT all docs
- **create-verification-requests-table**: New table to track manual verification requests
  ```sql
  CREATE TABLE verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    document_url TEXT NOT NULL,
    document_type TEXT, -- 'drivers_license', 'passport', etc.
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES auth.users(id)
  );
  ```

### Phase 2: Signup Form Changes (dispatch app repo)
- **update-signup-schema**: Modify Zod schema in `app/auth/sign-up.tsx`
  - Keep email (required) and password (required)
  - Add confirmPassword (required, must match password, client-side only)
  - Make ALL personal info fields optional
- **simplify-signup-ui**: Reduce signup form to minimal fields:
  - Email input
  - Password input  
  - Confirm Password input (validate matches password on change/blur)
  - Remove all other fields (name, address, birth date, etc.)
- **update-signup-api-call**: Modify `signUpWithEmail()` function
  - Only pass email and password to `supabase.auth.signUp()`
  - Only include FCM token in `options.data` metadata
  - Remove all personal info from metadata
  - Remove QR validation logic
- **remove-qr-from-signup**: Remove National ID QR scanning UI
  - Remove camera modal
  - Remove QR verification state
  - Remove ID data validation
  - Keep QR scanning code for reuse in profile screen

### Phase 3: Profile Completion Screen (dispatch app repo)
- **create-profile-completion-screen**: New file `app/(protected)/profile/complete.tsx`
  - Form with all personal information fields (from old signup form)
  - Same validation as current signup (Zod schema)
  - Save directly to `profiles` table via Supabase update
  - Show completion progress indicator
- **add-national-id-verification**: Add National ID QR scanning to profile screen
  - Reuse QR scanning component from old signup
  - Auto-fill profile fields from QR data
  - Validate against entered data
  - On successful scan + validation: set `is_verified = true` in database
- **add-manual-verification-upload**: Add document upload UI
  - File picker for images (jpg, png) and PDFs
  - Upload to `verification-docs` storage bucket
  - Create record in `verification_requests` table with status='pending'
  - Show upload success message and "pending review" status
  - (Admin approval handled in separate admin dashboard project)
- **add-verification-status-display**: Show current verification status
  - Unverified: "Your account is not verified"
  - Pending: "Your verification is under review"
  - Verified: "Your account is verified ✓"

### Phase 4: Feature Gating (dispatch app repo)
- **add-verification-checks**: Add `is_verified` checks to gated features
  - Find emergency calls screen/component
  - Find incident reporting screen/component
  - Before allowing access, check:
    ```typescript
    if (profile.role === 'admin') {
      // Allow admins to bypass
      return true;
    }
    if (profile.is_verified !== true) {
      // Show verification required modal
      return false;
    }
    ```
- **create-verification-required-modal**: New modal component
  - Title: "Identity Verification Required"
  - Message: Explain why verification is needed for emergency/reporting
  - Two options:
    1. "Verify with National ID" → Navigate to profile/complete with QR scanner open
    2. "Upload Document" → Navigate to profile/complete with upload form open
  - Cancel button to go back
- **add-profile-completion-prompts**: Add UI indicators
  - Profile screen: Show completion % or status badges
  - Optional: Banner in app suggesting profile completion (can be dismissed)
  - Home screen: Gentle reminder if profile incomplete (optional)

### Phase 5: Migration & Testing
- **create-migration-for-existing-users**: SQL migration
  ```sql
  -- Set all existing users to null (will need to verify)
  UPDATE profiles SET is_verified = null WHERE is_verified IS NULL;
  
  -- Note: Admins will bypass check via role='admin' in code
  ```
- **test-new-signup-flow**: Manual testing checklist
  - [ ] Can sign up with just email/password
  - [ ] Email verification email still sent
  - [ ] Profile created with minimal data
  - [ ] `is_verified` defaults to `false`
  - [ ] FCM token captured
- **test-verification-flows**: Testing checklist
  - [ ] National ID QR scan works
  - [ ] Auto-fills profile data
  - [ ] Sets `is_verified = true` on success
  - [ ] Manual document upload works
  - [ ] Creates verification request record
- **test-feature-gates**: Testing checklist
  - [ ] Unverified users blocked from emergency calls
  - [ ] Unverified users blocked from reporting
  - [ ] Admins can access without verification
  - [ ] Verified users can access features
  - [ ] Existing users (null) blocked until they verify

## Potential Breakage & Risks

### HIGH RISK - Database Trigger Changes
**Issue**: The `handle_new_user()` trigger currently expects specific fields in `raw_user_meta_data`. If we don't pass these fields during signup, the trigger might fail or create incomplete profile records.

**Impact**: 
- New signups with minimal data should work (we're making fields nullable)
- Existing users with complete profiles are unaffected
- Need to ensure trigger handles missing metadata gracefully

**Mitigation**:
- ✅ All profile columns are already nullable (verified in schema)
- Update trigger to only extract fields that exist in metadata
- Add default values where appropriate
- Test thoroughly in development environment

### HIGH RISK - dispatch-lib Type Definitions
**Issue**: The `database.types.ts` file in dispatch-lib doesn't have `is_verified` field. Both dispatch app and dashboard-frontend depend on dispatch-lib for types.

**Impact**:
- TypeScript errors when trying to access `profile.is_verified`
- Both dispatch app and dashboard-frontend will break until types are updated
- Need to regenerate types from database schema

**Mitigation**:
- ✅ **MUST update dispatch-lib first** before making app changes
- Run Supabase type generation after adding is_verified column
- Publish new version of dispatch-lib
- Update dispatch app and dashboard-frontend to use new version
- This is a critical dependency chain

### MEDIUM RISK - Verification Required for Features
**Issue**: Adding verification gates will block existing users from accessing emergency calls and reporting until they verify.

**Impact**:
- Existing users (is_verified = null) cannot access gated features
- Need to communicate this change to users
- Could cause user frustration or churn

**Mitigation**:
- Migration sets existing users to `is_verified = null`
- Feature gates should handle `null` as "grandfathered" users (allow access)
- Only new users with `is_verified = false` are blocked
- OR: Prompt existing users to verify but don't block them initially
- **DECISION NEEDED**: Should existing users be grandfathered or required to verify?

### MEDIUM RISK - Profile Completion Not Required
**Issue**: Users can now sign up with just email/password and access features WITHOUT completing profile (as long as verified).

**Impact**:
- Reports/emergency calls might have incomplete user information
- Hard to identify users without name/address data
- Privacy concern: less data collected upfront
- But also: better privacy, less friction

**Mitigation**:
- Emergency responders may need user info for emergency calls
- Consider making SOME profile fields required for emergency calls (name, phone?)
- Or require profile completion for emergency calls but not reporting?
- **DECISION NEEDED**: What minimum profile data is needed for emergency calls?

### MEDIUM RISK - National ID Verification Flow
**Issue**: Moving National ID verification from signup to profile completion changes user flow.

**Impact**:
- Users who want to verify via ID upfront lose that option
- QR scanning code needs to be moved and refactored
- Two entry points to verification (profile screen + gated feature prompts)

**Mitigation**:
- Move all QR verification logic to reusable component
- Keep same validation logic
- Ensure verification status updates everywhere it's displayed

### LOW RISK - FCM Token Registration
**Issue**: Currently FCM token is registered during signup and stored in user metadata.

**Impact**:
- FCM tokens are critical for push notifications
- Need to ensure this still works with minimal signup

**Mitigation**:
- ✅ Keep FCM token registration at signup (already in plan)
- Store in user metadata (not part of profile form)
- Not user-facing, happens in background

### LOW RISK - Confirm Password Field
**Issue**: Adding confirm password is cosmetic but changes UX.

**Impact**:
- Minimal - just adds one field
- Client-side validation only
- Common UX pattern

**Mitigation**:
- Standard implementation
- No backend changes needed

## Decisions Made (User Feedback)

1. **`is_verified` represents IDENTITY verification status**
   - NOT email verification (handled by Supabase Auth)
   - NOT profile completion
   - Tracks whether user has verified their identity through:
     - National ID (automated QR verification)
     - Other proof of identity documents (manual admin verification)
     - Licenses or alternative IDs (manual admin verification)
   - Values: `true` (verified), `false` (not verified), `null` (admins/system accounts don't need verification)

2. **Feature gating: REQUIRE complete profile for critical features**
   - Emergency calls require complete profile
   - Incident reporting requires complete profile
   - Users can signup with minimal info but must complete profile to use key features

3. **National ID verification: DEFER to profile completion (optional)**
   - Remove from initial signup flow
   - Move to profile completion step
   - Remain optional but available for automated verification
   - Alternative verification methods must go through admin approval

4. **Profile completion timing: ON-DEMAND**
   - Not required immediately after signup
   - Prompted when user tries to access gated features
   - Show completion status/prompts in profile section

5. **Existing users migration strategy:**
   - Set `is_verified = NULL` for existing users
   - Set `is_verified = NULL` for admin accounts (they don't need verification)
   - Distinguish between old (null) and new users (false until verified)

## Additional Requirements

### Verification System Architecture
The verification system needs to support multiple workflows:

1. **Automated National ID verification** (no admin needed)
   - User scans Philippine National ID QR code
   - System validates and sets `is_verified = true` automatically

2. **Manual verification workflow** (requires admin approval)
   - User uploads alternative proof of identity (driver's license, passport, etc.)
   - Admin reviews and approves/rejects via admin dashboard
   - System sets `is_verified = true` upon admin approval

### External Systems Integration
- **Admin Dashboard**: Located at `/Volumes/realme/Dev/kiyoko-org/dispatch-monorepo/packages/dashboard-frontend`
- **dispatch-lib**: API library for Supabase interactions at `/Volumes/realme/Dev/kiyoko-org/dispatch-monorepo/packages/dispatch-lib`
- **Current dispatch-lib database types**: ❌ NO `is_verified` field in profiles table type definition
- Need to coordinate changes across these systems

### Final Decisions

1. **Verification document storage**: Create new `verification-docs` storage bucket
2. **Profile vs Verification gate**: ONLY identity verification required (`is_verified = true`) to access gated features
   - Profile completion is NOT required
   - Users can access features with minimal profile as long as they're verified
3. **Admin dashboard scope**: Separate project - not part of this plan
   - This plan will create database structure only
   - Admin verification UI is deferred
4. **Confirm password**: Client-side validation only
   - Compare passwords on client
   - Only send final password to server
   - No need to send confirm_password to backend

## Database Architecture Clarification

### User Types and Tables
The system has TWO separate user types with separate tables:

1. **Regular Users** → `profiles` table
   - Role: `user` or `admin`
   - Created via signup flow
   - ✅ **Gets `is_verified` column**
   - Must verify identity to access gated features (except admins)

2. **Officers** → `officers` table  
   - Role: `officer`
   - Created via admin frontend only
   - ❌ **NO `is_verified` column**
   - Don't need verification
   - Have badge numbers, ranks, etc.

### Verification Rules
- `profiles.is_verified = true` → Verified users (can access gated features)
- `profiles.is_verified = false` → Unverified users (blocked from gated features)
- `profiles.is_verified = null` → Existing users before migration (ALSO blocked, must verify)
- `profiles.role = 'admin'` → Admins bypass verification check (special case)
- `officers` table → No verification needed, officers are pre-approved by admins

### Final Decisions (Round 2)

6. **dispatch-lib workflow**: UPDATE FIRST (critical dependency)
   - Add `is_verified` column to profiles table
   - Regenerate database types in dispatch-lib
   - Publish new dispatch-lib version
   - Then update dispatch app to use new version

7. **Emergency call requirements**: NO REQUIREMENTS
   - Users can make emergency calls with minimal profile (just email)
   - Identity verification (`is_verified = true`) is still required to access feature
   - Emergency responders will work with limited user info

8. **Existing users handling**: REQUIRE VERIFICATION
   - Existing users with `is_verified = null` MUST verify before accessing gated features
   - No grandfathering - all users must verify identity
   - This applies to all users, not just new signups
   - Will need to communicate this to existing user base

9. **Officer verification**: NOT APPLICABLE
   - Officers use a separate `officers` table (not `profiles` table)
   - `is_verified` column is ONLY for the `profiles` table (regular users)
   - Officers don't need identity verification
   - Officer accounts are created via admin frontend only

### Final Decisions (Round 3)

10. **New signup flow**: MINIMAL EMAIL/PASSWORD ONLY
    - Email input
    - Password input
    - Confirm password input (client-side validation only)
    - Remove ALL profile fields from signup
    - Redirect to login after email verification
    - No profile collection during signup

11. **Profile completion timing**: AFTER FIRST LOGIN
    - User signs up with email/password
    - User verifies email
    - User logs in for first time
    - **THEN** prompt for profile completion + verification
    - Profile completion is gated (need it to access features)

12. **National ID verification in new flow**: AUTO-APPROVE ON SUCCESS
    - User can scan National ID during profile completion
    - System auto-fills all profile fields from scanned data
    - On successful scan + validation: immediately set `is_verified = true`
    - No admin approval needed for National ID verification
    - Admin approval only for manual document uploads (driver's license, passport, etc.)

## Audit Findings - dispatch-lib and dashboard-frontend

### ✅ Verified Information
1. **dispatch-lib structure** - CONFIRMED
   - Version: 0.0.2
   - Published to GitHub Packages registry (@kiyoko-org/dispatch-lib)
   - Type generation script exists: `bun sync-types`
   - Profiles table types in `database.types.ts` - NO `is_verified` field currently
   - Profile schema in `types.ts` - NO `is_verified` field currently

2. **dashboard-frontend dependency** - CONFIRMED
   - Uses `dispatch-lib: workspace:*` (workspace dependency in monorepo)
   - Uses `useTrustScores()` hook from dispatch-lib to fetch profiles
   - Displays user list with trust scores, email, reports count

3. **dispatch app dependency** - CONFIRMED
   - Uses `@kiyoko-org/dispatch-lib` from GitHub (commit hash: a4a4414225ad1a7835c30594502c4d2826bd27a1)
   - NOT using workspace dependency - uses published package from GitHub

### ⚠️ CRITICAL FINDINGS - Potential Breakage

#### 1. **dashboard-frontend ALREADY has "verified" concept** (HIGH PRIORITY)
**Location**: `dashboard-frontend/app/dashboard/users/page.tsx`

```typescript
interface UserData {
  verified: boolean  // Line 53
}

// Currently hardcoded to false (Line 146)
verified: false,

// Used in stats display (Line 196)
verified: users.filter((u) => u.verified).length,

// Used in UI with badge (Line 268)
{user.verified && (
  <CheckCircle className="h-4 w-4 text-green-500" />
)}
```

**Impact**: 
- Dashboard ALREADY displays "Verified Users" count in stats cards
- Currently shows 0 because it's hardcoded to `false`
- This `verified` field is NOT from the database - it's just UI placeholder
- When we add `is_verified` to database, dashboard needs updating to map it

**Action Required**:
- Update dashboard to read `is_verified` from profile data
- Map `p.is_verified` to `verified` in UserData interface
- This should work automatically once dispatch-lib types are updated

#### 2. **Emergency and Report screens DON'T check profile completeness** (GOOD NEWS)
**Locations**: 
- `dispatch/app/(protected)/emergency/index.tsx`
- `dispatch/app/(protected)/report-incident/index.tsx`

**Finding**:
- Neither screen checks user profile fields
- They only use `session.user.id` to create records
- Emergency calls use contacts service (separate from profile)
- Reports just need user_id as reporter

**Impact**: ✅ NO BREAKAGE
- Can safely make profile fields optional
- Features will work with minimal profiles
- Just need to add `is_verified` check at entry point

#### 3. **dispatch-lib publishing workflow** (IMPORTANT)
**Location**: `dispatch-lib/.github/workflows/publish_package.yml`

**Finding**:
- Has automated publishing workflow
- Publishes to GitHub Packages
- dispatch app references specific commit hash (not latest)

**Impact**:
- After updating dispatch-lib, need to:
  1. Commit and push changes
  2. Trigger publish workflow OR manually publish
  3. Update dispatch app's package.json to new commit hash
  4. Dashboard-frontend will auto-update (workspace dependency)

#### 4. **Trust scores use extended Profile type** (SAFE)
**Location**: `dispatch-lib/react/hooks/useTrustScores.ts`

```typescript
type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  email?: string;
  reports_count?: number;
  joined_date?: string;
  last_sign_in_at?: string;
};
```

**Impact**: ✅ NO BREAKAGE
- Uses intersection type with optional fields
- Adding `is_verified` to database types will automatically flow through
- No code changes needed in hooks

### 📋 Updated Implementation Checklist

**Phase 0 - Additional Steps:**
- [ ] After migration, trigger dispatch-lib publish workflow
- [ ] Get new commit hash from dispatch-lib repo
- [ ] Update dispatch app package.json with new commit hash
- [ ] Run `bun install` in dispatch app

**Dashboard Updates Needed:**
- [ ] Update `dashboard-frontend/app/dashboard/users/page.tsx` line 146:
  ```typescript
  verified: p.is_verified ?? false,  // Map from profile data
  ```
- [ ] Consider adding verification status column to user table
- [ ] Update filters to allow filtering by verification status

## Notes
- Current signup already has email verification via Supabase Auth
- The form uses extensive validation with security checks (dangerous character detection)
- Location data uses Philippine-specific provinces/municipalities/barangays
- Consider UX: too minimal might seem suspicious, balance security with simplicity
- **Dashboard already expects verified status** - good alignment with plan!

