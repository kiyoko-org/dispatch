# Trust Score System Implementation Summary

## Changes Made

### 1. Database Migration
**File**: `supabase/migrations/20251126_add_trust_score_system.sql`

- Added `trust_score` column to profiles table (INTEGER, default 3, range 0-3)
- Added `low_priority` column to profiles table (BOOLEAN, default false)
- Created `decrement_trust_score_on_false_alarm()` trigger function
- Created `on_report_false_alarm` trigger to automatically decrement trust score
- Added database indexes for performance optimization

### 2. TypeScript Type Updates
**File**: `dispatch-monorepo/packages/dashboard-frontend/lib/supabase/database.types.ts`

- Added `trust_score: number | null` to profiles Row/Insert/Update types
- Added `low_priority: boolean | null` to profiles Row/Insert/Update types

### 3. Admin Dashboard Updates
**File**: `dispatch-monorepo/packages/dashboard-frontend/app/dashboard/incidents/page.tsx`

- Added "false-alarm" to ReportStatus type union
- Added "False Alarm" option to status dropdown
- Added pink badge styling for false-alarm status (`bg-pink-500 text-white`)
- Implemented confirmation dialog when marking as False Alarm with details:
  - Explains Trust Score will be decreased
  - Shows automatic Low Priority flag if score reaches 0
  - Displays warning that action cannot be undone
- Enhanced notification message to inform users about Trust Score decrease
- Added confirmation requirement (showCancelConfirm) for false-alarm status

### 4. Incident Detail Dialog Updates
**File**: `dispatch-monorepo/packages/dashboard-frontend/components/incidents/incident-detail-dialog.tsx`

- Added "false-alarm" case to status badge rendering
- Applied pink styling for false-alarm badges

### 5. Trust Score Mobile UI
**File**: `app/(protected)/trust-score/index.tsx`

- Imported necessary React hooks (useState, useEffect) and components (ActivityIndicator)
- Added supabase import and useAuth hook
- Implemented state management for trustScore, lowPriority, and loading
- Created fetchTrustScore() function to retrieve user's trust score from database
- Added getTrustLevel() helper function to determine trust level label and color
- Added getTrustPercentage() helper to calculate percentage (0%, 33%, 67%, 100%)
- Updated UI to display:
  - Live trust score with loading state
  - Level indicator (Level X of 3)
  - Dynamic trust level badge (Excellent/Good/Low/No Trust)
  - Low Priority warning badge when flagged
  - Color-coded shield icon (error color when trust score is 0)
- Enhanced "How Trust Works" explanation to mention the 3-level system

### 6. Documentation
**File**: `TRUST_SCORE_SYSTEM.md`

Created comprehensive documentation including:
- System overview and features
- Trust Score levels explained
- False alarm detection workflow
- Database schema details
- Implementation file references
- Usage instructions for admins and users
- Security and privacy notes
- Future enhancement suggestions
- Testing instructions

## Key Features Implemented

✅ **3-Level Trust Score System** (0-3)
✅ **False Alarm Status** in Admin Dashboard
✅ **Automatic Trust Score Decrement** via database trigger
✅ **Low Priority Auto-Flag** when trust score reaches 0
✅ **Visual Feedback** with pink badges for false alarms
✅ **Confirmation Dialog** with clear consequences
✅ **User Notifications** about trust score changes
✅ **Mobile UI** to display current trust score
✅ **Real-time Updates** fetched from database

## Testing Checklist

- [ ] Apply database migration to Supabase
- [ ] Create test user and submit a report
- [ ] Mark report as "False Alarm" in Admin Dashboard
- [ ] Verify confirmation dialog appears with correct information
- [ ] Confirm trust score decreases in database (3 → 2)
- [ ] Check mobile app Trust Score page shows updated score
- [ ] Verify user receives notification about trust score decrease
- [ ] Repeat process until trust score reaches 0
- [ ] Confirm "Low Priority" flag is set automatically
- [ ] Verify "Low Priority" badge appears in mobile app
- [ ] Test badge colors display correctly (pink for false-alarm)

## Database Query Examples

```sql
-- Check a user's trust score
SELECT id, first_name, last_name, trust_score, low_priority 
FROM profiles 
WHERE id = 'user-uuid-here';

-- Find all low priority users
SELECT id, first_name, last_name, trust_score 
FROM profiles 
WHERE low_priority = true;

-- Count false alarm reports
SELECT COUNT(*) 
FROM reports 
WHERE status = 'false-alarm';

-- Find users with specific trust scores
SELECT id, first_name, last_name, trust_score 
FROM profiles 
WHERE trust_score <= 1
ORDER BY trust_score ASC;
```

## Rollback Instructions

If needed, to rollback the Trust Score system:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS on_report_false_alarm ON reports;

-- Remove function
DROP FUNCTION IF EXISTS decrement_trust_score_on_false_alarm();

-- Remove indexes
DROP INDEX IF EXISTS idx_profiles_trust_score;
DROP INDEX IF EXISTS idx_profiles_low_priority;
DROP INDEX IF EXISTS idx_reports_status;

-- Remove columns
ALTER TABLE profiles 
DROP COLUMN IF EXISTS trust_score,
DROP COLUMN IF EXISTS low_priority;
```

## Notes

- All changes are backward compatible
- Existing users will automatically have trust_score = 3
- The system works entirely through database triggers, ensuring data consistency
- Admin dashboard provides clear warnings before marking reports as false alarms
- Mobile app provides transparency so users understand their trust status
