-- Add recurrence fields for repeating water items
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS recurrence_type TEXT NOT NULL DEFAULT 'none' CHECK (recurrence_type IN ('none', 'weekly', 'yearly'));
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMPTZ;

-- Add index for recurrence queries
CREATE INDEX IF NOT EXISTS idx_items_recurrence ON public.items(recurrence_type) WHERE recurrence_type != 'none';

-- Add comments explaining recurrence usage
COMMENT ON COLUMN public.items.recurrence_type IS 'Recurrence pattern for water items. none=one-time event, weekly=repeats every 7 days, yearly=repeats annually';
COMMENT ON COLUMN public.items.recurrence_end_date IS 'Optional end date for recurring items. NULL means recur indefinitely';