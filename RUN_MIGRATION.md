# Run This Migration in Lovable

## Migration File
The migration is located at:
`supabase/migrations/20251103224411_add_recurrence_fields.sql`

## Instructions for Lovable

### Option 1: Auto-detection (Recommended)
1. Push this code to your repository
2. Lovable should automatically detect the new migration file
3. You'll see a prompt to run pending migrations
4. Click "Run Migration"

### Option 2: Manual SQL Execution
If auto-detection doesn't work, run this SQL in Lovable's database console:

```sql
-- Add recurrence fields for repeating water items
ALTER TABLE public.items ADD COLUMN recurrence_type TEXT NOT NULL DEFAULT 'none' CHECK (recurrence_type IN ('none', 'weekly', 'yearly'));
ALTER TABLE public.items ADD COLUMN recurrence_end_date TIMESTAMPTZ;

-- Add index for recurrence queries
CREATE INDEX idx_items_recurrence ON public.items(recurrence_type) WHERE recurrence_type != 'none';

-- Add comments explaining recurrence usage
COMMENT ON COLUMN public.items.recurrence_type IS 'Recurrence pattern for water items. none=one-time event, weekly=repeats every 7 days, yearly=repeats annually';
COMMENT ON COLUMN public.items.recurrence_end_date IS 'Optional end date for recurring items. NULL means recur indefinitely';
```

## Verification
After running, test by creating a water item with:
1. A deadline date
2. Set "Repeat" to "Weekly" or "Yearly"
3. Save and view the calendar - you should see recurring instances!

## Troubleshooting
If recurring events still don't show:
1. Check browser console (F12) for any errors
2. Look for console logs showing `recurrence_type` values
3. Verify the columns were added: Check your database schema in Lovable
