-- Create trashed_items table to store deleted items
CREATE TABLE public.trashed_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_id UUID NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  status TEXT,
  url TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  trashed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trashed_items ENABLE ROW LEVEL SECURITY;

-- Create policies for trashed_items
CREATE POLICY "Public can read trashed_items" 
ON public.trashed_items 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert trashed_items" 
ON public.trashed_items 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can delete trashed_items" 
ON public.trashed_items 
FOR DELETE 
USING (true);