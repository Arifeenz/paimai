-- Update the activities category check constraint to include 'nature'
ALTER TABLE activities 
DROP CONSTRAINT activities_category_check;

ALTER TABLE activities 
ADD CONSTRAINT activities_category_check 
CHECK (category = ANY (ARRAY['adventure'::text, 'cultural'::text, 'relaxing'::text, 'food'::text, 'attraction'::text, 'nature'::text]));