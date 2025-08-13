-- Fix foreign key constraints for itinerary_items table
-- Remove existing foreign key constraints that are too restrictive
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS fk_itinerary_items_activities;
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS fk_itinerary_items_hotels;
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS fk_itinerary_items_places;
ALTER TABLE itinerary_items DROP CONSTRAINT IF EXISTS fk_itinerary_items_restaurants;

-- Add proper foreign key constraint to itineraries table
ALTER TABLE itinerary_items 
ADD CONSTRAINT fk_itinerary_items_itinerary 
FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE;

-- Note: We're not adding foreign keys to specific item tables because item_id 
-- can reference different tables based on item_type, which is valid in this design