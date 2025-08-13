-- เพิ่มคอลัมน์ halal ให้กับตาราง restaurants
ALTER TABLE public.restaurants 
ADD COLUMN halal BOOLEAN DEFAULT false;