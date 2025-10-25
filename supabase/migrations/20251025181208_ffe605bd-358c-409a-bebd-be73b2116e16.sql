-- Add type column to tags table to distinguish between project and category tags
ALTER TABLE public.tags ADD COLUMN type TEXT NOT NULL DEFAULT 'category';

-- Update existing tags that match FIRE_TAG_NAMES to be project tags
UPDATE public.tags 
SET type = 'project' 
WHERE name IN ('Tourlab', 'Dirtwire', 'Touring', 'Disorder', 'Merch', 'Emma', 'Shane', 'Odin', 'Home', 'Finances', 'Dev');

-- Add a check constraint to ensure type is either 'project' or 'category'
ALTER TABLE public.tags ADD CONSTRAINT tags_type_check CHECK (type IN ('project', 'category'));