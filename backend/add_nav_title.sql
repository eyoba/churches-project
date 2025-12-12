-- Add navigation title setting
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('nav_title', 'Churches Directory')
ON CONFLICT (setting_key) DO NOTHING;
