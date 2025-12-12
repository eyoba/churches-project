-- Add background_color column to site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS background_color VARCHAR(7) DEFAULT '#3b82f6';

-- Set default background color for existing site settings
UPDATE site_settings SET background_color = '#3b82f6' WHERE background_color IS NULL;

-- Display confirmation
SELECT 'background_color column added to site_settings table' as status;
SELECT * FROM site_settings;
