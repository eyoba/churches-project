-- Create site_settings table for global settings like logo
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default logo setting
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('site_logo_url', '')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert site name setting
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('site_name', 'Ethiopian Orthodox Tewahedo Church')
ON CONFLICT (setting_key) DO NOTHING;

SELECT 'Site settings table created successfully!' as message;
