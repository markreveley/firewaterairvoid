# Database Migration Instructions

## Recurrence Fields Migration

To enable recurring water items, you need to apply a database migration that adds two new columns to the `items` table.

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/20251103224411_add_recurrence_fields.sql`
5. Run the query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

### Migration Contents

The migration adds:
- `recurrence_type` column (TEXT): 'none', 'weekly', or 'yearly'
- `recurrence_end_date` column (TIMESTAMPTZ): Optional end date for recurring items
- Index on `recurrence_type` for faster queries
- Comments explaining field usage

### Verification

After running the migration, you can verify it worked by running this query in the SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'items'
AND column_name IN ('recurrence_type', 'recurrence_end_date');
```

You should see both columns listed.
