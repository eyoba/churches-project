-- Migration: Clean up members table
-- Remove unused columns that are not in the add member form
-- Run this against your Azure PostgreSQL database

-- Drop the family_id column (not used in the form)
ALTER TABLE members DROP COLUMN IF EXISTS family_id;

-- Verify the final schema
-- The members table should now have only these columns:
-- id, full_name, phone_number, email, personnummer, address, postal_code, city,
-- member_since, baptized, baptism_date, sms_consent, consent_date, is_active,
-- notes, created_at, created_by, updated_at, updated_by

-- Show the updated table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;
