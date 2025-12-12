-- Add display_order column to churches table
ALTER TABLE churches ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set default display order based on current order (id)
UPDATE churches
SET display_order = id
WHERE display_order = 0 OR display_order IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_churches_display_order ON churches(display_order);
