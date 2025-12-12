-- Add background_color column to churches table
ALTER TABLE churches ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#3b82f6';

-- Set default background color for existing churches (blue)
UPDATE churches SET background_color = '#3b82f6' WHERE background_color IS NULL;

-- Display confirmation
SELECT 'background_color column added to churches table' as status;
SELECT id, name, background_color FROM churches;
