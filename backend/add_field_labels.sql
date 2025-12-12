-- Add field_labels column to churches table for customizable field names
ALTER TABLE churches ADD COLUMN IF NOT EXISTS field_labels JSONB DEFAULT '{
  "pastor_name": "Pastor",
  "address": "Address",
  "phone": "Phone",
  "email": "Email",
  "website": "Website",
  "description": "Description",
  "mission_statement": "Mission Statement",
  "sunday_service_time": "Sunday Service",
  "wednesday_service_time": "Wednesday Service",
  "other_service_times": "Other Services"
}'::jsonb;

-- Update existing churches with default labels
UPDATE churches
SET field_labels = '{
  "pastor_name": "Pastor",
  "address": "Address",
  "phone": "Phone",
  "email": "Email",
  "website": "Website",
  "description": "Description",
  "mission_statement": "Mission Statement",
  "sunday_service_time": "Sunday Service",
  "wednesday_service_time": "Wednesday Service",
  "other_service_times": "Other Services"
}'::jsonb
WHERE field_labels IS NULL;
