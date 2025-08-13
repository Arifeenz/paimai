-- Update activities category constraint to fix relaxation category
ALTER TABLE activities DROP CONSTRAINT activities_category_check;
ALTER TABLE activities ADD CONSTRAINT activities_category_check 
  CHECK (category = ANY (ARRAY['adventure', 'cultural', 'relaxation', 'food', 'attraction', 'nature']));

-- Update restaurants category constraint to add cafe and update street food name
ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_category_check;
ALTER TABLE restaurants ADD CONSTRAINT restaurants_category_check 
  CHECK (category = ANY (ARRAY['thai', 'international', 'seafood', 'street-food', 'fine-dining', 'cafe']));

-- Update existing street-food entries to use new naming if any exist
UPDATE restaurants SET category = 'street-food' WHERE category = 'ร้านอาหารข้างทาง';