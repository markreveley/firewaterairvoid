-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('fire', 'water')),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create junction table for items and tags
CREATE TABLE public.item_tags (
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Public can read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public can insert tags" ON public.tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update tags" ON public.tags FOR UPDATE USING (true);
CREATE POLICY "Public can delete tags" ON public.tags FOR DELETE USING (true);

CREATE POLICY "Public can read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public can insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Public can delete items" ON public.items FOR DELETE USING (true);

CREATE POLICY "Public can read item_tags" ON public.item_tags FOR SELECT USING (true);
CREATE POLICY "Public can insert item_tags" ON public.item_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete item_tags" ON public.item_tags FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX idx_tags_type ON public.tags(type);
CREATE INDEX idx_item_tags_item ON public.item_tags(item_id);
CREATE INDEX idx_item_tags_tag ON public.item_tags(tag_id);