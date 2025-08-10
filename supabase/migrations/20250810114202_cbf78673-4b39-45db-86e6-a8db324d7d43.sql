-- Add foreign key constraint between reviews.user_id and profiles.user_id
ALTER TABLE public.reviews
ADD CONSTRAINT fk_reviews_user_id
FOREIGN KEY (user_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;