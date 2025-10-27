-- Add priority and completed columns to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS priority integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false;

-- Create an index on priority for better query performance
CREATE INDEX IF NOT EXISTS idx_items_priority ON public.items(priority DESC);

-- Create an index on completed for filtering
CREATE INDEX IF NOT EXISTS idx_items_completed ON public.items(completed);