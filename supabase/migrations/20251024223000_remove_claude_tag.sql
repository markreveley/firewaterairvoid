-- Remove 'claude' tag if it exists
DELETE FROM public.item_tags WHERE tag_id IN (SELECT id FROM public.tags WHERE name = 'claude');
DELETE FROM public.tags WHERE name = 'claude';
