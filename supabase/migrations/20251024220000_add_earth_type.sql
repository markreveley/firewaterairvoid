-- Update items type check constraint to include 'earth'
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_type_check;
ALTER TABLE public.items ADD CONSTRAINT items_type_check CHECK (type IN ('fire', 'water', 'air', 'void', 'earth'));
