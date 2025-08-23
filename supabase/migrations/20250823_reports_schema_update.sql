-- Update reports table schema to support ReportData fields
-- This migration adds columns for the full incident report structure

ALTER TABLE public.reports
ADD COLUMN incident_category TEXT,
ADD COLUMN incident_subcategory TEXT,
ADD COLUMN incident_title TEXT,
ADD COLUMN incident_date TEXT,
ADD COLUMN incident_time TEXT,
ADD COLUMN street_address TEXT,
ADD COLUMN nearby_landmark TEXT,
ADD COLUMN city TEXT DEFAULT 'Tuguegarao City',
ADD COLUMN province TEXT DEFAULT 'Cagayan',
ADD COLUMN brief_description TEXT,
ADD COLUMN what_happened TEXT,
ADD COLUMN who_was_involved TEXT,
ADD COLUMN number_of_witnesses TEXT,
ADD COLUMN injuries_reported TEXT,
ADD COLUMN property_damage TEXT,
ADD COLUMN suspect_description TEXT,
ADD COLUMN witness_contact_info TEXT,
ADD COLUMN request_follow_up BOOLEAN DEFAULT TRUE,
ADD COLUMN share_with_community BOOLEAN DEFAULT FALSE,
ADD COLUMN is_anonymous BOOLEAN DEFAULT FALSE;