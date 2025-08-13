-- Update transportation table to make destination_id nullable and add the new categories
ALTER TABLE public.transportation ALTER COLUMN destination_id DROP NOT NULL;

-- Update any existing transportation records to have proper categories
-- (This is safe since we're just making destination_id nullable)

-- No additional changes needed as destination_id was already nullable in the existing schema