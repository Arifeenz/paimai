-- Drop the old constraint and add the updated one that includes 'restaurant'
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS itinerary_items_item_type_check;

-- Add the updated constraint that includes 'restaurant'  
ALTER TABLE itinerary_items ADD CONSTRAINT itinerary_items_item_type_check 
CHECK (item_type = ANY (ARRAY['activity'::text, 'hotel'::text, 'place'::text, 'restaurant'::text]));