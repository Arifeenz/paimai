-- Add foreign key constraints for itinerary_items to content tables
-- Note: These are optional foreign keys since an itinerary_item can reference different types of content

-- Foreign key to activities table
ALTER TABLE public.itinerary_items
ADD CONSTRAINT fk_itinerary_items_activities
FOREIGN KEY (item_id)
REFERENCES public.activities(id)
ON DELETE CASCADE
NOT VALID;

-- Foreign key to hotels table  
ALTER TABLE public.itinerary_items
ADD CONSTRAINT fk_itinerary_items_hotels
FOREIGN KEY (item_id)
REFERENCES public.hotels(id)
ON DELETE CASCADE
NOT VALID;

-- Foreign key to places table
ALTER TABLE public.itinerary_items
ADD CONSTRAINT fk_itinerary_items_places
FOREIGN KEY (item_id)
REFERENCES public.places(id)
ON DELETE CASCADE
NOT VALID;

-- Foreign key to restaurants table
ALTER TABLE public.itinerary_items
ADD CONSTRAINT fk_itinerary_items_restaurants
FOREIGN KEY (item_id)
REFERENCES public.restaurants(id)
ON DELETE CASCADE
NOT VALID;

-- Validate the constraints (but allow existing invalid data)
ALTER TABLE public.itinerary_items VALIDATE CONSTRAINT fk_itinerary_items_activities;
ALTER TABLE public.itinerary_items VALIDATE CONSTRAINT fk_itinerary_items_hotels;
ALTER TABLE public.itinerary_items VALIDATE CONSTRAINT fk_itinerary_items_places;
ALTER TABLE public.itinerary_items VALIDATE CONSTRAINT fk_itinerary_items_restaurants;