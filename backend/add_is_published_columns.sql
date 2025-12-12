-- Add is_published column to church_events table
ALTER TABLE church_events ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Add is_published column to church_photos table
ALTER TABLE church_photos ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Set existing events to published
UPDATE church_events SET is_published = true WHERE is_published IS NULL;

-- Set existing photos to published
UPDATE church_photos SET is_published = true WHERE is_published IS NULL;

-- Display confirmation
SELECT 'is_published column added to church_events and church_photos tables' as status;
SELECT COUNT(*) as total_events FROM church_events;
SELECT COUNT(*) as total_photos FROM church_photos;
