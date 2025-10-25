-- Drop the existing unique constraint on tag names
ALTER TABLE public.tags DROP CONSTRAINT IF EXISTS tags_name_key;

-- Add a new unique constraint that allows same names for different parent contexts
-- This uses COALESCE to treat NULL parent_id as a special 'root' value
CREATE UNIQUE INDEX tags_name_parent_unique ON public.tags (name, COALESCE(parent_id::text, 'root'));