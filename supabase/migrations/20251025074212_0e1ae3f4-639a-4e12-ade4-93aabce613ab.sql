-- Add ON DELETE CASCADE to item_tags foreign keys for automatic cleanup
ALTER TABLE public.item_tags DROP CONSTRAINT IF EXISTS item_tags_item_id_fkey;
ALTER TABLE public.item_tags ADD CONSTRAINT item_tags_item_id_fkey 
  FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;

ALTER TABLE public.item_tags DROP CONSTRAINT IF EXISTS item_tags_tag_id_fkey;
ALTER TABLE public.item_tags ADD CONSTRAINT item_tags_tag_id_fkey 
  FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;