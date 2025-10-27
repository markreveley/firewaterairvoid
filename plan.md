# Project Development Plan

## 🤖 Context Management (Agent Instructions)
> **COMPACT-MODE**: When context is running low or I say "compact", "context-low", or "oom":
> - Return ≤30 lines of tool output unless I ask for more
> - Prefer `grep`, `head` over full file reads
> - Before showing >500 lines, ask: "Show all (≈X tokens) or summarise?"
> - Suggest collapsing large functions in-place with summary comments
>
> **Memory Model**: Git is the real long-term memory; plan.md is the index to that memory.

**📚 Full Documentation:**
- **DESIGN.md** - Architecture decisions, technical rationale, database schema (parent/child vs sub-items)
- **USER_STORIES.md** - User workflows, feature descriptions, edge cases
- **STRATEGY.md** - Business strategy, commercialization analysis, pricing
- **plan.md** (this file) - Lightweight index, current status, work log

## Current Status
**Working on**: is_subitem flag implementation to distinguish parent/child relationships from sub-items
**Blocked on**: Need to run migration file `supabase/migrations/20251027180000_add_is_subitem_flag.sql`
**Next**: Run migration via Lovable, test both relationship types work independently

## Next Actions (Priority Order)
- [ ] Add `is_subitem` boolean column to items table (default false)
- [ ] Update queries to filter by `is_subitem` flag
- [ ] Update ItemDetail to set `is_subitem=true` when creating via Items tab
- [ ] Test both parent/child arrows and sub-items work correctly
- [ ] Update plan.md when complete

## Work Log
--------------------------------------------------
2025-10-27 – is_subitem distinction
- Goal: Separate parent/child relationships (hierarchical links) from sub-items (scoped content)
- Key files: supabase/migrations/20251027180000_add_is_subitem_flag.sql, src/hooks/useItems.ts, src/pages/ItemDetailPage.tsx, src/pages/ItemDetail.tsx, DESIGN.md, USER_STORIES.md
- Decision: Added boolean flag instead of overloading parent_id semantics; documented two relationship types in DESIGN.md
- Next: Run migration via Lovable, test both relationship types independently
--------------------------------------------------
2025-10-27 – priority system & sub-items UI
- Goal: Add star-based priority + Notes/Items tabbed interface with three sub-item types
- Key files: supabase/migrations/20251025190000_add_priority_and_completed.sql, src/components/ItemList.tsx, src/pages/ItemDetail.tsx, src/hooks/useItems.ts
- Decision: priority field for sorting, completed field for tasks; Task/URL/Note sub-types mapped to fire/void/water
- Next: (completed - moved to is_subitem work)
--------------------------------------------------
2025-10-25 – hierarchical tag system
- Goal: Split project/category tags, add parent/child tag relationships
- Key files: src/pages/ProjectTagsManagement.tsx, src/pages/CategoryTagsManagement.tsx, src/utils/tagFilters.ts
- Decision: Same table with type column, parent_id for hierarchy, unique constraint on (name, parent_id)
- Next: (completed)
--------------------------------------------------

> **Pruning**: When work log exceeds ~10 entries or plan.md exceeds 200 lines, move older entries to `docs/archive/plan-YYYY-MM.md`, commit, and keep only the most recent 5-7 entries here.

## Project Overview
Fire Water is a task/project management application that organizes items into five elemental types: fire, water, air, void, and earth. Each type serves different purposes and has different tag filtering capabilities.

**Tech Stack**: React 18 + TypeScript + Vite, shadcn/ui, Supabase (PostgreSQL), TanStack Query

**Key Architectural Decisions**: See DESIGN.md for full details on:
- Parent/child relationships vs. sub-items distinction (is_subitem flag)
- Tag system (project/category types, hierarchical structure)
- Item type behaviors and filtering rules
- Database schema and constraints

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

## Development Context (Quick Reference)

### Priority & Sorting
- Click star icon to toggle priority (0 ↔ 1)
- Sort order: Priority DESC → Deadline ASC → CreatedAt DESC
- Yellow filled star = prioritized item

### Sub-Items System
- See DESIGN.md for full parent/child vs. sub-items distinction
- Three types: Task (fire), URL (void), Note (water)
- UI: ItemDetail → "Items" tab
- Migration pending: `is_subitem` flag to distinguish from child items

### Tag System
- Two types: project (fire only) and category (water/air/void/earth)
- Hierarchical: tags can have parent/child relationships
- See src/utils/tagFilters.ts for filtering logic

### Recent Migrations
- 20251025190000: Added priority and completed fields
- 20251027180000: Added is_subitem flag (PENDING - needs Lovable to run)

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
