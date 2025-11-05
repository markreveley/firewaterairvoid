-- Update priority field to support 5 priority levels (1-5)
-- 1 = immediate (dark red)
-- 2 = pressing (red)
-- 3 = todo (orange)
-- 4 = paused (gray)
-- 5 = done (darker gray)

-- First, update existing priority values
-- Old: 0 = normal, 1 = starred
-- New: Map 1 (starred) to 1 (immediate), 0 (normal) to 3 (todo)
UPDATE public.items
SET priority = CASE
  WHEN priority = 1 THEN 1  -- starred items become immediate
  ELSE 3  -- normal items become todo
END;

-- Update the column comment
COMMENT ON COLUMN public.items.priority IS 'Priority level: 1=immediate, 2=pressing, 3=todo, 4=paused, 5=done. Lower values show first.';

-- Add a check constraint to ensure priority is between 1 and 5
ALTER TABLE public.items
ADD CONSTRAINT priority_range_check
CHECK (priority >= 1 AND priority <= 5);

-- Update the default value to 3 (todo)
ALTER TABLE public.items
ALTER COLUMN priority SET DEFAULT 3;
