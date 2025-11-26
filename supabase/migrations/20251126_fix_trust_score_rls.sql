-- Fix RLS policy to allow trust_score and low_priority updates
-- Drop and recreate the update policy with explicit column permissions

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure columns exist with defaults for existing users
DO $$ 
BEGIN
  -- Add trust_score column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'trust_score') THEN
    ALTER TABLE profiles ADD COLUMN trust_score INTEGER DEFAULT 3 CHECK (trust_score >= 0 AND trust_score <= 3);
  END IF;

  -- Add low_priority column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'low_priority') THEN
    ALTER TABLE profiles ADD COLUMN low_priority BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update existing rows to have default values if null
UPDATE profiles SET trust_score = 3 WHERE trust_score IS NULL;
UPDATE profiles SET low_priority = false WHERE low_priority IS NULL;
