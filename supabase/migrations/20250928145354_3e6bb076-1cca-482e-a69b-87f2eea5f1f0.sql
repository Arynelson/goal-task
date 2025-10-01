-- Add language preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN language_preference text DEFAULT 'pt' CHECK (language_preference IN ('pt', 'en'));