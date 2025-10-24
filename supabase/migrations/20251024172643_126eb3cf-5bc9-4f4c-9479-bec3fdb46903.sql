-- Add deadline column to items table
ALTER TABLE public.items ADD COLUMN deadline TIMESTAMPTZ;

-- Remove deadline from tags table since it's now on items
ALTER TABLE public.tags DROP COLUMN IF EXISTS deadline;