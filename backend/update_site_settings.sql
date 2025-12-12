-- Add more site settings for home page customization
INSERT INTO site_settings (setting_key, setting_value)
VALUES 
  ('site_title', 'Ethiopian Orthodox Tewahedo Church'),
  ('site_subtitle', 'Find and connect with churches in your community'),
  ('home_section_title', 'Our Churches')
ON CONFLICT (setting_key) DO NOTHING;

SELECT 'Site settings updated successfully!' as message;
