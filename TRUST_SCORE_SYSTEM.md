# Trust Score System

## Overview

The Trust Score system is a 3-level reputation system designed to maintain the integrity of the Dispatch platform by tracking user reporting behavior. Users start with a Trust Score of 3 (100%) and the score decreases when reports are marked as false alarms by administrators.

## Features

### 1. Trust Score Levels

- **Level 3** (100%): Excellent Trust - New users start here
- **Level 2** (67%): Good Trust - One false alarm recorded
- **Level 1** (33%): Low Trust - Two false alarms recorded
- **Level 0** (0%): No Trust - Three or more false alarms recorded, automatically flagged as "Low Priority"

### 2. False Alarm Detection

When an administrator marks a report as "False Alarm" in the Admin Dashboard:

1. **Visual Update**: The report status is updated to "False Alarm" (pink badge)
2. **Trust Score Decrement**: The reporter's Trust Score is automatically decreased by 1 level
3. **Low Priority Flag**: If the Trust Score reaches 0, the user is automatically flagged as "Low Priority"
4. **User Notification**: The reporter receives a notification about the status change and Trust Score decrease

### 3. Database Schema

#### Profiles Table

```sql
-- Trust Score fields added to profiles table
trust_score INTEGER DEFAULT 3 CHECK (trust_score >= 0 AND trust_score <= 3)
low_priority BOOLEAN DEFAULT false
```

#### Reports Table

New status option:
- `false-alarm`: Indicates a report that was determined to be a false alarm

### 4. Automatic Trigger

A database trigger automatically handles Trust Score decrements:

```sql
CREATE TRIGGER on_report_false_alarm
  AFTER UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION decrement_trust_score_on_false_alarm();
```

The trigger:
- Detects when a report status changes to 'false-alarm'
- Decrements the reporter's trust_score by 1 (minimum 0)
- Automatically sets low_priority to true when trust_score reaches 0

## Implementation Files

### Database Migration
- `supabase/migrations/20251126_add_trust_score_system.sql`

### Frontend (Mobile App)
- `app/(protected)/trust-score/index.tsx` - Trust Score display page showing user's current score and explanations

### Admin Dashboard
- `app/dashboard/incidents/page.tsx` - Updated to include "False Alarm" status option with confirmation dialog
- `components/incidents/incident-detail-dialog.tsx` - Updated badge rendering for false-alarm status

### Type Definitions
- `lib/supabase/database.types.ts` - Updated profiles table types to include trust_score and low_priority fields

## Usage

### For Administrators

1. Open the Admin Dashboard → Incidents page
2. Select a report and click the Edit button
3. Change the status to "False Alarm"
4. Review the confirmation dialog which explains:
   - The report will be marked as a False Alarm
   - The reporter's Trust Score will decrease by 1 level
   - The user will be flagged as "Low Priority" if Trust Score reaches 0
5. Confirm the action

### For Users (Mobile App)

1. Navigate to the Trust Score page from the sidebar
2. View current Trust Score level (0-3)
3. See percentage representation (0%, 33%, 67%, 100%)
4. Check if flagged as "Low Priority"
5. Review information about how trust works and how to maintain/restore trust

## Security & Privacy

- Trust Scores are stored securely in the database
- Only administrators can mark reports as false alarms
- Users can view their own Trust Score but cannot modify it
- The system uses Row Level Security (RLS) policies to protect data

## Future Enhancements

Potential improvements for the Trust Score system:

1. **Trust Score Recovery**: Allow users to restore trust over time with verified reports
2. **Appeal System**: Let users contest false alarm determinations
3. **Admin Dashboard**: Add a view to filter/sort users by trust score
4. **Analytics**: Track false alarm trends and patterns
5. **Threshold Customization**: Make trust levels configurable by administrators
6. **Report Prioritization**: Use trust scores in incident routing and priority

## Testing

To test the Trust Score system:

1. Apply the database migration: Run `20251126_add_trust_score_system.sql`
2. Create a test report via the mobile app
3. Log in to the Admin Dashboard
4. Mark the test report as "False Alarm"
5. Verify the trust score decreases in the database
6. Check the mobile app Trust Score page to see the updated score
7. Repeat 2-3 more times to test the "Low Priority" flag at trust score 0

## Database Migration

To apply the Trust Score system to your database:

```bash
# Navigate to your Supabase project
cd dispatch

# Apply the migration
supabase db push
```

Or manually run the SQL migration file in your Supabase SQL Editor.

## Notes

- The Trust Score system is designed as an "honor system" but with accountability
- False alarms are serious as they waste emergency response resources
- The system helps prioritize genuine emergencies
- Users can see their score transparently to encourage responsible reporting
