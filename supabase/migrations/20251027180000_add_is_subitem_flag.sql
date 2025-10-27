-- Add is_subitem flag to distinguish parent/child relationships from sub-items
-- See DESIGN.md for full explanation of this architectural decision

ALTER TABLE public.items ADD COLUMN is_subitem BOOLEAN NOT NULL DEFAULT false;

-- Add index for efficient filtering
CREATE INDEX idx_items_is_subitem ON public.items(is_subitem) WHERE is_subitem = true;

-- Add comments explaining the two relationship types
COMMENT ON COLUMN public.items.is_subitem IS 'Distinguishes sub-items (scoped content, only in Items tab) from child items (hierarchical links, visible as cards). When parent_id IS set AND is_subitem IS true: sub-item. When parent_id IS set AND is_subitem IS false: child item with arrows.';

-- Existing items with parent_id keep is_subitem=false (preserve hierarchical relationships)
-- New items created via Items tab will have is_subitem=true
