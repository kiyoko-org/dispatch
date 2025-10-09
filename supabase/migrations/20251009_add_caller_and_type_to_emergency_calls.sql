-- Add caller_number and call_type columns to emergency_calls table
-- This migration adds two new fields for better emergency call tracking

-- Add caller_number column (nullable - in case caller's number isn't available)
ALTER TABLE public.emergency_calls 
ADD COLUMN IF NOT EXISTS caller_number TEXT;

-- Add call_type column with constraint for allowed values
ALTER TABLE public.emergency_calls 
ADD COLUMN IF NOT EXISTS call_type TEXT CHECK (call_type IN ('police', 'fire', 'medical', 'general')) DEFAULT 'general';

-- Add comment to document the new columns
COMMENT ON COLUMN public.emergency_calls.caller_number IS 'Phone number of the person making the emergency call';
COMMENT ON COLUMN public.emergency_calls.call_type IS 'Type of emergency: police, fire, medical, or general';
