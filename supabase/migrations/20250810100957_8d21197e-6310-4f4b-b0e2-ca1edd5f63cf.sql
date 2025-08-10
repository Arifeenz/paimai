-- Drop the existing constraint
ALTER TABLE public.reviews DROP CONSTRAINT reviews_item_type_check;

-- Add the new constraint that includes 'destination'
ALTER TABLE public.reviews ADD CONSTRAINT reviews_item_type_check 
CHECK (item_type = ANY (ARRAY['activity'::text, 'hotel'::text, 'place'::text, 'destination'::text, 'restaurant'::text]));