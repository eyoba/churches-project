-- Add pastor_title column to churches table
ALTER TABLE churches ADD COLUMN IF NOT EXISTS pastor_title VARCHAR(100);

-- Display confirmation
SELECT 'pastor_title column added to churches table' as status;
SELECT id, name, pastor_name, pastor_title FROM churches;
