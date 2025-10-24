-- Update the tags table to support 'void' type
-- No schema change needed as type is text, but we'll add a check constraint for clarity
ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_type_check;
ALTER TABLE tags ADD CONSTRAINT tags_type_check CHECK (type IN ('fire', 'water', 'void'));

COMMENT ON COLUMN tags.type IS 'Tag type: fire (deadlines), water (intentions), void (resources)';