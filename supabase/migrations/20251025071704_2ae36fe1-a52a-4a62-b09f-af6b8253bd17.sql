-- Add parent_id column to tags table for parent-child tag support
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.tags(id) ON DELETE CASCADE;