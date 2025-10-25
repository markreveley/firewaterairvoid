-- Add parent_id column to tags table for parent-child tag relationships
ALTER TABLE public.tags
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.tags(id) ON DELETE CASCADE;

-- Create index for better query performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON public.tags(parent_id);
