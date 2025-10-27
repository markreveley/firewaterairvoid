# Project Development Plan

## Current Focus
Testing new priority system and sub-items functionality.

## Next Actions (Priority Order)
- [ ] Run database migration for priority and completed fields
- [ ] Test star/priority sorting
- [ ] Test sub-items creation with task/URL/note types
- [ ] Test checkbox toggle for task sub-items

## Recent Changes (Last Session - 2025-10-26)
**Priority & Sorting System:**
- Added `priority` field to items table (0=normal, 1+=starred)
- Added `completed` field for task-type items
- Implemented star icon in item cards (ItemList.tsx:219-233)
- Updated sorting: Priority DESC → Deadline ASC → CreatedAt DESC
- Migration: supabase/migrations/20251025190000_add_priority_and_completed.sql

**Sub-Items System:**
- Added Notes/Items tabbed interface in ItemDetail (src/pages/ItemDetail.tsx:759-911)
- Three sub-item types: Task (fire), URL (void), Note (water)
- Task sub-items: checkbox + input field
- URL sub-items: title + URL fields on same line
- Note sub-items: simple input field
- Sub-items are regular items with parent_id set
- Checkbox toggle for completing task sub-items
- Click-to-navigate to sub-item details

**Previous Session (2025-10-25):**
- Pulled latest changes from remote (c9ba88e → d99ab0a)
- Split tag management into separate pages for project and category tags
- Added hierarchical tag system with parent/child relationships
- Implemented tag type system (project vs category tags)
- Updated tag filtering to support both parent and child tag selection

## Project Overview
Fire Water is a task/project management application that organizes items into five elemental types: fire, water, air, void, and earth. Each type serves different purposes and has different tag filtering capabilities.

## Key Architecture Decisions

### Tag System Architecture
- **Two tag types**: 'project' and 'category' tags stored in same table, differentiated by `type` column
- **Hierarchical structure**: Tags can have parent/child relationships via `parent_id` field
- **Type-specific filtering**:
  - Fire items: project tags only
  - Water items: both project and category tags
  - Air/Void/Earth items: category tags only
- **Unique constraint**: Tag names must be unique within parent context (same name allowed under different parents)
- **Hardcoded project tags**: FIRE_TAG_NAMES constant contains initial project tag names (Tourlab, Dirtwire, etc.)

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Backend**: Supabase (PostgreSQL + auth + real-time)
- **Data Fetching**: TanStack React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Testing**: Vitest + Testing Library

### Data Model
- **Items**: Core entity with fields: id, title, type, notes, status, url, tags, createdAt, deadline, parent_id, priority, completed
  - `priority`: Integer (0=normal, 1+=starred/high priority) - determines sort order
  - `completed`: Boolean (for task-type items, enables checkbox functionality)
- **Tags**: id, name, parent_id, type (project|category)
- **Item Types**: fire | water | air | void | earth
- **Relationships**: Items can have parent-child relationships via parent_id

## Important File Locations

### Core Application
- Entry point: src/App.tsx
- Main page: src/pages/Index.tsx
- Item detail/edit: src/pages/ItemDetail.tsx, src/pages/ItemDetailPage.tsx

### Tag Management
- Project tags page: src/pages/ProjectTagsManagement.tsx
- Category tags page: src/pages/CategoryTagsManagement.tsx
- Tag redirect: src/pages/TagsRedirect.tsx
- Tag filtering utils: src/utils/tagFilters.ts
- Tag constants: src/constants/tags.ts

### Components
- Item lists: src/components/ItemList.tsx, src/components/OverviewList.tsx
- Tag filter: src/components/TagFilter.tsx
- Status filter: src/components/StatusFilter.tsx
- Fire/Water toggle: src/components/FireWaterToggle.tsx

### Hooks & Utils
- Items hook: src/hooks/useItems.ts
- Tags hook: src/hooks/useTags.ts
- Tag filters: src/utils/tagFilters.ts (+ .test.ts)

### Database
- Supabase client: src/integrations/supabase/client.ts
- Type definitions: src/integrations/supabase/types.ts
- Migrations: supabase/migrations/

### Types
- Core types: src/types/index.ts

## Known Issues / Blockers
None currently.

## Development Context

### Tag System Evolution
The tag system recently underwent a major refactor:
1. Previously had single tag management page
2. Now split into ProjectTagsManagement and CategoryTagsManagement for better organization
3. Added type discrimination to support different tag types for different item types
4. Both pages share nearly identical UI/logic but filter by tag type
5. Each management page supports creating root tags and child tags (hierarchical structure)

### Tag Filtering Logic
- `getTagsForItemType()` returns appropriate tags based on item type
- Only root tags (parent_id = null) are shown in main filters
- Child tags are accessible via parent tag selection in TagFilter component
- URL params preserve filter state: type, projectTag, projectChildTag, categoryTags, categoryChildTags

### Priority & Sorting System
- **Star/Priority**: Click star icon in item card to toggle priority (0 → 1 or 1 → 0)
- **Sorting order**: Items sorted by priority DESC, then deadline ASC (nulls last), then created_at DESC
- **Visual feedback**: Yellow filled star for priority items
- **Use case**: Important items bubble to top of lists regardless of deadline/date

### Sub-Items System
- **Architecture**: Sub-items are regular items with `parent_id` field set to parent item's ID
- **Three types**:
  - Task (fire type): Has checkbox, status "To Do"/"Completed", uses `completed` field
  - URL (void type): Has title + URL fields
  - Note (water type): Simple title field
- **UI Location**: ItemDetail page → "Items" tab (alongside "Notes" tab)
- **Navigation**: Click sub-item row to navigate to its detail page
- **Completion**: Task sub-items show checkbox, toggles `completed` field
- **Display**: Parent items show child count, can expand to see all children

### Database Constraints
- Migration 20251025175117: Unique index on (name, parent_id) allowing same names in different contexts
- Migration 20251025181208: Added type column with check constraint for 'project' | 'category'
- Migration 20251025190000: Added priority (integer) and completed (boolean) fields with indexes
- Existing hardcoded tags (FIRE_TAG_NAMES) were migrated to type='project'

### UI Patterns
- Uses shadcn/ui Dialog components for edit/delete confirmations
- Inline parent tag assignment (can select parent when creating child tags)
- Visual hierarchy: child tags indented with ChevronRight icon
- Toast notifications for all CRUD operations
- Tabs component for Notes/Items split view in ItemDetail

## Testing & Running

### Local Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build
```

### Testing
```bash
npm test             # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:run     # Run tests once
npm run test:coverage # Run with coverage
```

### Deployment
- Platform: Lovable.dev
- Auto-deploys on git push to main
- Project URL: https://lovable.dev/projects/568ea099-30f2-4533-b443-d1768a09be20

## Questions / Needs Clarification
None currently.
