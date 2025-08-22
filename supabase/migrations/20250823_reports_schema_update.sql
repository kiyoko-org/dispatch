-- Update reports table schema to support ReportData fields
-- This migration adds columns for the full incident report structure

ALTER TABLE public.reports
ADD COLUMN incidentCategory TEXT,
ADD COLUMN incidentSubcategory TEXT,
ADD COLUMN incidentTitle TEXT,
ADD COLUMN incidentDate TEXT,
ADD COLUMN incidentTime TEXT,
ADD COLUMN streetAddress TEXT,
ADD COLUMN nearbyLandmark TEXT,
ADD COLUMN city TEXT DEFAULT 'Tuguegarao City',
ADD COLUMN province TEXT DEFAULT 'Cagayan',
ADD COLUMN briefDescription TEXT,
ADD COLUMN whatHappened TEXT,
ADD COLUMN whoWasInvolved TEXT,
ADD COLUMN numberOfWitnesses TEXT,
ADD COLUMN injuriesReported TEXT,
ADD COLUMN propertyDamage TEXT,
ADD COLUMN suspectDescription TEXT,
ADD COLUMN witnessContactInfo TEXT,
ADD COLUMN requestFollowUp BOOLEAN DEFAULT TRUE,
ADD COLUMN shareWithCommunity BOOLEAN DEFAULT FALSE,
ADD COLUMN isAnonymous BOOLEAN DEFAULT FALSE;