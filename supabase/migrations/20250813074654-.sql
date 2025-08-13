-- Create transportation table for car bookings, rentals, private cars, etc.
CREATE TABLE public.transportation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'car_rental', 'private_car', 'taxi', 'bus', 'train', etc.
  destination_id UUID,
  price NUMERIC,
  image_url TEXT,
  rating NUMERIC DEFAULT 0,
  contact_info TEXT,
  features TEXT[], -- array of features like 'air_conditioning', 'gps', 'driver_included', etc.
  capacity INTEGER, -- number of passengers
  availability_hours TEXT, -- operating hours
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transportation ENABLE ROW LEVEL SECURITY;

-- Create policies for transportation
CREATE POLICY "Anyone can view transportation" 
ON public.transportation 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage transportation" 
ON public.transportation 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transportation_updated_at
BEFORE UPDATE ON public.transportation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();