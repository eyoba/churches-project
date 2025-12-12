-- ============================================
-- ENHANCED DATABASE FOR MULTI-CHURCH SYSTEM
-- ============================================

-- Churches table (expanded)
CREATE TABLE churches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, -- URL-friendly name
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    website VARCHAR(255),
    established DATE,
    
    -- Pastor/Staff info
    pastor_name VARCHAR(100),
    pastor_phone VARCHAR(50),
    pastor_email VARCHAR(100),
    pastor_bio TEXT,
    
    -- Service times
    sunday_service_time VARCHAR(100),
    wednesday_service_time VARCHAR(100),
    other_service_times TEXT,
    
    -- Description
    description TEXT,
    mission_statement TEXT,
    
    -- Settings
    is_active BOOLEAN DEFAULT true,
    logo_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Church admins (separate from members)
CREATE TABLE church_admins (
    id SERIAL PRIMARY KEY,
    church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News/Announcements
CREATE TABLE church_news (
    id SERIAL PRIMARY KEY,
    church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES church_admins(id),
    published_date TIMESTAMP,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE church_events (
    id SERIAL PRIMARY KEY,
    church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50), -- weekly, monthly, etc.
    created_by INTEGER REFERENCES church_admins(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Photo gallery
CREATE TABLE church_photos (
    id SERIAL PRIMARY KEY,
    church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    uploaded_by INTEGER REFERENCES church_admins(id),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members (for SMS)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    church_id INTEGER REFERENCES churches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    date_of_birth DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS logs
CREATE TABLE sms_logs (
    id SERIAL PRIMARY KEY,
    church_id INTEGER REFERENCES churches(id),
    sent_by INTEGER REFERENCES church_admins(id),
    message TEXT NOT NULL,
    recipient_count INTEGER,
    recipients TEXT[], -- Array of phone numbers
    status VARCHAR(50),
    cost DECIMAL(10, 4),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_churches_slug ON churches(slug);
CREATE INDEX idx_church_news_church ON church_news(church_id);
CREATE INDEX idx_church_events_church ON church_events(church_id);
CREATE INDEX idx_church_photos_church ON church_photos(church_id);
CREATE INDEX idx_members_church ON members(church_id);
CREATE INDEX idx_sms_logs_church ON sms_logs(church_id);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample churches
INSERT INTO churches (name, slug, address, phone, email, pastor_name, pastor_email, 
    sunday_service_time, description, mission_statement) VALUES
('First Baptist Church Bergen', 'first-baptist-bergen', 
    'Strandgaten 123, 5013 Bergen, Norway', '+47 55 123 456', 'contact@firstbaptist.no',
    'Pastor John Hansen', 'pastor.john@firstbaptist.no',
    'Sunday 10:00 AM & 6:00 PM',
    'A vibrant community of faith serving Bergen for over 70 years.',
    'To share the love of Christ and serve our community.'),

('Grace Community Church', 'grace-community',
    'Kaigaten 45, 5015 Bergen, Norway', '+47 55 234 567', 'info@gracechurch.no',
    'Pastor Sarah Olsen', 'sarah@gracechurch.no',
    'Sunday 11:00 AM',
    'United in faith, growing together in love and service.',
    'Building a community that reflects God''s grace.'),

('Hope Fellowship', 'hope-fellowship',
    'Nordnesveien 78, 5005 Bergen, Norway', '+47 55 345 678', 'hello@hopefellowship.no',
    'Pastor Erik Andersen', 'erik@hopefellowship.no',
    'Sunday 10:30 AM',
    'Where hope meets faith and community thrives.',
    'Spreading hope through faith and fellowship.');

-- Insert church admins (password: admin123 for all)
INSERT INTO church_admins (church_id, username, email, password_hash, full_name) VALUES
(1, 'admin.first', 'admin@firstbaptist.no', 
    '$2b$10$rKvVPz4SJk7qF8CqKQN9qOGJHhE3tZYJlFQZGqGqGqGqGqGqGqGqG', 'John Hansen'),
(2, 'admin.grace', 'admin@gracechurch.no', 
    '$2b$10$rKvVPz4SJk7qF8CqKQN9qOGJHhE3tZYJlFQZGqGqGqGqGqGqGqGqG', 'Sarah Olsen'),
(3, 'admin.hope', 'admin@hopefellowship.no', 
    '$2b$10$rKvVPz4SJk7qF8CqKQN9qOGJHhE3tZYJlFQZGqGqGqGqGqGqGqGqG', 'Erik Andersen');

-- Insert sample news
INSERT INTO church_news (church_id, title, content, author_id, published_date, is_published) VALUES
(1, 'Welcome to Our New Website', 'We are excited to launch our new website! Stay tuned for updates.', 1, NOW(), true),
(2, 'Christmas Service Schedule', 'Join us for special Christmas services this December.', 2, NOW(), true),
(3, 'Youth Group Meeting', 'Youth group meets every Friday at 7 PM. All teenagers welcome!', 3, NOW(), true);

-- Insert sample events
INSERT INTO church_events (church_id, title, description, event_date, location, created_by) VALUES
(1, 'Sunday Worship', 'Join us for our weekly worship service', '2024-12-15 10:00:00', 'Main Sanctuary', 1),
(2, 'Bible Study', 'Weekly Bible study and discussion', '2024-12-18 19:00:00', 'Fellowship Hall', 2),
(3, 'Community Outreach', 'Serving our local community', '2024-12-20 14:00:00', 'City Center', 3);

-- Insert sample members
INSERT INTO members (church_id, name, phone, email) VALUES
(1, 'Ole Nilsen', '+4791234567', 'ole@example.no'),
(1, 'Kari Jensen', '+4791234568', 'kari@example.no'),
(2, 'Lars Pedersen', '+4791234569', 'lars@example.no'),
(2, 'Anna Berg', '+4791234570', 'anna@example.no'),
(3, 'Per Hansen', '+4791234571', 'per@example.no'),
(3, 'Ingrid Larsen', '+4791234572', 'ingrid@example.no');
