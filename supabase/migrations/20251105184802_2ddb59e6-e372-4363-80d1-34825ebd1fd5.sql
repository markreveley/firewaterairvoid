-- Phase 1: Tag System Refactor - Type-Specific Independent Tags
-- This migration transforms the tag system so each type has its own independent tags

-- Step 0: Drop existing unique index and constraints to allow transformation
DROP INDEX IF EXISTS tags_name_parent_unique;
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_type_check;

-- Step 1: Rename all 'project' tags to 'fire' tags
UPDATE tags SET type = 'fire' WHERE type = 'project';

-- Step 2: Duplicate category tags for Earth, Air, and Void
-- We need to preserve the parent-child hierarchy

-- Create a temporary table to map old IDs to new IDs for each type
CREATE TEMP TABLE tag_id_mapping (
  original_id uuid,
  earth_id uuid,
  air_id uuid,
  void_id uuid
);

-- Duplicate root category tags (those with no parent_id)
WITH root_categories AS (
  SELECT id, name, type, parent_id, created_at 
  FROM tags 
  WHERE type = 'category' AND parent_id IS NULL
)
INSERT INTO tags (id, name, type, parent_id, created_at)
SELECT 
  gen_random_uuid(), name, 'earth', NULL::uuid, created_at
FROM root_categories
UNION ALL
SELECT 
  gen_random_uuid(), name, 'air', NULL::uuid, created_at
FROM root_categories
UNION ALL
SELECT 
  gen_random_uuid(), name, 'void', NULL::uuid, created_at
FROM root_categories;

-- Build the mapping for root tags
INSERT INTO tag_id_mapping (original_id, earth_id, air_id, void_id)
SELECT DISTINCT
  c.id,
  (SELECT t.id FROM tags t WHERE t.name = c.name AND t.type = 'earth' AND t.parent_id IS NULL LIMIT 1),
  (SELECT t.id FROM tags t WHERE t.name = c.name AND t.type = 'air' AND t.parent_id IS NULL LIMIT 1),
  (SELECT t.id FROM tags t WHERE t.name = c.name AND t.type = 'void' AND t.parent_id IS NULL LIMIT 1)
FROM tags c
WHERE c.type = 'category' AND c.parent_id IS NULL;

-- Duplicate child category tags (those with a parent_id)
WITH child_categories AS (
  SELECT c.id, c.name, c.type, c.parent_id, c.created_at,
         m.earth_id as parent_earth_id,
         m.air_id as parent_air_id,
         m.void_id as parent_void_id
  FROM tags c
  JOIN tag_id_mapping m ON c.parent_id = m.original_id
  WHERE c.type = 'category' AND c.parent_id IS NOT NULL
)
INSERT INTO tags (id, name, type, parent_id, created_at)
SELECT 
  gen_random_uuid(), name, 'earth', parent_earth_id, created_at
FROM child_categories
WHERE parent_earth_id IS NOT NULL
UNION ALL
SELECT 
  gen_random_uuid(), name, 'air', parent_air_id, created_at
FROM child_categories
WHERE parent_air_id IS NOT NULL
UNION ALL
SELECT 
  gen_random_uuid(), name, 'void', parent_void_id, created_at
FROM child_categories
WHERE parent_void_id IS NOT NULL;

-- Step 3: Remove old category tags
DELETE FROM tags WHERE type = 'category';

-- Step 4: Clear all water item tags
DELETE FROM item_tags 
WHERE item_id IN (
  SELECT id FROM items WHERE type = 'water'
);

-- Step 5: Add new constraint for the four element types
ALTER TABLE tags ADD CONSTRAINT tags_type_check 
  CHECK (type IN ('fire', 'earth', 'air', 'void'));

-- Step 6: Add new unique index that includes type
-- This allows same tag names across different types but prevents duplicates within a type
CREATE UNIQUE INDEX tags_name_parent_type_unique_idx 
  ON tags (name, COALESCE(parent_id::text, 'root'), type);

-- Add comment explaining the new tag system
COMMENT ON COLUMN tags.type IS 'Tag type must match item type. Fire items use fire tags, Earth uses earth tags, Air uses air tags, Void uses void tags. Water items have no tags.';

-- Clean up temp table
DROP TABLE tag_id_mapping;