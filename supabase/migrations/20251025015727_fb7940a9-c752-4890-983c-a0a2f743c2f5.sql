-- Add parent_id column to items table for parent-child relationships
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.items(id) ON DELETE SET NULL;

-- Create index for better query performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_items_parent_id ON public.items(parent_id);