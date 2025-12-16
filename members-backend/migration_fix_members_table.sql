-- Migration: Fix members table structure
-- Remove duplicate and unused columns
-- This will align the database with the Add Member form

-- IMPORTANT: Run this on your Azure PostgreSQL database
-- Database: church_pgdatabase
-- Connection: churchserverdevelopment.postgres.database.azure.com

-- Step 1: Drop unused and duplicate columns
-- These columns are NOT in the Add Member form:
ALTER TABLE members DROP COLUMN IF EXISTS church_id;
ALTER TABLE members DROP COLUMN IF EXISTS phone;  -- duplicate of phone_number
ALTER TABLE members DROP COLUMN IF EXISTS date_of_birth;  -- not in form
ALTER TABLE members DROP COLUMN IF EXISTS name;  -- duplicate of full_name
ALTER TABLE members DROP COLUMN IF EXISTS family_id;  -- not in form

-- Step 2: Verify the final structure
-- The table should now have only these columns:
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'members'
ORDER BY ordinal_position;

-- Expected columns after migration:
-- id, full_name, phone_number, email, personnummer, address, postal_code,
-- city, member_since, baptized, baptism_date, sms_consent, consent_date,
-- is_active, notes, created_at, created_by, updated_at, updated_by

-- Step 3: Test the migration by counting records
SELECT COUNT(*) as total_members FROM members;
SELECT COUNT(*) as active_members FROM members WHERE is_active = true;
