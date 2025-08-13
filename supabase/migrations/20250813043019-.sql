-- Fix the itinerary_items check constraint to allow all item types used in the application
ALTER TABLE itinerary_items 
DROP CONSTRAINT IF EXISTS check_item_type_extended;

ALTER TABLE itinerary_items 
ADD CONSTRAINT check_item_type_extended 
CHECK (item_type = ANY (ARRAY['destination'::text, 'activity'::text, 'hotel'::text, 'place'::text, 'restaurant'::text]));