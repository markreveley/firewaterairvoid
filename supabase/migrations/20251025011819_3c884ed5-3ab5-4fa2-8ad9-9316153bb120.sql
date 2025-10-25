-- Add parent_id column to items table for parent-child relationships
ALTER TABLE items ADD COLUMN parent_id uuid REFERENCES items(id) ON DELETE SET NULL;