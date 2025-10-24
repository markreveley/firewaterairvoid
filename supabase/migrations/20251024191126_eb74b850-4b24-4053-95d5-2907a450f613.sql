-- Add type column to items table
ALTER TABLE public.items 
ADD COLUMN type TEXT NOT NULL DEFAULT 'void' CHECK (type IN ('fire', 'water', 'void'));

-- Remove type column from tags table
ALTER TABLE public.tags 
DROP COLUMN type;