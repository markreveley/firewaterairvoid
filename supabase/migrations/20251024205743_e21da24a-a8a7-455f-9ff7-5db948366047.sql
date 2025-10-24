-- Add url column to items table for void type items
ALTER TABLE public.items 
ADD COLUMN url TEXT;

COMMENT ON COLUMN items.url IS 'URL for void type items (web urls)';