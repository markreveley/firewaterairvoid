-- Add notes and status columns to items table
ALTER TABLE items ADD COLUMN notes text;
ALTER TABLE items ADD COLUMN status text;

-- Rename content to title for clarity
ALTER TABLE items RENAME COLUMN content TO title;