-- Add trust score and low priority fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 3 CHECK (trust_score >= 0 AND trust_score <= 3),
ADD COLUMN IF NOT EXISTS low_priority BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN profiles.trust_score IS 'User trust score (0-3). Decrements when report is marked as False Alarm. 0 = Low Priority';
COMMENT ON COLUMN profiles.low_priority IS 'Automatically flagged when trust_score reaches 0';

-- Create function to decrement trust score when report is marked as false alarm
CREATE OR REPLACE FUNCTION decrement_trust_score_on_false_alarm()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if status changed to 'false-alarm'
  IF NEW.status = 'false-alarm' AND (OLD.status IS NULL OR OLD.status != 'false-alarm') THEN
    -- Decrement trust score for the reporter
    UPDATE profiles
    SET trust_score = GREATEST(trust_score - 1, 0),
        low_priority = CASE 
          WHEN trust_score - 1 <= 0 THEN true 
          ELSE low_priority 
        END
    WHERE id = NEW.reporter_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically decrement trust score
DROP TRIGGER IF EXISTS on_report_false_alarm ON reports;
CREATE TRIGGER on_report_false_alarm
  AFTER UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION decrement_trust_score_on_false_alarm();

-- Add index for performance on trust_score queries
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score);
CREATE INDEX IF NOT EXISTS idx_profiles_low_priority ON profiles(low_priority);

-- Add index on reports status for false-alarm filtering
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- Update RLS policy to allow users to update their own trust_score and low_priority
-- This policy allows users to update their own profile including trust score fields
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
