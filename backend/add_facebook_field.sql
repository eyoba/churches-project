-- Add facebook column to churches table
ALTER TABLE churches ADD COLUMN IF NOT EXISTS facebook VARCHAR(500);

-- Update field_labels to include facebook label
UPDATE churches
SET field_labels = field_labels || '{"facebook": "Facebook"}'::jsonb
WHERE field_labels IS NOT NULL;
