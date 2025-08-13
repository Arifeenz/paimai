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

-- อัปเดต updated_at trigger สำหรับ hotels ถ้ายังไม่มี
CREATE TRIGGER update_hotels_updated_at
BEFORE UPDATE ON public.hotels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- อัปเดต updated_at trigger สำหรับ activities ถ้ายังไม่มี
CREATE TRIGGER update_activities_updated_at
BEFORE UPDATE ON public.activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- อัปเดต updated_at trigger สำหรับ places ถ้ายังไม่มี
CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON public.places
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- อัปเดต updated_at trigger สำหรับ restaurants ถ้ายังไม่มี
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();