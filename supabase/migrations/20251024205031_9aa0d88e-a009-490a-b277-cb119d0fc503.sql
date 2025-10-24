-- Update the items table type constraint to include 'air'
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_type_check;
ALTER TABLE public.items ADD CONSTRAINT items_type_check CHECK (type IN ('fire', 'water', 'air', 'void'));

COMMENT ON COLUMN items.type IS 'Item type: fire (actions), water (intentions), air (analysis), void (web urls)';