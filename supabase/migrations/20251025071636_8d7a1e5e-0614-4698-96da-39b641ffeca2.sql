-- Remove the claude tag if it exists
DELETE FROM public.tags WHERE name = 'claude';