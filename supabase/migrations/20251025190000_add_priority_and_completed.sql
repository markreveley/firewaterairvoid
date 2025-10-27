-- Add priority field for starring items (higher priority = shows first)
ALTER TABLE public.items ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;

-- Add completed field for task-type sub-items
ALTER TABLE public.items ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;

-- Add index for priority sorting
CREATE INDEX idx_items_priority ON public.items(priority DESC, deadline ASC NULLS LAST, created_at DESC);

-- Add comment explaining priority usage
COMMENT ON COLUMN public.items.priority IS 'Priority level for item. Higher values show first. 0=normal, 1+=starred/high priority';
COMMENT ON COLUMN public.items.completed IS 'Completion status for task-type items. Used for checkbox functionality in sub-items';
