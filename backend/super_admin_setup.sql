-- Create super_admins table
CREATE TABLE IF NOT EXISTS super_admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert super admin account
INSERT INTO super_admins (username, password_hash, full_name, email)
VALUES ('superadmin', '$2b$10$TZEv2HoBqljUsLX0QDG9HOSKIrVHlAtDuezDWxG1DMI0lofFLUQ3a', 'Super Administrator', 'admin@churches.com')
ON CONFLICT (username) DO NOTHING;

-- Display success message
SELECT 'Super admin table created successfully!' as message;
SELECT 'Login credentials:' as info, 'Username: superadmin' as username, 'Password: superadmin123' as password;
