-- Add latitude and longitude columns to reports table
-- This migration adds GPS coordinate support for location data

ALTER TABLE public.reports
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;