-- Members Backend Database Schema
-- Run this in your PostgreSQL database

-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    personnummer VARCHAR(11) NOT NULL, -- Norwegian SSN (stored encrypted in production)
    address VARCHAR(500),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    member_since DATE,
    baptized BOOLEAN DEFAULT false,
    baptism_date DATE,
    family_id INTEGER,
    sms_consent BOOLEAN DEFAULT true, -- GDPR consent
    consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true, -- Soft delete
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);

-- Create SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    recipient_count INTEGER NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_by VARCHAR(100),
    cost_estimate DECIMAL(10,2)
);

-- Create SMS recipients table (many-to-many)
CREATE TABLE IF NOT EXISTS sms_recipients (
    id SERIAL PRIMARY KEY,
    sms_log_id INTEGER NOT NULL REFERENCES sms_logs(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    twilio_sid VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit log table for GDPR compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    action VARCHAR(100),
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS members_admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone_number);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(full_name);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- Insert default admin user
-- Username: admin
-- Password: admin123 (change this in production!)
-- This is a bcrypt hash of 'admin123'
INSERT INTO members_admins (username, password_hash, full_name, email)
VALUES (
    'admin',
    '$2b$10$YourHashWillBeReplacedByScript',
    'System Administrator',
    'admin@church.no'
)
ON CONFLICT (username) DO NOTHING;

-- Insert some sample members for testing (optional)
INSERT INTO members (full_name, phone_number, email, personnummer, address, city, postal_code, sms_consent, created_by)
VALUES
    ('Test Medlem 1', '+4712345678', 'test1@example.com', '01019012345', 'Test gate 1', 'Oslo', '0123', true, 'admin'),
    ('Test Medlem 2', '+4787654321', 'test2@example.com', '15059054321', 'Test vei 2', 'Bergen', '5000', true, 'admin'),
    ('Test Medlem 3', '+4798765432', 'test3@example.com', '20109098765', 'Test allé 3', 'Trondheim', '7000', false, 'admin')
ON CONFLICT DO NOTHING;

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO church_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO church_user;
