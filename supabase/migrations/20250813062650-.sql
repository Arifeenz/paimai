-- เพิ่มคอลัมน์ google_maps_url ให้กับตาราง hotels
ALTER TABLE public.hotels 
ADD COLUMN google_maps_url TEXT;

-- เพิ่มคอลัมน์ google_maps_url ให้กับตาราง activities
ALTER TABLE public.activities 
ADD COLUMN google_maps_url TEXT;

-- เพิ่มคอลัมน์ google_maps_url ให้กับตาราง places
ALTER TABLE public.places 
ADD COLUMN google_maps_url TEXT;

-- เพิ่มคอลัมน์ google_maps_url ให้กับตาราง restaurants
ALTER TABLE public.restaurants 
ADD COLUMN google_maps_url TEXT;