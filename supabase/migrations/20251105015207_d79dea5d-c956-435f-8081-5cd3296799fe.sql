-- Update priority system from binary (0/1) to 5-level system (1-5)
-- Migration for 5-state priority with fire icon metaphor

-- Update existing data: starred items (priority=1) become immediate, others become todo
UPDATE public.items 
SET priority = CASE 
  WHEN priority = 1 THEN 1  -- starred → immediate
  ELSE 3  -- normal → todo
END;

-- Update default value to 3 (todo) for new items
ALTER TABLE public.items 
ALTER COLUMN priority SET DEFAULT 3;

-- Add constraint to ensure priority is between 1 and 5
ALTER TABLE public.items
ADD CONSTRAINT priority_range CHECK (priority >= 1 AND priority <= 5);

-- Add comment explaining the 5-level system
COMMENT ON COLUMN public.items.priority IS '5-level priority system: 1=immediate (dark red), 2=pressing (red), 3=todo (orange), 4=paused (gray), 5=done (dark gray)';